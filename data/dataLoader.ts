/**
 * dataLoader.ts
 *
 * CSV parsing utilities for HIAP raw dataset files.
 * Reads files from /data/csv/ and returns typed arrays.
 *
 * Usage (Node.js / api-server):
 *   import { getPolicySignals, getLegalSignals, getCityContext } from '../../data/dataLoader';
 *
 * For browser / Vite usage, swap the `fs`-based readCsv() implementation for
 * a fetch()-based one, e.g.:
 *   async function readCsv<T>(filename: string): Promise<T[]> {
 *     const text = await fetch(`/data/csv/${filename}`).then(r => r.text());
 *     return parseCsv<T>(text);
 *   }
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_DIR = join(__dirname, "csv");

// ---------------------------------------------------------------------------
// Generic CSV parser
// ---------------------------------------------------------------------------

function parseCsv<T extends Record<string, string>>(raw: string): T[] {
  const lines = raw.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? "").replace(/^"|"$/g, "").trim();
    });
    return row as T;
  });
}

/** Splits a CSV line respecting quoted fields that may contain commas. */
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function readCsv<T extends Record<string, string>>(filename: string): T[] {
  const raw = readFileSync(join(CSV_DIR, filename), "utf-8");
  return parseCsv<T>(raw);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PolicySignalRow {
  location_scope: string;
  location_name: string;
  action_id: string;
  action_name: string;
  signal_type: string;
  signal_relation: string;
  signal_strength: string;
  evidence_ids: string;
  evidence_count: string;
}

export interface PolicyEvidenceRow {
  evidence_id: string;
  gpc_sector: string;
  gpc_subsector: string;
  subsector_number: string;
  gpc_reference_number: string;
  entity_domain: string;
  entity_key: string;
  entity_relation: string;
  activity_tags: string;
  excerpt_summary: string;
  metric_type: string;
  metric_value: string;
  metric_unit: string;
  metric_timeline: string;
  action_theme_tags: string;
  evidence_kind: string;
  location_scope: string;
  location_name: string;
  policy_name: string;
  page_or_section: string;
  excerpt_verbatim: string;
  link: string;
}

export interface LegalSignalRow {
  location_scope: string;
  location_name: string;
  signal_code: string;
  signal_value: string;
  evidence_ids: string;
  evidence_count: string;
}

export interface LegalEvidenceRow {
  evidence_id: string;
  signal_code: string;
  signal_value: string;
  source_name: string;
  source_url: string;
  article_ref: string;
  plain_language_summary: string;
  signal_type: string;
  action_area: string;
  location_scope: string;
  location_name: string;
}

export interface LegalSignalCodeRow {
  signal_code: string;
  signal_name: string;
  signal_type: string;
  action_areas: string;
  priority: string;
  description: string;
}

export interface ActionLegalRequirementRow {
  action_id: string;
  signal_code: string;
  operator: string;
  required_value: string;
  signal_value: string;
  strength: string;
}

export interface CityContextRow {
  locode: string;
  comuna_name: string;
  comuna: string;
  attribute_type: string;
  attribute_value: string;
  attribute_units: string;
  attribute_category: string;
}

export interface CitiesListRow {
  comuna_name: string;
  locode: string;
  region_name: string;
  comuna_code: string;
  region_code: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Policy signals per action × location, sourced from policy-signals.csv */
export function getPolicySignals(): PolicySignalRow[] {
  return readCsv<PolicySignalRow>("policy-signals.csv");
}

/** Detailed policy evidence records, sourced from policy-evidence.csv */
export function getPolicyEvidence(): PolicyEvidenceRow[] {
  return readCsv<PolicyEvidenceRow>("policy-evidence.csv");
}

/** Legal signals per location × signal_code, sourced from legal-signals.csv */
export function getLegalSignals(): LegalSignalRow[] {
  return readCsv<LegalSignalRow>("legal-signals.csv");
}

/** Legal evidence records with source citations, sourced from legal-evidence.csv */
export function getLegalEvidence(): LegalEvidenceRow[] {
  return readCsv<LegalEvidenceRow>("legal-evidence.csv");
}

/** Signal code reference catalogue, sourced from legal-signal-codes.csv */
export function getLegalSignalCodes(): LegalSignalCodeRow[] {
  return readCsv<LegalSignalCodeRow>("legal-signal-codes.csv");
}

/** Per-action legal requirements (signal_code × strength), sourced from action-legal-requirements.csv */
export function getActionLegalRequirements(): ActionLegalRequirementRow[] {
  return readCsv<ActionLegalRequirementRow>("action-legal-requirements.csv");
}

/** Socioeconomic attributes per city/locode, sourced from city-context.csv */
export function getCityContext(locode?: string): CityContextRow[] {
  const rows = readCsv<CityContextRow>("city-context.csv");
  return locode ? rows.filter((r) => r.locode === locode) : rows;
}

/** Flat list of Chilean cities with locodes, sourced from cities-list.csv */
export function getCitiesList(): CitiesListRow[] {
  return readCsv<CitiesListRow>("cities-list.csv");
}
