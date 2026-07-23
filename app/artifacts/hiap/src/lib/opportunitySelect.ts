// Opportunity request + client-side selection, aligned with the report backend.
//
// The frontend and the report (/v1/reports/output-plan) hit the same ccglobal
// endpoint (/api/v1/climate-finance/opportunities?country_code=…&sector=…) but
// applied different filtering, so the funds shown in the action drawer didn't
// match the funds written into the report. This module reproduces the backend's
// query params and post-fetch selection so both surfaces show the same set.

export type OppLike = {
  status?: string;
  recurrence?: string;
  instrument?: string;
  climate_relevance?: string;
  city_application?: string[];
};

// A programme in one of these statuses is not currently open.
const CLOSED_STATUSES = new Set(["closed", "cancelled", "canceled", "expired"]);
// …but a closed programme that recurs on a cycle is still worth watching.
const MONITOR_RECURRENCES = new Set(["annual", "periodic", "recurring", "sporadic"]);

export function routeIsTechnicalAssistance(route: string | null | undefined): boolean {
  return !!route && /technical\s*assistance/i.test(route);
}

/**
 * Add the municipality-eligibility + limit filters the report backend applies.
 * The feasibility `links.opportunities` URL already carries country_code + sector;
 * this appends `eligible_actor=municipality` and `limit=50` to match the backend.
 */
export function opportunitiesRequestUrl(relUrl: string): string {
  const extra: string[] = [];
  if (!/[?&]eligible_actor=/.test(relUrl)) extra.push("eligible_actor=municipality");
  if (!/[?&]limit=/.test(relUrl)) extra.push("limit=50");
  if (extra.length === 0) return relUrl;
  return relUrl + (relUrl.includes("?") ? "&" : "?") + extra.join("&");
}

// Rank by explicit climate relevance, then direct city application, then a
// technical-assistance instrument. When the action's finance route needs
// technical assistance, TA instruments are promoted to the top preference.
function score(o: OppLike, routeTA: boolean): number {
  const explicit = o.climate_relevance === "explicit" ? 1 : 0;
  const direct = (o.city_application ?? []).includes("direct") ? 1 : 0;
  const ta = o.instrument === "technical_assistance" ? 1 : 0;
  return routeTA
    ? ta * 4 + explicit * 2 + direct
    : explicit * 4 + direct * 2 + ta;
}

/**
 * Split opportunities into a `current` list (open now) and a `monitor` list
 * (closed but recurring), each ranked and capped at `limit`. Closed programmes
 * that don't recur are dropped entirely.
 */
export function selectOpportunities<T extends OppLike>(
  opps: T[],
  route: string | null | undefined,
  limit = 5,
): { current: T[]; monitor: T[] } {
  const routeTA = routeIsTechnicalAssistance(route);
  const isClosed = (o: T) => CLOSED_STATUSES.has((o.status ?? "").toLowerCase().trim());
  const recurs = (o: T) => MONITOR_RECURRENCES.has((o.recurrence ?? "").toLowerCase().trim());

  const current: T[] = [];
  const monitor: T[] = [];
  for (const o of opps) {
    if (!isClosed(o)) current.push(o);
    else if (recurs(o)) monitor.push(o);
  }

  const byScore = (a: T, b: T) => score(b, routeTA) - score(a, routeTA);
  current.sort(byScore);
  monitor.sort(byScore);
  return { current: current.slice(0, limit), monitor: monitor.slice(0, limit) };
}
