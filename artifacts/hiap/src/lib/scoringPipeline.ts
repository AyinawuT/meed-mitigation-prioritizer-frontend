import actionsRaw from "@/data/actions.json";
import legalRaw from "@/data/actionsLegal.json";
import policyRaw from "@/data/actionsPolicySignals.json";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SocioeconomicIndicator {
  indicator_key: string;
  direction: "supportive" | "constraining";
  weight: number;
}

interface CoBenefit {
  impact_relationship: string;
  impact_text: string;
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
  emissions?: {
    gpc_reference_number: string[];
    impact_text: string;
  };
  coBenefits?: Record<string, CoBenefit>;
}

export interface RankedAction {
  rank: number;
  actionId: string;
  actionName: string;
  actionCategory: string;
  actionSubcategory: string;
  costInvestmentNeeded: string;
  timelineForImplementation: string;
  description: string;
  finalScore: number;
  impactScore: number;
  alignmentScore: number;
  feasibilityScore: number;
  reductionShare: number;
  timelineScore: number;
  policyComponent: number;
  sectorComponent: number;
  otherComponent: number;
  softLegalComponent: number;
  socioeconomicComponent: number;
  legalPassed: boolean;
  legalFlag: boolean;
  gpcRefs: string[];
  matchedEmissions: number;
  explanation: string;
  priority: "high" | "medium" | "low";
}

export interface DiscardedAction {
  actionId: string;
  actionName: string;
  reason: string;
}

export interface PipelineResult {
  ranked: RankedAction[];
  discarded: DiscardedAction[];
  totalCityEmissions: number;
  cityEmissionsByGpc: Record<string, number>;
  locode: string;
  topN: number;
}

export interface CityIndicators {
  [key: string]: {
    attribute_value?: number;
    attribute_category: string;
  };
}

export interface PrioritizerRequest {
  locode: string;
  countryCode?: string;
  populationSize?: number;
  weightsOverride?: { impact: number; alignment: number; feasibility: number };
  cityStrategicPreferenceSectors?: string[];
  cityStrategicPreferenceOther?: string;
  excludedActionsFreeText?: string;
  cityEmissionsData: {
    inventoryYear?: number;
    gpcData: Record<
      string,
      {
        notationKey?: string | null;
        activities: Array<{
          totalEmissions: number;
          notationKey?: string | null;
        }>;
      }
    >;
  };
  cityIndicators?: CityIndicators;
  topN?: number;
}

// ─── Lookup maps built once ───────────────────────────────────────────────────

const actions = (actionsRaw as { actions: ActionRecord[] }).actions;

const legalMap = new Map<string, (typeof legalRaw.legal_requirements)[0]["requirements"]>();
for (const entry of legalRaw.legal_requirements) {
  legalMap.set(entry.action_id, entry.requirements);
}

const policyMap = new Map<string, number>();
for (const entry of (policyRaw as { policy_signals: Array<{ action_id: string; policy_support_score: number }> }).policy_signals) {
  policyMap.set(entry.action_id, entry.policy_support_score);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const IMPACT_MULTIPLIER: Record<string, number> = {
  very_low: 0.2,
  low: 0.4,
  medium: 0.6,
  high: 0.8,
  very_high: 1.0,
};

const TIMELINE_SCORE: Record<string, number> = {
  "<5_years": 1.0,
  "5-10_years": 0.5,
  ">10_years": 0.0,
};

const BUCKET_SCORE: Record<string, number> = {
  very_low: -2,
  low: -1,
  medium: 0,
  high: 1,
  very_high: 2,
};

// Indicator key mapping: actions use these keys → city data uses mapped keys
const INDICATOR_KEY_MAP: Record<string, string> = {
  employment_in_transport_and_logistics: "transport_logistics_employment",
  electricity_access_rate: "electricity_access",
};

// Free-text strategic priority keywords → co-benefit dimension
const PRIORITY_KEYWORD_MAP: Record<string, string[]> = {
  air_quality:           ["air quality", "air pollution", "clean air", "pollution", "respiratory", "smog", "particulate", "health", "public health"],
  cost_of_living:        ["cost of living", "affordable", "economic", "jobs", "employment", "income", "job creation", "poverty", "livelihoods", "inequality", "social equity", "equity"],
  habitat:               ["nature", "biodiversity", "ecosystem", "habitat", "green space", "parks", "wildlife", "forest", "environment"],
  housing:               ["housing", "homes", "residential", "shelter", "affordable housing", "tenants", "renters"],
  mobility:              ["mobility", "transport", "commute", "access", "walking", "cycling", "public transit", "active travel", "active transport"],
  stakeholder_engagement:["community", "stakeholder", "engagement", "participation", "inclusion", "social inclusion", "justice", "social justice"],
  water_quality:         ["water", "flood", "drought", "water quality", "aquifer", "sanitation", "water access"],
};

// Co-benefit impact text → 0–1 score
const COBENEFIT_SCORE: Record<string, number> = {
  very_low: 0.2,
  low:      0.4,
  medium:   0.6,
  high:     0.8,
  very_high: 1.0,
};

// GPC sector prefix → strategic preference sectors
const SECTOR_GPC_PREFIX: Record<string, string[]> = {
  transportation: ["II"],
  buildings: ["I"],
  energy: ["I", "IV"],
  waste: ["III"],
  nature: ["V"],
  agriculture: ["V"],
  industry: ["IV"],
  water: ["III.4"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeBucket(raw: string): string {
  return raw.toLowerCase().replace(/ /g, "_");
}

function normalizeImpactText(raw: string): string {
  return raw.toLowerCase().replace(/ /g, "_");
}

function normalizeTimeline(raw: string): string {
  // "<5 years" → "<5_years" etc.
  return raw.replace(/ /g, "_");
}

/** Parse free-text strategic priorities → list of matched co-benefit dimension keys */
function matchedCoBenefitDimensions(freeText: string): string[] {
  if (!freeText.trim()) return [];
  const lower = freeText.toLowerCase();
  const matched: string[] = [];
  for (const [dim, keywords] of Object.entries(PRIORITY_KEYWORD_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(dim);
    }
  }
  return matched;
}

/** Score an action against the city's free-text strategic priorities via co-benefits */
function scoreCobenefitMatch(action: ActionRecord, dimensions: string[]): number {
  if (dimensions.length === 0) return 0.0;
  const coBenefits = action.coBenefits ?? {};
  let total = 0;
  for (const dim of dimensions) {
    const benefit = coBenefits[dim];
    if (benefit && benefit.impact_relationship === "positive") {
      const text = normalizeImpactText(benefit.impact_text ?? "low");
      total += COBENEFIT_SCORE[text] ?? 0.2;
    }
    // Negative or absent co-benefit → contributes 0 for this dimension
  }
  return total / dimensions.length;
}

function actionMatchesSectors(gpcRefs: string[], sectors: string[]): boolean {
  return sectors.some((sector) => {
    const prefixes = SECTOR_GPC_PREFIX[sector.toLowerCase()] ?? [
      sector.toLowerCase(),
    ];
    return prefixes.some((prefix) =>
      gpcRefs.some((ref) => ref.startsWith(prefix + ".") || ref === prefix)
    );
  });
}

// ─── Step 1: City emissions by GPC ref ───────────────────────────────────────

export function deriveEmissions(
  gpcData: PrioritizerRequest["cityEmissionsData"]["gpcData"]
): { byRef: Record<string, number>; total: number } {
  const byRef: Record<string, number> = {};
  for (const [ref, entry] of Object.entries(gpcData)) {
    const topLevel = (entry.notationKey ?? "").toUpperCase();
    if (topLevel === "IE" || topLevel === "NE") continue;
    let sum = 0;
    for (const act of entry.activities) {
      const actKey = (act.notationKey ?? "").toUpperCase();
      if (actKey === "IE" || actKey === "NE") continue;
      sum += act.totalEmissions ?? 0;
    }
    if (sum > 0) byRef[ref] = sum;
  }
  const total = Object.values(byRef).reduce((a, b) => a + b, 0);
  return { byRef, total };
}

// ─── Step 2: Hard filter ──────────────────────────────────────────────────────

function hardFilter(actionList: ActionRecord[]): {
  valid: ActionRecord[];
  discarded: DiscardedAction[];
  flagged: Set<string>;
} {
  const valid: ActionRecord[] = [];
  const discarded: DiscardedAction[] = [];
  const flagged = new Set<string>();

  for (const action of actionList) {
    const reqs = legalMap.get(action.actionId) ?? [];
    let fail = false;
    let flag = false;

    for (const req of reqs) {
      const isHard =
        req.strength === "mandatory" || req.strength === "required";
      if (!isHard) continue;
      if (req.alignment_status === "not_aligned") {
        fail = true;
        break;
      }
      if (req.alignment_status === "no_evidence") {
        flag = true;
      }
    }

    if (fail) {
      discarded.push({
        actionId: action.actionId,
        actionName: action.actionName,
        reason: "legal_hard_requirement_failed",
      });
    } else {
      valid.push(action);
      if (flag) flagged.add(action.actionId);
    }
  }

  return { valid, discarded, flagged };
}

// ─── Step 3: Impact scoring ───────────────────────────────────────────────────

function scoreImpact(
  action: ActionRecord,
  cityEmissions: Record<string, number>,
  totalEmissions: number
): { impactScore: number; reductionShare: number; timelineScore: number; matchedEmissions: number; impactText: string } {
  const gpcRefs = action.emissions?.gpc_reference_number ?? [];
  const impactText = normalizeImpactText(action.emissions?.impact_text ?? "very_low");
  const multiplier = IMPACT_MULTIPLIER[impactText] ?? 0.2;

  const matchedEmissions = gpcRefs.reduce(
    (sum, ref) => sum + (cityEmissions[ref] ?? 0),
    0
  );
  const reductionShare =
    totalEmissions > 0
      ? (matchedEmissions * multiplier) / totalEmissions
      : 0;

  const timelineRaw = normalizeTimeline(action.timelineForImplementation ?? "");
  const tlScore = TIMELINE_SCORE[timelineRaw] ?? 0.0;

  const impactScore = 0.8 * reductionShare + 0.2 * tlScore;

  return { impactScore, reductionShare, timelineScore: tlScore, matchedEmissions, impactText };
}

// ─── Step 4: Alignment scoring ────────────────────────────────────────────────

function scoreAlignment(
  action: ActionRecord,
  sectors: string[],
  coBenefitDimensions: string[]
): { alignmentScore: number; policyComponent: number; sectorComponent: number; otherComponent: number } {
  const policyComponent = policyMap.get(action.actionId) ?? 0.0;
  const gpcRefs = action.emissions?.gpc_reference_number ?? [];
  const sectorComponent =
    sectors.length > 0 && actionMatchesSectors(gpcRefs, sectors) ? 1.0 : 0.0;
  const otherComponent = scoreCobenefitMatch(action, coBenefitDimensions);

  const alignmentScore =
    0.8 * policyComponent + 0.15 * sectorComponent + 0.05 * otherComponent;

  return { alignmentScore, policyComponent, sectorComponent, otherComponent };
}

// ─── Step 5: Feasibility scoring ──────────────────────────────────────────────

function scoreFeasibility(
  action: ActionRecord,
  cityIndicators: CityIndicators
): { feasibilityScore: number; softLegalComponent: number; socioeconomicComponent: number } {
  // Soft legal
  const reqs = legalMap.get(action.actionId) ?? [];
  const softReqs = reqs.filter(
    (r) => r.strength === "recommended" || r.strength === "optional"
  );

  let softLegalComponent = 0.0;
  if (softReqs.length > 0) {
    const scores = softReqs.map((r) => {
      if (r.alignment_status === "aligns") return 1.0;
      if (r.alignment_status === "not_aligned") return 0.0;
      return 0.5; // no_evidence
    });
    softLegalComponent = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // Socioeconomic
  const indicators = action.socioeconomicIndicators ?? [];
  let socioeconomicComponent = 0.5; // default neutral

  if (indicators.length > 0) {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const rule of indicators) {
      // Always count the weight in the denominator, even if city data is missing
      // (matches reference pipeline: missing indicator contributes 0 but dilutes the average)
      totalWeight += rule.weight;

      // Remap action key → city key
      const cityKey = INDICATOR_KEY_MAP[rule.indicator_key] ?? rule.indicator_key;
      const cityAttr = cityIndicators[cityKey];
      if (!cityAttr) continue; // 0 contribution to numerator, weight already counted above

      const bucket = normalizeBucket(cityAttr.attribute_category);
      let bucketScore = BUCKET_SCORE[bucket] ?? 0;

      if (rule.direction === "constraining") {
        bucketScore = -bucketScore;
      }

      weightedSum += bucketScore * rule.weight;
    }

    if (totalWeight > 0) {
      const average = weightedSum / totalWeight;
      socioeconomicComponent = (average + 2) / 4; // normalize -2..2 → 0..1
    }
  }

  const feasibilityScore =
    0.5 * softLegalComponent + 0.5 * socioeconomicComponent;

  return { feasibilityScore, softLegalComponent, socioeconomicComponent };
}

// ─── Step 6: Narrative explanation ────────────────────────────────────────────

function gpcSectorLabel(gpcRefs: string[]): string {
  if (!gpcRefs.length) return "cross-sector";
  const prefixes = [...new Set(gpcRefs.map(r => r.split(".")[0]))];
  if (prefixes.length > 1) return "multiple emission sectors";
  switch (prefixes[0]) {
    case "I":   return "stationary energy";
    case "II":  return "transportation";
    case "III": return "waste";
    case "IV":  return "IPPU (industrial processes)";
    case "V":   return "AFOLU (land use and forestry)";
    default:    return "cross-sector";
  }
}

function buildExplanation(p: {
  rank: number;
  gpcRefs: string[];
  impactText: string;
  impactScore: number;
  reductionShare: number;
  timelineScore: number;
  alignmentScore: number;
  policyComponent: number;
  sectorComponent: number;
  feasibilityScore: number;
  softLegalComponent: number;
  socioeconomicComponent: number;
  finalScore: number;
  normWeights: { impact: number; alignment: number; feasibility: number };
}): string {
  const {
    rank, gpcRefs, impactText, impactScore, reductionShare, timelineScore,
    alignmentScore, policyComponent, sectorComponent,
    feasibilityScore, softLegalComponent, socioeconomicComponent,
    normWeights,
  } = p;

  const sector = gpcSectorLabel(gpcRefs);
  const reductionPct = (reductionShare * 100).toFixed(1);
  const hasEmissions = reductionShare > 0;

  // Impact magnitude words
  const magnitudeWord = {
    very_low: "very low", low: "low", medium: "medium", high: "high", very_high: "very high",
  }[impactText] ?? "moderate";

  // Timeline phrase
  const timelinePhrase =
    timelineScore === 1.0 ? "fast delivery timeline (< 5 years)" :
    timelineScore === 0.5 ? "medium delivery timeline (5–10 years)" :
    "long delivery timeline (> 10 years)";

  // ── Sentence 1: Impact ────────────────────────────────────────────────────
  let s1: string;
  if (hasEmissions) {
    s1 = `This action ranked #${rank} because it addresses ${reductionPct}% of the city's ${sector} emissions`;
    if (reductionShare >= 0.15) s1 += " — one of the largest addressable sources in the inventory";
    s1 += `, with a ${magnitudeWord} impact multiplier and ${timelinePhrase}.`;
  } else {
    s1 = `This action ranked #${rank} as a cross-sector measure with a ${magnitudeWord} impact potential and ${timelinePhrase}.`;
  }

  // ── Sentence 2: Alignment ─────────────────────────────────────────────────
  const policyWord =
    policyComponent >= 0.75 ? "strong" :
    policyComponent >= 0.5  ? "moderate" :
    policyComponent >= 0.25 ? "limited" : "weak";

  let s2 = `Policy backing is ${policyWord} (${policyComponent.toFixed(2)})`;
  if (sectorComponent === 1.0) s2 += ", and it aligns with the city's selected priority sectors";
  else if (sectorComponent === 0.0) s2 += ", though it falls outside the city's selected priority sectors";
  s2 += ".";

  // ── Sentence 3: Feasibility ───────────────────────────────────────────────
  const feasWord =
    feasibilityScore >= 0.65 ? "strong" :
    feasibilityScore >= 0.45 ? "moderate" :
    feasibilityScore >= 0.25 ? "low" : "very low";

  const legalPhrase =
    softLegalComponent === 0      ? "no soft legal requirements on record" :
    softLegalComponent >= 0.75    ? "strong soft-legal coverage" :
    softLegalComponent >= 0.5     ? "partial soft-legal coverage" :
                                    "sparse soft-legal coverage";

  const socioPhrase =
    socioeconomicComponent >= 0.65 ? "favorable socioeconomic conditions" :
    socioeconomicComponent >= 0.45 ? "mixed socioeconomic conditions" :
                                     "challenging socioeconomic conditions for this action type";

  const s3 = `Feasibility is ${feasWord} (${feasibilityScore.toFixed(2)}) due to ${legalPhrase} and ${socioPhrase}.`;

  // ── Sentence 4: Trade-off ─────────────────────────────────────────────────
  const weighted = [
    { name: "impact",       val: impactScore,      w: normWeights.impact },
    { name: "alignment",    val: alignmentScore,   w: normWeights.alignment },
    { name: "feasibility",  val: feasibilityScore, w: normWeights.feasibility },
  ];
  const best  = weighted.reduce((a, b) => a.val * a.w > b.val * b.w ? a : b);
  const worst = weighted.reduce((a, b) => a.val * a.w < b.val * b.w ? a : b);

  const nameLabel: Record<string, string> = {
    impact: "impact", alignment: "alignment", feasibility: "feasibility",
  };

  let s4 = "";
  if (best.name !== worst.name) {
    const bestContrib  = best.val  * best.w;
    const worstContrib = worst.val * worst.w;
    const qualifier = bestContrib > worstContrib * 2 ? "large enough" : "sufficient";
    s4 = `At the current weight settings, the ${nameLabel[best.name]} advantage is ${qualifier} to overcome the lower ${nameLabel[worst.name]} score.`;
  }

  return [s1, s2, s3, s4].filter(Boolean).join(" ");
}

// ─── Step 7: Final score & rank ───────────────────────────────────────────────

function priorityLabel(
  rank: number,
  total: number
): "high" | "medium" | "low" {
  const pct = rank / total;
  if (pct <= 0.35) return "high";
  if (pct <= 0.7) return "medium";
  return "low";
}

// ─── Main pipeline entry point ────────────────────────────────────────────────

export function runPipeline(
  req: PrioritizerRequest,
  cityIndicators: CityIndicators
): PipelineResult {
  const weights = req.weightsOverride ?? {
    impact: 0.55,
    alignment: 0.22,
    feasibility: 0.23,
  };

  // Validate weights sum to ~1
  const wSum = weights.impact + weights.alignment + weights.feasibility;
  const normWeights = {
    impact: weights.impact / wSum,
    alignment: weights.alignment / wSum,
    feasibility: weights.feasibility / wSum,
  };

  const { byRef, total } = deriveEmissions(req.cityEmissionsData.gpcData);

  const { valid, discarded, flagged } = hardFilter(actions);

  const sectors = req.cityStrategicPreferenceSectors ?? [];
  const freeText = req.cityStrategicPreferenceOther ?? "";
  const coBenefitDimensions = matchedCoBenefitDimensions(freeText);
  const topN = req.topN ?? 20;

  const scored = valid.map((action) => {
    const { impactScore, reductionShare, timelineScore, matchedEmissions, impactText } =
      scoreImpact(action, byRef, total);
    const { alignmentScore, policyComponent, sectorComponent, otherComponent } =
      scoreAlignment(action, sectors, coBenefitDimensions);
    const { feasibilityScore, softLegalComponent, socioeconomicComponent } =
      scoreFeasibility(action, cityIndicators);

    const finalScore =
      impactScore * normWeights.impact +
      alignmentScore * normWeights.alignment +
      feasibilityScore * normWeights.feasibility;

    return {
      action,
      finalScore,
      impactScore,
      alignmentScore,
      feasibilityScore,
      reductionShare,
      timelineScore,
      impactText,
      policyComponent,
      sectorComponent,
      otherComponent,
      softLegalComponent,
      socioeconomicComponent,
      matchedEmissions,
      legalFlag: flagged.has(action.actionId),
    };
  });

  scored.sort((a, b) => b.finalScore - a.finalScore);

  const top = scored.slice(0, topN);
  const total_n = top.length;

  const ranked: RankedAction[] = top.map((item, i) => {
    const rank = i + 1;
    const {
      action,
      finalScore,
      impactScore,
      alignmentScore,
      feasibilityScore,
      reductionShare,
      timelineScore,
      impactText,
      policyComponent,
      sectorComponent,
      otherComponent,
      softLegalComponent,
      socioeconomicComponent,
      matchedEmissions,
      legalFlag,
    } = item;

    const explanation = buildExplanation({
      rank,
      gpcRefs: action.emissions?.gpc_reference_number ?? [],
      impactText,
      impactScore,
      reductionShare,
      timelineScore,
      alignmentScore,
      policyComponent,
      sectorComponent,
      feasibilityScore,
      softLegalComponent,
      socioeconomicComponent,
      finalScore,
      normWeights,
    });

    return {
      rank,
      actionId: action.actionId,
      actionName: action.actionName,
      actionCategory: action.actionCategory,
      actionSubcategory: action.actionSubcategory,
      costInvestmentNeeded: action.costInvestmentNeeded,
      timelineForImplementation: action.timelineForImplementation,
      description: action.description,
      finalScore,
      impactScore,
      alignmentScore,
      feasibilityScore,
      reductionShare,
      timelineScore,
      policyComponent,
      sectorComponent,
      otherComponent,
      softLegalComponent,
      socioeconomicComponent,
      legalPassed: true,
      legalFlag,
      gpcRefs: action.emissions?.gpc_reference_number ?? [],
      matchedEmissions,
      explanation,
      priority: priorityLabel(rank, total_n),
    };
  });

  return {
    ranked,
    discarded,
    totalCityEmissions: total,
    cityEmissionsByGpc: byRef,
    locode: req.locode,
    topN,
  };
}
