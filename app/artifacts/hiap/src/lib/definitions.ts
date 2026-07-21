// Plain-language definitions for the vague terminology used across the app
// (timelines, cost levels, verdicts, strengths, confidence). Wording is
// sourced from the Methodology page so tooltips and the glossary stay in
// sync. Pass these to <InfoTip text={...}> — translation happens inside
// InfoTip via t(), with ES entries in translations/definitions.ts.

export const DEFS = {
  timelineShort:
    "Implementable in less than 5 years. In the Impact pillar this earns the highest timeline score (1.0) — actions that deliver results faster rank higher.",
  timelineMedium:
    "Implementable in 5 to 10 years. Timeline score 0.5 in the Impact pillar.",
  timelineLong:
    "Takes more than 10 years to deliver results. Timeline score 0.0 in the Impact pillar. A missing or unknown timeline is treated as neutral (0.5).",
  costScale:
    "Relative up-front investment needed to implement the action, as classified in the action catalogue: low, medium, or high compared with the other candidate actions. Cost level does not change the ranking score directly — use it to judge deliverability within your budget.",
  capacityScale:
    "How demanding the action is on municipal capacity (staff, institutions, technical skills) relative to other actions: low means little extra capacity is needed, high means substantial capacity building is required first.",
  policyStrength:
    "How strongly policy documents back this action. Strong: backed by binding targets or several plans (e.g. Chile's NDC plus a regional plan). Moderate: supported as a sector priority. Weak: only general mentions. Policy support contributes 75% of the alignment score.",
  relativeLevel:
    "How this indicator compares with other Chilean comunas, from very low to very high. These levels feed the feasibility assessment: supportive conditions raise an action's feasibility score, while constraining conditions lower it.",
  verdictEnabled:
    "The municipality has full legal authority and no legal restrictions were identified — the action is scored normally.",
  verdictConditional:
    "Authority is shared or partial, or soft restrictions apply (e.g. an authorization is needed) — the action is scored at a reduced rate and flagged for your review. A missing legal assessment also passes as conditional rather than being removed.",
  verdictBlocked:
    "The municipality lacks the legal authority to implement this action independently, or a hard legal restriction applies — the action is removed from the ranking before scoring begins.",
  legalStrength:
    "The strength of a legal check. Mandatory and required checks are binding: an action that fails one is excluded from the ranking. Recommended and optional checks only flag the action for review without excluding it.",
  modelConfidence:
    "How complete your city profile is for scoring. Confidence rises as you confirm more sections — emissions data and the legal context carry the most weight. Low confidence means the ranking relies more on defaults and national averages.",
} as const;
