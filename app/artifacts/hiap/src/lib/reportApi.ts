import { buildMeta, HIAP_API_BASE_URL } from "@/lib/hiapApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportChapter {
  key: string;
  title: string;
  markdown: string;
  source_refs?: string[];
  limitations?: string[];
}

export interface ReportOutputPlanResponse {
  locode: string;
  action_id: string;
  language: string;
  format?: string;
  chapters: ReportChapter[];
  metadata: Record<string, unknown>;
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
  language: string;
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
