/**
 * apiService.ts
 *
 * Service layer for HIAP mock API JSON responses.
 * Loads files from /data/json/ and returns strongly-typed data.
 *
 * Usage (Node.js / api-server):
 *   import { getActions, getCityData, getProjects } from '../../data/apiService';
 *
 * For browser / Vite usage, replace readJson() with a fetch()-based loader:
 *   async function readJson<T>(filename: string): Promise<T> {
 *     return fetch(`/data/json/${filename}`).then(r => r.json());
 *   }
 *   Then make each exported function async.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSON_DIR = join(__dirname, "json");

function readJson<T>(filename: string): T {
  const raw = readFileSync(join(JSON_DIR, filename), "utf-8");
  return JSON.parse(raw) as T;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiMeta {
  generated_at_utc: string;
  backend_consumer: string;
  upstream_provider: string;
  api_context: Record<string, unknown>;
  total_records?: number;
}

// --- Actions ----------------------------------------------------------------

export interface CoBenefit {
  sector_number: string;
  subsector_number: number;
  gpc_reference_number: string[];
  impact_relationship: "positive" | "negative" | "neutral";
  impact_text: string;
  impact_numeric: number;
  methodology: string;
}

export interface SocioeconomicIndicator {
  indicator_key: string;
  direction: "supportive" | "constraining" | "neutral";
  weight: number;
  rationale: string;
}

export interface ActionEmissions {
  sector_number: string;
  subsector_number: number;
  gpc_reference_number: string[];
  [key: string]: unknown;
}

export interface Action {
  actionId: string;
  actionName: string;
  description: string;
  actionCategory: string;
  actionSubcategory: string;
  costInvestmentNeeded: string;
  timelineForImplementation: string;
  coBenefits: Record<string, CoBenefit>;
  socioeconomicIndicators: SocioeconomicIndicator[];
  emissions: ActionEmissions;
}

export interface ActionsResponse {
  meta: ApiMeta;
  actions: Action[];
}

// --- Cities -----------------------------------------------------------------

export interface CityAttribute {
  attribute_value: number;
  attribute_units: string;
  attribute_category: string;
}

export interface City {
  comuna_name: string;
  locode: string;
  countryCode: string;
  region_name: string;
  comuna_code: string;
  region_code: string;
  populationSize: number;
  populationDensity: number;
  area: number;
  [key: string]: unknown;
}

export interface CitiesResponse {
  meta: ApiMeta;
  cities: City[];
}

export interface CityDetailResponse {
  meta: ApiMeta;
  city: City & Record<string, CityAttribute | unknown>;
}

// --- Projects ---------------------------------------------------------------

export interface FundedProject {
  fundedProjectId: string;
  projectTitle: string;
  projectSummary: string;
  projectStatus: string;
  startDate: string;
  endDate: string;
  country: string;
  region: string;
  cityName: string;
  cityId: string | null;
  sectors: string[];
  subsectors: string[];
  technologyMaturity: string;
  primaryBeneficiaries: string;
  financingInstrument: string;
  primaryFunderName: string;
  otherFunders: string[];
  funderType: string;
  programName: string;
  eligibilityNotes: string;
  dataSourceName: string;
  sourceUrl: string;
  documentationUrls: string[];
  lastVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  meta: ApiMeta;
  fundedProjects: FundedProject[];
}

// --- Legal ------------------------------------------------------------------

export interface LegalSignal {
  signal_code: string;
  signal_name: string;
  signal_type: string;
  required_value: string | null;
  actual_value: string | null;
  strength: string;
  alignment: "aligns" | "not_aligned" | "no_evidence";
  evidence_ids: string[];
}

export interface ActionLegalRequirements {
  action_id: string;
  requirements: LegalSignal[];
}

export interface ActionsLegalResponse {
  meta: ApiMeta;
  legal_requirements: ActionLegalRequirements[];
}

// --- Policy Signals ---------------------------------------------------------

export interface PolicySignal {
  location_scope: string;
  location_name: string;
  signal_type: string;
  signal_relation: string;
  signal_strength: string;
  evidence_ids: string[];
  evidence_count: number;
}

export interface ActionPolicySignals {
  action_id: string;
  policy_signals: PolicySignal[];
  policy_support_score: number;
}

export interface ActionsPolicySignalsResponse {
  meta: ApiMeta;
  policy_signals: ActionPolicySignals[];
}

// --- Prioritizer ------------------------------------------------------------

export interface CityEmissionsData {
  inventoryYear: number | null;
  [key: string]: unknown;
}

export interface WeightsOverride {
  impact: number;
  alignment: number;
  feasibility: number;
}

export interface CityPrioritizerInput {
  locode: string;
  countryCode: string;
  populationSize: number;
  excludedActionsFreeText: string;
  weightsOverride: WeightsOverride;
  cityStrategicPreferenceSectors: string[];
  cityStrategicPreferenceOther: string;
  cityEmissionsData: CityEmissionsData;
}

export interface PrioritizerRequestData {
  requestedLanguages: string[];
  topN: number;
  cityDataList: CityPrioritizerInput[];
}

export interface PrioritizerRequestResponse {
  meta: ApiMeta;
  requestData: PrioritizerRequestData;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** All 155 climate mitigation actions with emissions, co-benefits, and indicators. */
export function getActions(): ActionsResponse {
  return readJson<ActionsResponse>("actions.json");
}

/** Full list of Chilean cities (11 locodes) with basic profile data. */
export function getCities(): CitiesResponse {
  return readJson<CitiesResponse>("cities.json");
}

/**
 * Detailed profile for a single city (Iquique / CL IQQ in the mock).
 * Pass `locode` for future filtering; currently returns the full mock response.
 */
export function getCityData(_locode?: string): CityDetailResponse {
  return readJson<CityDetailResponse>("city.json");
}

/** Funded climate projects for Chilean cities (IDB and other funders). */
export function getProjects(): ProjectsResponse {
  return readJson<ProjectsResponse>("projects.json");
}

/**
 * Legal requirement alignment per action × city.
 * Covers 10 test-case actions with all alignment scenarios.
 */
export function getActionsLegal(): ActionsLegalResponse {
  return readJson<ActionsLegalResponse>("actions-legal.json");
}

/** Policy signal scores per action, aggregated across national/regional/local levels. */
export function getActionsPolicySignals(): ActionsPolicySignalsResponse {
  return readJson<ActionsPolicySignalsResponse>("actions-policy-signals.json");
}

/** Single-city prioritizer request body (CL IQQ). */
export function getPrioritizerRequest(): PrioritizerRequestResponse {
  return readJson<PrioritizerRequestResponse>("prioritizer-request.json");
}

/** Multi-city bulk prioritizer request body (CL IQQ + CL ARI). */
export function getPrioritizerBulkRequest(): PrioritizerRequestResponse {
  return readJson<PrioritizerRequestResponse>("prioritizer-bulk-request.json");
}
