/**
 * Action catalog — resolves action metadata (names, descriptions, GPC refs)
 * for the IDs the prioritizer backend returns.
 *
 * Source of truth is the live global catalog at GET /api/v1/action-pathways.
 * The bundled `actions.json` snapshot is kept only as an offline fallback and
 * to fill IDs the live catalog does not (yet) publish — the live catalog is a
 * curated subset of the bundle.
 *
 * Why this exists: the bundled snapshot carries stale, country-specific text
 * (e.g. "Brazilian Energy Labeling Program", "Brazil's bioeconomy … açaí seeds")
 * that the live catalog has since generalized. Joining names from the snapshot
 * surfaced those Brazilian actions on Chilean cities' screens. Sourcing from the
 * API fixes the text at its authoritative source.
 */

import actionsData from "@/data/actions.json";

const ACTION_PATHWAYS_URL =
  "https://ccglobal.openearth.dev/api/v1/action-pathways";

/** Shape the frontend reads. Matches the bundled snapshot's fields. */
export interface CatalogAction {
  actionId: string;
  actionName: string;
  actionCategory: string;
  actionSubcategory: string;
  costInvestmentNeeded: string;
  timelineForImplementation: string;
  description: string;
  emissions?: { gpc_reference_number: string[] };
  /** Localized name/description from the live catalog (en/es/pt), when available. */
  nameI18n?: Record<string, string>;
  descriptionI18n?: Record<string, string>;
}

// Bundled snapshot → fallback map, keyed by action id.
const bundleMap = new Map<string, CatalogAction>(
  (actionsData as { actions: CatalogAction[] }).actions.map((a) => [a.actionId, a])
);

// The live catalog uses camelCase and omits some fields the app reads
// (actionCategory/actionSubcategory). Normalize to the app's shape, and fall
// back to the bundled record for anything the live record doesn't carry.
interface ApiActionRecord {
  actionId: string;
  actionName?: string;
  description?: string;
  costInvestmentNeeded?: string;
  timelineForImplementation?: string;
  emissions?: { gpcReferenceNumber?: string[]; gpc_reference_number?: string[] };
  nameI18n?: Record<string, string>;
  descriptionI18n?: Record<string, string>;
}

function normalizeApiRecord(
  a: ApiActionRecord,
  fallback?: CatalogAction
): CatalogAction {
  const gpc =
    a.emissions?.gpcReferenceNumber ??
    a.emissions?.gpc_reference_number ??
    fallback?.emissions?.gpc_reference_number ??
    [];
  return {
    actionId: a.actionId,
    actionName: a.actionName ?? fallback?.actionName ?? a.actionId,
    // Live catalog omits category/subcategory — keep the bundled values.
    actionCategory: fallback?.actionCategory ?? "",
    actionSubcategory: fallback?.actionSubcategory ?? "",
    costInvestmentNeeded:
      a.costInvestmentNeeded ?? fallback?.costInvestmentNeeded ?? "",
    timelineForImplementation:
      a.timelineForImplementation ?? fallback?.timelineForImplementation ?? "",
    description: a.description ?? fallback?.description ?? "",
    emissions: { gpc_reference_number: gpc },
    nameI18n: a.nameI18n,
    descriptionI18n: a.descriptionI18n,
  };
}

let catalogPromise: Promise<Map<string, CatalogAction>> | null = null;

/**
 * Load the merged action catalog once per session.
 *
 * Starts from the bundled snapshot (covers IDs absent from the live catalog),
 * then overlays every live record on top. On any fetch/parse error it resolves
 * to the bundled snapshot so the app still works offline.
 */
export function loadActionCatalog(): Promise<Map<string, CatalogAction>> {
  if (catalogPromise) return catalogPromise;
  catalogPromise = (async () => {
    try {
      const res = await fetch(ACTION_PATHWAYS_URL);
      if (!res.ok) throw new Error(`action-pathways HTTP ${res.status}`);
      const data = (await res.json()) as { actions?: ApiActionRecord[] };
      const merged = new Map(bundleMap);
      for (const a of data.actions ?? []) {
        if (!a?.actionId) continue;
        merged.set(a.actionId, normalizeApiRecord(a, bundleMap.get(a.actionId)));
      }
      return merged;
    } catch {
      // Offline / API error — fall back to the bundled snapshot.
      return new Map(bundleMap);
    }
  })();
  return catalogPromise;
}
