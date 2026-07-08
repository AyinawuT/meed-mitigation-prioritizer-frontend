/**
 * Shared pipeline runner — callable from any page that needs prioritization results.
 *
 * RegulationsLaws calls this at step 3 so users see excluded/flagged actions
 * before completing the full wizard. Processing calls it again at the end with
 * any updated strategic preferences — the result overwrites the same localStorage key.
 */

import { CITIES } from "@/data/cities";
import actionsData from "@/data/actions.json";
import mockRequest from "@/data/prioritizerRequestMock.json";
import {
  callPrioritize,
  type FrontendCityInput,
  type FrontendCityEmissionsData,
  type PrioritizerApiCityResult,
} from "@/lib/hiapApi";
import type { PipelineResult, RankedAction, LegalData, LegalExcludedAction } from "@/lib/scoringPipeline";
import { PIPELINE_RESULT_SCHEMA_VERSION } from "@/lib/scoringPipeline";

// ─── Internal types matching the API response shape ───────────────────────────

type LegalEvidence = {
  assessment_present?: boolean;
  assessment_missing?: boolean;
  verdict_category?: string | null;
  component_score?: number;
  ownership_category?: string | null;
  ownership_score?: number;
  ownership_description?: string | null;
  ownership_description_es?: string | null;
  restrictions_category?: string | null;
  restrictions_score?: number;
  restrictions_description?: string | null;
  restrictions_description_es?: string | null;
  legal_justification?: string | null;
  legal_justification_en?: string | null;
  legal_references?: string[];
};

type EvidenceSummary = {
  impact?: {
    emissions_reduction_component_score?: number;
    timeline_component_score?: number;
  };
  alignment?: {
    policy_component_score?: number;
    sector_component_score?: number;
    co_benefit_component_score?: number;
    timeframe_component_score?: number;
  };
  feasibility?: {
    legal?: LegalEvidence;
    legal_component_score?: number;
    // v1 flat field (legacy)
    mitigation_feasibility_component_score?: number;
    // v2+ nested object (current backend)
    mitigation_feasibility?: {
      component_score?: number;
      component_source?: string;
      score_present?: boolean;
      score_missing?: boolean;
    };
  };
};

// Backend schema: rich legal data lives in hfEv.legal_assessment_summary (current backend).
// hfEv.legal is a legacy v2+ field that may not be present.
type HardFilterEvidence = {
  discard_reason?: string | null;
  legal_assessment_present?: boolean;
  legal_verdict_category?: "blocked" | "conditional" | "enabled" | null;
  legal_verdict_score?: number | null;
  legal_hard_filter_blocked?: boolean;
  confirmed_exclusion?: boolean;
  legal?: LegalEvidence;
  legal_assessment_summary?: {
    gpc_sector?: string | null;
    ownership_category?: string | null;
    ownership_score?: number | null;
    ownership_description?: string | null;
    ownership_description_es?: string | null;
    restrictions_category?: string | null;
    restrictions_score?: number | null;
    restrictions_description?: string | null;
    restrictions_description_es?: string | null;
    legal_justification?: string | null;
    legal_justification_en?: string | null;
    legal_references?: string[];
  } | null;
};

// ─── Local action lookup ──────────────────────────────────────────────────────

type LocalActionRecord = {
  actionId: string;
  actionName: string;
  actionCategory: string;
  actionSubcategory: string;
  costInvestmentNeeded: string;
  timelineForImplementation: string;
  description: string;
  emissions?: { gpc_reference_number: string[] };
};

const LOCAL_ACTIONS = (actionsData as { actions: LocalActionRecord[] }).actions;
const LOCAL_ACTION_MAP = new Map(LOCAL_ACTIONS.map((a) => [a.actionId, a]));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gpcToSectorTag(gpcRefs: string[]): string {
  if (!gpcRefs.length) return "cross_sector";
  const prefix = gpcRefs[0].split(".")[0];
  switch (prefix) {
    case "I":   return "stationary_energy";
    case "II":  return "transportation";
    case "III": return "waste";
    case "IV":  return "ippu";
    case "V":   return "afolu";
    default:    return "cross_sector";
  }
}

function sumGpcEmissions(gpcData: FrontendCityEmissionsData["gpcData"]): number {
  let total = 0;
  for (const entry of Object.values(gpcData)) {
    for (const activity of entry.activities ?? []) {
      total += activity.totalEmissions ?? 0;
    }
  }
  return total;
}

// Sector display name → API snake_case tag
const SECTOR_DISPLAY_TO_TAG: Record<string, string> = {
  "Stationary Energy":                                         "stationary_energy",
  "Transportation":                                            "transportation",
  "Waste":                                                     "waste",
  "Industrial Processes & Product Use (IPPU)":                 "ippu",
  "Agriculture, Forestry & Other Land Use (AFOLU)":            "afolu",
};

function toSectorTags(displayNames: string[]): string[] {
  return displayNames
    .map((n) => SECTOR_DISPLAY_TO_TAG[n])
    .filter((t): t is string => Boolean(t));
}

const VALID_TIMEFRAMES = new Set(["short", "medium", "long", "no_preference"]);

// ─── Sanitize emissions ───────────────────────────────────────────────────────

export function sanitizeEmissionsData(
  data: FrontendCityEmissionsData
): FrontendCityEmissionsData {
  return {
    ...data,
    gpcData: Object.fromEntries(
      Object.entries(data.gpcData).map(([ref, entry]) => [
        ref,
        {
          notationKey: entry.notationKey,
          activities: entry.activities.map((raw) => {
            const a = raw as typeof raw & { activityName?: string };
            return {
              activityType: a.activityType ?? a.activityName ?? null,
              totalEmissions: a.totalEmissions,
              totalEmissionsUnit: a.totalEmissionsUnit,
              activityValue: a.activityValue,
              activityUnit: a.activityUnit,
              dataSource: a.dataSource,
              notationKey: a.notationKey,
            };
          }),
        },
      ])
    ),
  };
}

// ─── Build city input ─────────────────────────────────────────────────────────

export function buildCityInput(locode: string): FrontendCityInput {
  const storageKey = `hiap:${locode}:strategic:form`;
  let sectorDisplayNames: string[] = [];
  let strategicCoBenefitKeys: string[] = [];
  let timelineValues: string[] = [];
  let savedWeights:
    | { impact: number; alignment: number; feasibility: number }
    | undefined;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const saved = JSON.parse(raw) as {
        sectors?: string[];
        strategicPriorities?: string | string[];
        timeline?: string | string[] | null;
        weights?: { impact: number; alignment: number; feasibility: number };
      };
      sectorDisplayNames = saved.sectors ?? [];
      strategicCoBenefitKeys = Array.isArray(saved.strategicPriorities)
        ? saved.strategicPriorities
        : [];
      if (Array.isArray(saved.timeline)) {
        timelineValues = saved.timeline;
      } else if (saved.timeline) {
        timelineValues = [saved.timeline === "none" ? "no_preference" : saved.timeline];
      }
      savedWeights = saved.weights;
    }
  } catch {}

  let excludedActionIds: string[] = [];
  try {
    const confirmedRaw = localStorage.getItem(`hiap:${locode}:exclusions:confirmed`);
    if (confirmedRaw) {
      excludedActionIds = JSON.parse(confirmedRaw) as string[];
    }
  } catch {}

  const weightsOverride = savedWeights
    ? {
        impact:      savedWeights.impact      / 100,
        alignment:   savedWeights.alignment   / 100,
        feasibility: savedWeights.feasibility / 100,
      }
    : { impact: 0.55, alignment: 0.22, feasibility: 0.23 };

  const validTimelines = timelineValues.filter((t) => VALID_TIMEFRAMES.has(t));
  const cityStrategicPreferenceTimeframes = (
    validTimelines.includes("no_preference")
      ? ["no_preference"]
      : validTimelines
  ) as ("short" | "medium" | "long" | "no_preference")[];

  const cityStrategicPreferenceSectors = toSectorTags(sectorDisplayNames);

  const mockCity = (
    mockRequest as {
      requestData: {
        cityDataList: Array<{ cityEmissionsData: FrontendCityEmissionsData }>;
      };
    }
  ).requestData.cityDataList[0];

  const countryCode = locode.slice(0, 2).toUpperCase();
  const cityObj = CITIES.find(
    (c) => c.locode.toLowerCase() === locode.toLowerCase()
  );
  const populationSize = cityObj?.population
    ? parseInt(cityObj.population.replace(/[^0-9]/g, ""), 10) || null
    : null;

  return {
    locode,
    countryCode,
    populationSize,
    excludedActionIds,
    weightsOverride,
    cityStrategicPreferenceSectors,
    cityStrategicPreferenceCoBenefitKeys: strategicCoBenefitKeys,
    cityStrategicPreferenceTimeframes,
    cityEmissionsData: sanitizeEmissionsData(mockCity.cityEmissionsData),
  };
}

// ─── Adapt API result → PipelineResult ───────────────────────────────────────

export function adaptApiResult(
  apiResult: PrioritizerApiCityResult,
  emissionsData: FrontendCityEmissionsData,
  topN: number
): PipelineResult {
  const legalExcluded: LegalExcludedAction[] = [];
  const legalFlagged: LegalExcludedAction[] = [];

  const hardFilterById = (
    (apiResult.metadata?.hard_filter_evidence_by_action_id ?? {}) as Record<
      string,
      HardFilterEvidence
    >
  );

  for (const [actionId, hfEv] of Object.entries(hardFilterById)) {
    const lv  = hfEv.legal;                    // legacy v2+ rich object (may be absent)
    const las = hfEv.legal_assessment_summary; // current backend structure
    const verdict = lv?.verdict_category ?? hfEv.legal_verdict_category ?? null;
    const isBlocked = verdict === "blocked" || hfEv.legal_hard_filter_blocked === true;
    const isMissingAssessment = verdict === null && hfEv.legal_assessment_present === false;

    if (!isBlocked && !isMissingAssessment) continue;

    const local = LOCAL_ACTION_MAP.get(actionId);
    const gpcRefs = local?.emissions?.gpc_reference_number ?? [];
    const sectorTag =
      gpcRefs.length > 0
        ? gpcToSectorTag(gpcRefs)
        : (las?.gpc_sector ?? "cross_sector");

    const legalData: LegalData = {
      assessment_present: lv?.assessment_present ?? hfEv.legal_assessment_present ?? !isMissingAssessment,
      assessment_missing: lv?.assessment_missing ?? isMissingAssessment,
      verdict_category: isBlocked ? "blocked" : "conditional",
      component_score: lv?.component_score ?? hfEv.legal_verdict_score ?? 0,
      ownership_category: ((lv?.ownership_category ?? las?.ownership_category) ?? null) as LegalData["ownership_category"],
      ownership_score: lv?.ownership_score ?? las?.ownership_score ?? 0,
      ownership_description: lv?.ownership_description ?? las?.ownership_description ?? null,
      ownership_description_es: lv?.ownership_description_es ?? las?.ownership_description_es ?? null,
      restrictions_category: ((lv?.restrictions_category ?? las?.restrictions_category) ?? null) as LegalData["restrictions_category"],
      restrictions_score: lv?.restrictions_score ?? las?.restrictions_score ?? 0,
      restrictions_description: lv?.restrictions_description ?? las?.restrictions_description ?? null,
      restrictions_description_es: lv?.restrictions_description_es ?? las?.restrictions_description_es ?? null,
      legal_justification: lv?.legal_justification ?? las?.legal_justification ?? null,
      legal_justification_en: lv?.legal_justification_en ?? las?.legal_justification_en ?? null,
      legal_references: lv?.legal_references ?? las?.legal_references ?? [],
    };

    const entry: LegalExcludedAction = {
      actionId,
      actionName: local?.actionName ?? actionId,
      sectorTag,
      legalData,
    };

    if (isBlocked) {
      legalExcluded.push(entry);
    } else {
      legalFlagged.push(entry);
    }
  }

  const ranked: RankedAction[] = (apiResult.ranked_actions ?? []).map((a) => {
    const local = LOCAL_ACTION_MAP.get(a.action_id);
    const score = a.final_score;
    const ev = (a.evidence_summary ?? {}) as EvidenceSummary;

    const legalEv = ev.feasibility?.legal ?? null;
    const verdictCategory = (legalEv?.verdict_category ?? null) as LegalData["verdict_category"];

    const legalData: LegalData | null = legalEv
      ? {
          assessment_present: legalEv.assessment_present ?? true,
          assessment_missing: legalEv.assessment_missing ?? false,
          verdict_category: verdictCategory,
          component_score: legalEv.component_score ?? ev.feasibility?.legal_component_score ?? 0,
          ownership_category: (legalEv.ownership_category ?? null) as LegalData["ownership_category"],
          ownership_score: legalEv.ownership_score ?? 0,
          ownership_description: legalEv.ownership_description ?? null,
          ownership_description_es: legalEv.ownership_description_es ?? null,
          restrictions_category: (legalEv.restrictions_category ?? null) as LegalData["restrictions_category"],
          restrictions_score: legalEv.restrictions_score ?? 0,
          restrictions_description: legalEv.restrictions_description ?? null,
          restrictions_description_es: legalEv.restrictions_description_es ?? null,
          legal_justification: legalEv.legal_justification ?? null,
          legal_justification_en: legalEv.legal_justification_en ?? null,
          legal_references: legalEv.legal_references ?? [],
        }
      : null;

    const gpcRefs = local?.emissions?.gpc_reference_number ?? [];
    const sectorTag = gpcToSectorTag(gpcRefs);
    const actionName = local?.actionName ?? a.action_id;

    if (legalEv !== null && legalData?.assessment_missing === true) {
      legalFlagged.push({ actionId: a.action_id, actionName, sectorTag, legalData });
    }

    return {
      rank: a.rank,
      actionId: a.action_id,
      actionName,
      actionCategory:            local?.actionCategory            ?? "",
      actionSubcategory:         local?.actionSubcategory         ?? "",
      costInvestmentNeeded:      local?.costInvestmentNeeded      ?? "",
      timelineForImplementation: local?.timelineForImplementation ?? "",
      description:               local?.description               ?? "",
      finalScore:      score,
      impactScore:     a.impact_score,
      alignmentScore:  a.alignment_score,
      feasibilityScore: a.feasibility_score,
      reductionShare:        ev.impact?.emissions_reduction_component_score          ?? 0,
      timelineScore:         ev.impact?.timeline_component_score                     ?? 0,
      policyComponent:       ev.alignment?.policy_component_score                    ?? 0,
      sectorComponent:       ev.alignment?.sector_component_score                    ?? 0,
      otherComponent:        ev.alignment?.co_benefit_component_score                ?? 0,
      timeframeComponent:    ev.alignment?.timeframe_component_score                 ?? 0,
      softLegalComponent:    legalData?.component_score ?? ev.feasibility?.legal_component_score ?? 0,
      socioeconomicComponent: ev.feasibility?.mitigation_feasibility?.component_score
                           ?? ev.feasibility?.mitigation_feasibility_component_score
                           ?? 0,
      legalPassed: true,
      legalFlag:   legalData?.assessment_missing === true,
      legalData,
      sectorTag,
      gpcRefs,
      matchedEmissions: 0,
      explanation: a.explanations?.en ?? "",
      priority: score >= 0.7 ? "high" : score >= 0.4 ? "medium" : "low",
    };
  });

  const totalCityEmissions = sumGpcEmissions(emissionsData.gpcData);

  return {
    schemaVersion: PIPELINE_RESULT_SCHEMA_VERSION,
    ranked,
    discarded: [],
    legalExcluded,
    legalFlagged,
    totalCityEmissions,
    cityEmissionsByGpc: {},
    locode: apiResult.locode,
    topN,
  };
}

// ─── Main exported runner ─────────────────────────────────────────────────────

/**
 * Run the prioritization pipeline for a city and persist the result to localStorage.
 * Safe to call multiple times — later calls overwrite the stored result.
 */
export async function runPipelineForCity(
  locode: string,
  options: { topN?: number; createExplanations?: boolean } = {}
): Promise<PipelineResult> {
  const { topN = 20, createExplanations = false } = options;
  const cityInput = buildCityInput(locode);
  const [apiResult] = await callPrioritize({
    cityDataList: [cityInput],
    topN,
    createExplanations,
    requestedLanguages: ["en"],
  });
  const result = adaptApiResult(apiResult, cityInput.cityEmissionsData, topN);
  localStorage.setItem(`hiap:${locode}:results`, JSON.stringify(result));
  return result;
}
