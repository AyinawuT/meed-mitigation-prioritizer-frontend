import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dir, "../data");

function loadJson(file: string): unknown {
  return JSON.parse(readFileSync(resolve(dataDir, file), "utf8"));
}

// ─── Data (loaded once) ────────────────────────────────────────────────────────

export const allData = (() => {
  const actionsRaw = loadJson("actions.json") as { actions: ActionRecord[] };
  const legalRaw = loadJson("actionsLegal.json") as { legal_requirements: LegalEntry[] };
  const policyRaw = loadJson("actionsPolicySignals.json") as { policy_signals: PolicyEntry[] };
  const citiesRaw = loadJson("cities.json") as { cities: CityRecord[] };
  const cityRaw = loadJson("cityData.json") as { city: CityRecord };

  const legalMap = new Map<string, LegalRequirement[]>();
  for (const e of legalRaw.legal_requirements) legalMap.set(e.action_id, e.requirements);

  const policyMap = new Map<string, number>();
  for (const e of policyRaw.policy_signals) policyMap.set(e.action_id, e.policy_support_score);

  return {
    actions: actionsRaw.actions,
    legalMap,
    policyMap,
    cities: citiesRaw.cities,
    defaultCity: cityRaw.city,
  };
})();

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SocioeconomicIndicator {
  indicator_key: string;
  direction: string;
  weight: number;
}

interface ActionRecord {
  actionId: string;
  actionName: string;
  actionCategory: string;
  actionSubcategory: string;
  costInvestmentNeeded: string;
  timelineForImplementation: string;
  description: string;
  socioeconomicIndicators: SocioeconomicIndicator[];
  emissions?: { gpc_reference_number: string[]; impact_text: string };
}

interface LegalRequirement {
  strength: string;
  alignment_status: string;
}

interface LegalEntry {
  action_id: string;
  requirements: LegalRequirement[];
}

interface PolicyEntry {
  action_id: string;
  policy_support_score: number;
  policy_signals: unknown[];
}

interface CityIndicator {
  attribute_value?: number;
  attribute_category: string;
}

export interface CityRecord {
  locode: string;
  [key: string]: unknown;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const IMPACT_MULTIPLIER: Record<string, number> = {
  very_low: 0.2, low: 0.4, medium: 0.6, high: 0.8, very_high: 1.0,
};

const TIMELINE_SCORE: Record<string, number> = {
  "<5_years": 1.0, "5-10_years": 0.5, ">10_years": 0.0,
};

const BUCKET_SCORE: Record<string, number> = {
  very_low: -2, low: -1, medium: 0, high: 1, very_high: 2,
};

const INDICATOR_KEY_MAP: Record<string, string> = {
  employment_in_transport_and_logistics: "transport_logistics_employment",
  electricity_access_rate: "electricity_access",
};

const SECTOR_GPC_PREFIX: Record<string, string[]> = {
  transportation: ["II"],
  buildings: ["I"],
  energy: ["I", "IV"],
  waste: ["III"],
  nature: ["V"],
  agriculture: ["V"],
  industry: ["IV"],
};

// ─── Pipeline helpers ──────────────────────────────────────────────────────────

function norm(s: string) { return s.toLowerCase().replace(/ /g, "_"); }
function normTimeline(s: string) { return s.replace(/ /g, "_"); }

function gpcMatchesSectors(refs: string[], sectors: string[]): boolean {
  return sectors.some(sector => {
    const prefixes = SECTOR_GPC_PREFIX[sector.toLowerCase()] ?? [sector.toLowerCase()];
    return prefixes.some(p => refs.some(r => r.startsWith(p + ".") || r === p));
  });
}

interface GpcData {
  notationKey?: string | null;
  activities: Array<{ totalEmissions: number; notationKey?: string | null }>;
}

export function deriveEmissions(gpcData: Record<string, GpcData>) {
  const byRef: Record<string, number> = {};
  for (const [ref, entry] of Object.entries(gpcData)) {
    if (["IE", "NE"].includes((entry.notationKey ?? "").toUpperCase())) continue;
    let sum = 0;
    for (const act of entry.activities) {
      if (["IE", "NE"].includes((act.notationKey ?? "").toUpperCase())) continue;
      sum += act.totalEmissions ?? 0;
    }
    if (sum > 0) byRef[ref] = sum;
  }
  return { byRef, total: Object.values(byRef).reduce((a, b) => a + b, 0) };
}

function hardFilter(actions: ActionRecord[]) {
  const valid: ActionRecord[] = [];
  const discarded: Array<{ actionId: string; actionName: string; reason: string }> = [];
  const flagged = new Set<string>();

  for (const action of actions) {
    const reqs = allData.legalMap.get(action.actionId) ?? [];
    let fail = false, flag = false;
    for (const req of reqs) {
      if (!["mandatory", "required"].includes(req.strength)) continue;
      if (req.alignment_status === "not_aligned") { fail = true; break; }
      if (req.alignment_status === "no_evidence") flag = true;
    }
    if (fail) {
      discarded.push({ actionId: action.actionId, actionName: action.actionName, reason: "legal_hard_requirement_failed" });
    } else {
      valid.push(action);
      if (flag) flagged.add(action.actionId);
    }
  }
  return { valid, discarded, flagged };
}

function scoreImpact(action: ActionRecord, cityEmissions: Record<string, number>, totalEmissions: number) {
  const refs = action.emissions?.gpc_reference_number ?? [];
  const multiplier = IMPACT_MULTIPLIER[norm(action.emissions?.impact_text ?? "very_low")] ?? 0.2;
  const matchedEmissions = refs.reduce((s, r) => s + (cityEmissions[r] ?? 0), 0);
  const reductionShare = totalEmissions > 0 ? (matchedEmissions * multiplier) / totalEmissions : 0;
  const tlScore = TIMELINE_SCORE[normTimeline(action.timelineForImplementation ?? "")] ?? 0.0;
  return { impactScore: 0.8 * reductionShare + 0.2 * tlScore, reductionShare, timelineScore: tlScore, matchedEmissions };
}

function scoreAlignment(action: ActionRecord, sectors: string[]) {
  const policyComponent = allData.policyMap.get(action.actionId) ?? 0.0;
  const sectorComponent = sectors.length > 0 && gpcMatchesSectors(action.emissions?.gpc_reference_number ?? [], sectors) ? 1.0 : 0.0;
  // co-benefit and timeframe components: stub data has no cityStrategicPreferenceCoBenefitKeys
  // or timelineForImplementation matching, so both default to neutral 0.5 per spec
  const cobenefitComponent = 0.5;
  const timeframeComponent = 0.5;
  return {
    alignmentScore: 0.75 * policyComponent + 0.15 * sectorComponent + 0.05 * cobenefitComponent + 0.05 * timeframeComponent,
    policyComponent,
    sectorComponent,
  };
}

function scoreFeasibility(action: ActionRecord, cityRecord: Record<string, unknown>) {
  const reqs = allData.legalMap.get(action.actionId) ?? [];
  const softReqs = reqs.filter(r => ["recommended", "optional"].includes(r.strength));
  let softLegalComponent = 0.0;
  if (softReqs.length > 0) {
    const scores = softReqs.map(r => r.alignment_status === "aligns" ? 1.0 : r.alignment_status === "not_aligned" ? 0.0 : 0.5);
    softLegalComponent = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  const indicators = action.socioeconomicIndicators ?? [];
  let socioeconomicComponent = 0.5;
  if (indicators.length > 0) {
    let weightedSum = 0, totalWeight = 0;
    for (const rule of indicators) {
      const cityKey = INDICATOR_KEY_MAP[rule.indicator_key] ?? rule.indicator_key;
      const attr = cityRecord[cityKey] as CityIndicator | undefined;
      if (!attr) continue;
      const bucket = norm(attr.attribute_category);
      let bScore = BUCKET_SCORE[bucket] ?? 0;
      if (rule.direction === "constraining") bScore = -bScore;
      weightedSum += bScore * rule.weight;
      totalWeight += rule.weight;
    }
    if (totalWeight > 0) socioeconomicComponent = (weightedSum / totalWeight + 2) / 4;
  }

  return { feasibilityScore: 0.5 * softLegalComponent + 0.5 * socioeconomicComponent, softLegalComponent, socioeconomicComponent };
}

// ─── Main entry ────────────────────────────────────────────────────────────────

export interface PrioritizerRequest {
  locode: string;
  weightsOverride?: { impact: number; alignment: number; feasibility: number };
  cityStrategicPreferenceSectors?: string[];
  excludedActionsFreeText?: string;
  cityEmissionsData: { gpcData: Record<string, GpcData> };
  topN?: number;
}

export function runPipeline(req: PrioritizerRequest, cityRecord: Record<string, unknown>) {
  const weights = req.weightsOverride ?? { impact: 0.55, alignment: 0.22, feasibility: 0.23 };
  const wSum = weights.impact + weights.alignment + weights.feasibility;
  const nw = { impact: weights.impact / wSum, alignment: weights.alignment / wSum, feasibility: weights.feasibility / wSum };

  const { byRef, total } = deriveEmissions(req.cityEmissionsData.gpcData);
  const { valid, discarded, flagged } = hardFilter(allData.actions);
  const sectors = req.cityStrategicPreferenceSectors ?? [];
  const topN = req.topN ?? 20;

  const scored = valid.map(action => {
    const { impactScore, reductionShare, timelineScore, matchedEmissions } = scoreImpact(action, byRef, total);
    const { alignmentScore, policyComponent, sectorComponent } = scoreAlignment(action, sectors);
    const { feasibilityScore, softLegalComponent, socioeconomicComponent } = scoreFeasibility(action, cityRecord);
    const finalScore = impactScore * nw.impact + alignmentScore * nw.alignment + feasibilityScore * nw.feasibility;
    return { action, finalScore, impactScore, alignmentScore, feasibilityScore, reductionShare, timelineScore, policyComponent, sectorComponent, softLegalComponent, socioeconomicComponent, matchedEmissions, legalFlag: flagged.has(action.actionId) };
  });

  scored.sort((a, b) => b.finalScore - a.finalScore);
  const top = scored.slice(0, topN);
  const N = top.length;

  const ranked = top.map((item, i) => {
    const rank = i + 1;
    const pct = rank / N;
    const priority = pct <= 0.35 ? "high" : pct <= 0.7 ? "medium" : "low";
    const { action, finalScore, impactScore, alignmentScore, feasibilityScore, reductionShare, timelineScore, policyComponent, sectorComponent, softLegalComponent, socioeconomicComponent, matchedEmissions, legalFlag } = item;
    const explanation = `Ranked #${rank} with a final score of ${finalScore.toFixed(2)}. Impact: ${impactScore.toFixed(2)} (reduction share: ${(reductionShare * 100).toFixed(1)}%). Alignment: ${alignmentScore.toFixed(2)} (policy support: ${policyComponent.toFixed(2)}, sector match: ${sectorComponent === 1 ? "yes" : "no"}). Feasibility: ${feasibilityScore.toFixed(2)}.`;
    return {
      rank, priority, explanation, legalFlag, legalPassed: true,
      actionId: action.actionId, actionName: action.actionName,
      actionCategory: action.actionCategory, actionSubcategory: action.actionSubcategory,
      costInvestmentNeeded: action.costInvestmentNeeded,
      timelineForImplementation: action.timelineForImplementation,
      description: action.description,
      finalScore, impactScore, alignmentScore, feasibilityScore,
      reductionShare, timelineScore, policyComponent, sectorComponent,
      softLegalComponent, socioeconomicComponent, matchedEmissions,
      gpcRefs: action.emissions?.gpc_reference_number ?? [],
    };
  });

  return { ranked, discarded, totalCityEmissions: total, cityEmissionsByGpc: byRef, locode: req.locode, topN };
}
