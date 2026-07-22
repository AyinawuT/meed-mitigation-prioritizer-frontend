import { buildMeta, HIAP_API_BASE_URL } from "@/lib/hiapApi";

// ─── Types ────────────────────────────────────────────────────────────────────

// The backend returns localized fields as { en, es } maps (format
// "json_chapters_markdown_i18n"). Older responses returned flat strings; the
// resolvers below tolerate both so a partial rollout never breaks the report.
export type I18nText = string | Record<string, string>;
export type I18nList = string[] | Record<string, string[]>;

export interface ReportChapter {
  key: string;
  title: I18nText;
  markdown: I18nText;
  source_refs?: string[];
  limitations?: I18nList;
}

export interface ReportOutputPlanResponse {
  locode: string;
  action_id: string;
  /** Languages the plan was generated in, in display order (e.g. ["en","es"]). */
  language: string | string[];
  format?: string;
  chapters: ReportChapter[];
  metadata: Record<string, unknown>;
}

/** Normalize the response's `language` field to a list of available languages. */
export function availableLanguages(resp: Pick<ReportOutputPlanResponse, "language">): string[] {
  const l = resp.language;
  if (Array.isArray(l)) return l.filter(Boolean);
  return l ? [l] : [];
}

/** Pick the language to render: the requested one if available, else the first available. */
function pickLanguage(lang: string, available?: string[]): string {
  if (available && available.length > 0) {
    return available.includes(lang) ? lang : available[0];
  }
  return lang;
}

/** Resolve a localized text field for `lang`, tolerating a flat string or an { en, es } map. */
export function resolveI18nText(v: I18nText | undefined, lang: string, available?: string[]): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  const key = pickLanguage(lang, available);
  return v[key] ?? v[lang] ?? v.en ?? Object.values(v)[0] ?? "";
}

/** Resolve a localized string-list field (e.g. limitations) for `lang`. */
export function resolveI18nList(v: I18nList | undefined, lang: string, available?: string[]): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v;
  const key = pickLanguage(lang, available);
  return v[key] ?? v[lang] ?? v.en ?? Object.values(v)[0] ?? [];
}

export interface PrioritizationSnapshot {
  request: Record<string, unknown>;
  response: Record<string, unknown>;
  storedAtUtc: string;
}

// ─── API call ─────────────────────────────────────────────────────────────────

/**
 * Call POST /v1/reports/output-plan for a single action.
 * May take 10–30 s (involves LLM generation on the backend).
 */
export async function callReportOutputPlan(params: {
  locode: string;
  actionId: string;
  /** Languages to generate the plan in — send both so it can be switched client-side. */
  language: string[];
  prioritizationSnapshot: PrioritizationSnapshot;
}): Promise<ReportOutputPlanResponse> {
  const { locode, actionId, language, prioritizationSnapshot } = params;

  const res = await fetch(`${HIAP_API_BASE_URL}/v1/reports/output-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      meta: buildMeta("/v1/reports/output-plan", [locode]),
      requestData: { locode, actionId, language, prioritizationSnapshot },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "No error details available");
    if (res.status === 404) {
      throw new Error(
        "The report generation endpoint is not yet available on the backend. " +
        "Please ask the backend team to start the reports service."
      );
    }
    throw new Error(
      `Report generation failed: HTTP ${res.status}${text ? ` — ${text.slice(0, 300)}` : ""}`
    );
  }

  return res.json() as Promise<ReportOutputPlanResponse>;
}

// ─── Snapshot helpers ─────────────────────────────────────────────────────────

export function loadSnapshot(locode: string): PrioritizationSnapshot | null {
  try {
    const raw = localStorage.getItem(`hiap:${locode}:prioritization-snapshot`);
    if (!raw) return null;
    return JSON.parse(raw) as PrioritizationSnapshot;
  } catch {
    return null;
  }
}
