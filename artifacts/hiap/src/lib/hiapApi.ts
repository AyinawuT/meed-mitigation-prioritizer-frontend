// ─── BACKEND BASE URL ────────────────────────────────────────────────────────
// All /v1/* calls are proxied through the local Express server at /api/v1/*.
// The Express server forwards them server-to-server to the hiap-meed backend
// (HIAP_BACKEND_URL env var, defaulting to http://localhost:8080).
// Leave as "/api" for both dev and published app — the shared proxy handles routing.
export const HIAP_API_BASE_URL = "/api";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface FrontendApiContext {
  endpoint: string;
  locodes: string[];
}

export interface FrontendRequestMeta {
  requestId: string;
  generatedAtUtc: string;
  backendConsumer: string;
  upstreamProvider: string;
  apiContext: FrontendApiContext;
  totalRecords: number;
}

export interface GpcActivity {
  activityType?: string | null;
  totalEmissions?: number | null;
  totalEmissionsUnit?: string | null;
  activityValue?: number | null;
  activityUnit?: string | null;
  dataSource?: string | null;
  notationKey?: string | null;
}

export interface GpcDataEntry {
  notationKey?: string | null;
  activities: GpcActivity[];
}

export interface FrontendCityEmissionsData {
  inventoryYear?: number | null;
  gpcData: Record<string, GpcDataEntry>;
}

export interface FrontendCityInput {
  locode: string;
  countryCode: string;
  populationSize?: number | null;
  excludedActionIds?: string[];
  weightsOverride?: Record<string, number> | null;
  cityStrategicPreferenceSectors?: string[];
  cityStrategicPreferenceTimeframes?: ("short" | "medium" | "long" | "no_preference")[];
  cityStrategicPreferenceCoBenefitKeys?: string[];
  cityEmissionsData: FrontendCityEmissionsData;
}

export interface RankedActionResult {
  action_id: string;
  rank: number;
  final_score: number;
  impact_score: number;
  alignment_score: number;
  feasibility_score: number;
  evidence_summary: Record<string, unknown>;
  explanations?: Record<string, string>;
}

export interface PrioritizerApiCityResult {
  locode: string;
  ranked_action_ids?: string[];
  ranked_actions?: RankedActionResult[];
  metadata?: Record<string, unknown>;
  warnings?: string[];
}

export interface PrioritizerRequestData {
  cityDataList: FrontendCityInput[];
  createExplanations?: boolean;
  topN?: number | null;
  requestedLanguages?: string[];
}

export interface ExclusionPreviewCityInput {
  locode: string;
  excludedSectorTags?: string[];
  excludedCoBenefitKeys?: string[];
  excludedActionsFreeText?: string | null;
}

export interface ProposedExcludedAction {
  actionId: string;
  actionName: string;
  reasons: string[];
  matchedBy: string[];
}

export interface ExclusionSummaryReasonGroup {
  count: number;
  actionIds: string[];
}

export interface ExclusionSummary {
  totalProposed: number;
  byReasonType: Record<string, ExclusionSummaryReasonGroup>;
}

export interface ExclusionPreviewCityResult {
  locode: string;
  proposedExcludedActions: ProposedExcludedAction[];
  exclusionSummary: ExclusionSummary;
  warnings: string[];
}

export interface ExplanationTranslationActionInput {
  actionId: string;
  canonicalExplanation: string;
}

export interface ExplanationTranslationResult {
  actionId: string;
  explanations: Record<string, string>;
}

// ─── META HELPER ─────────────────────────────────────────────────────────────

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function buildMeta(endpoint: string, locodes: string[]): FrontendRequestMeta {
  return {
    requestId: uuid(),
    generatedAtUtc: new Date().toISOString(),
    backendConsumer: "hiap-meed",
    upstreamProvider: "city_catalyst_frontend",
    apiContext: { endpoint: `POST ${endpoint}`, locodes },
    totalRecords: locodes.length,
  };
}

// ─── EXCLUSIONS PREVIEW ──────────────────────────────────────────────────────

export async function callExclusionsPreview(
  cities: ExclusionPreviewCityInput[]
): Promise<ExclusionPreviewCityResult[]> {
  const locodes = cities.map((c) => c.locode);
  const res = await fetch(`${HIAP_API_BASE_URL}/v1/prioritize/exclusions/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      meta: buildMeta("/v1/prioritize/exclusions/preview", locodes),
      requestData: { cityDataList: cities },
    }),
  });
  if (!res.ok) throw new Error(`Exclusions preview failed: HTTP ${res.status}`);
  const data = await res.json();
  return (data.results ?? []) as ExclusionPreviewCityResult[];
}

// ─── PRIORITIZE ──────────────────────────────────────────────────────────────

export async function callPrioritize(
  requestData: PrioritizerRequestData
): Promise<PrioritizerApiCityResult[]> {
  const locodes = requestData.cityDataList.map((c) => c.locode);
  const res = await fetch(`${HIAP_API_BASE_URL}/v1/prioritize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      meta: buildMeta("/v1/prioritize", locodes),
      requestData,
    }),
  });
  if (!res.ok) throw new Error(`Prioritization failed: HTTP ${res.status}`);
  const data = await res.json();
  return (data.results ?? []) as PrioritizerApiCityResult[];
}

// ─── TRANSLATION ─────────────────────────────────────────────────────────────

export async function callTranslateExplanations(
  rankedActions: ExplanationTranslationActionInput[],
  targetLanguages: string[]
): Promise<ExplanationTranslationResult[]> {
  const res = await fetch(`${HIAP_API_BASE_URL}/v1/explanations/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      meta: buildMeta("/v1/explanations/translate", []),
      requestData: {
        sourceLanguage: "en",
        targetLanguages,
        rankedActions,
      },
    }),
  });
  if (!res.ok) throw new Error(`Translation failed: HTTP ${res.status}`);
  const data = await res.json();
  return (data.translations ?? []) as ExplanationTranslationResult[];
}
