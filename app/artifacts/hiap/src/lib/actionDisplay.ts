/**
 * Display helpers for actions: localized name/description and the 5-level
 * emissions-reduction-potential scale.
 *
 * Action names/descriptions carry per-language variants (nameI18n /
 * descriptionI18n, en/es/pt) from the live catalog; these helpers pick the
 * active language and fall back to the canonical English field.
 */

import type { Lang } from "@/lib/i18n";

export interface LocalizableAction {
  actionName: string;
  description?: string;
  nameI18n?: Record<string, string> | null;
  descriptionI18n?: Record<string, string> | null;
}

export function localizedActionName(a: LocalizableAction, lang: Lang): string {
  return a.nameI18n?.[lang]?.trim() || a.actionName;
}

export function localizedActionDescription(a: LocalizableAction, lang: Lang): string {
  return a.descriptionI18n?.[lang]?.trim() || a.description || "";
}

// ─── Reduction-potential scale (5 levels) ─────────────────────────────────────
// Driven by the action's emissions impact_text / impact_numeric, not the
// ranking priority. Level 1 = very low … 5 = very high; 0 = unknown.

export interface ImpactAction {
  // RankedAction carries these at the top level…
  impactText?: string | null;
  impactNumeric?: number | null;
  // …a raw catalog record nests them under emissions.
  emissions?: {
    impact_text?: string | null;
    impact_numeric?: number | null;
  } | null;
}

const IMPACT_TEXT_TO_LEVEL: Record<string, number> = {
  "very low": 1,
  low: 2,
  medium: 3,
  moderate: 3,
  high: 4,
  "very high": 5,
};

/** Resolve an action's reduction-potential level, 1–5 (0 when unknown). */
export function reductionLevel(a: ImpactAction): number {
  const n = a.impactNumeric ?? a.emissions?.impact_numeric;
  if (typeof n === "number" && n >= 1) return Math.min(5, Math.max(1, Math.round(n)));
  const text = (a.impactText ?? a.emissions?.impact_text ?? "").toLowerCase().trim();
  return IMPACT_TEXT_TO_LEVEL[text] ?? 0;
}

// Indexed by level (0 = unknown). Labels are English keys — pass through t().
const LEVEL_LABELS = ["Unknown", "Very low", "Low", "Medium", "High", "Very high"];
const LEVEL_COLORS = ["#9CA3AF", "#9CA3AF", "#FB923C", "#F59E0B", "#22C55E", "#15803D"];

export const REDUCTION_SEGMENTS = 5;

/** English label key for a reduction level — wrap in t() at the call site. */
export function reductionLevelLabel(level: number): string {
  return LEVEL_LABELS[level] ?? LEVEL_LABELS[0];
}

export function reductionLevelColor(level: number): string {
  return LEVEL_COLORS[level] ?? LEVEL_COLORS[0];
}
