# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

---

## HIAP — High Impact Action Prioritizer

### Project Goal
Climate mitigation action ranking tool for Chilean cities, built as a fully functional React/Vite app.
Design system: **MEED+** — white backgrounds, deep navy nav `#001EA7`, green CTA `#16A34A`, amber accent `#F59E0B`.
Outer background: `#F5F5F7`.

### Artifacts
| Artifact | Kind | Path | Notes |
|---|---|---|---|
| `artifacts/hiap` | react-vite | `/` | Main HIAP web app |
| `artifacts/api-server` | api | — | Shared Express backend (data files live here) |
| `artifacts/mockup-sandbox` | design | — | UI mockups (canvas reference) |

### Routes
`/` → `/city/:locode` → `/city/:locode/emissions` → `/city/:locode/socioeconomic` → `/city/:locode/regulations` → `/city/:locode/strategic` → `/city/:locode/policy` → `/city/:locode/preflight` → `/city/:locode/processing` → `/city/:locode/recommendations`

### Key Data Files (`artifacts/api-server/data/`)
- `actions.json` — 155 actions (indexed 0–154), each with `actionId`, `actionName`, `actionCategory`, `emissions` (with `sector_number` I–V and `gpc_reference_number`), `socioeconomicIndicators`, `coBenefits`
- `cityData.json` — single city object at `d.city` with locode `CL IQQ`; indicators are direct keys (e.g. `d.city.electricity_access`, `d.city.transport_logistics_employment`)
- `actionsPolicySignals.json` — pre-calculated `policy_support_score` (0–1) per action
- `policyPlans.json` — 7 national + 1 regional plan
- `actions-legal.json` / `legalRequirements.json` — hard/soft legal requirements per action

### Scoring Pipeline (`artifacts/hiap/src/lib/scoringPipeline.ts`)
**Weights**: Impact 55% · Alignment 22% · Feasibility 23% (overridable)

**Impact** = 0.8 × reductionShare + 0.2 × timelineScore
**Alignment** = 0.15 × sectorComponent + 0.05 × otherComponent (co-benefit match) + 0.80 × policyComponent
**Feasibility** = 0.5 × softLegalComponent + 0.5 × socioeconomicComponent

**Key indicator key remapping** (`INDICATOR_KEY_MAP`):
- `employment_in_transport_and_logistics` → `transport_logistics_employment`
- `electricity_access_rate` → `electricity_access`

**Known data fix**: `electricity_access` was corrected from `"very low"` → `"very high"` (Iquique has 100% electricity access). This raises feasibility by ~+0.10 for actions where electricity_access is a supportive indicator. The engineer's reference pipeline used the old incorrect value, explaining the feasibility divergence.

**Missing indicator treatment**: always count the weight in the denominator (matching reference spec), contributing 0 to the numerator.

### Co-benefit → strategic priorities matching
`PRIORITY_KEYWORD_MAP` maps free text to 7 co-benefit dimensions: `air_quality`, `cost_of_living`, `habitat`, `housing`, `mobility`, `stakeholder_engagement`, `water_quality`. The `otherComponent` (strategic priorities match) is live and wired through the alignment score.

### Storage Schema (localStorage)
- `hiap:{locode}:strategic:form` — `{ sectors, strategicPriorities, timeline, excludeText, weights? }` where `weights = { impact, alignment, feasibility }` as integers (%)
- `hiap:{locode}:results` — full `PipelineResult` JSON
- `hiap:{locode}:step:{key}` — `StepProgress` per form step

### Scoring Weights
- Sliders live on the **Pre-flight Check page** (`PreflightCheck.tsx`) — NOT on Strategic Preferences
- Defaults: Impact 55, Alignment 22, Feasibility 23
- Range: 5–90%, proportional redistribution on change, "Total: 100%" badge, "Reset to defaults" button
- `Processing.tsx` reads weights from localStorage and converts integer % → decimals for `weightsOverride`

### GPC Sector Mapping (Recommendations page)
Derived from `action.gpcRefs[0]` prefix:
- `I` → Stationary Energy · `II` → Transportation · `III` → Waste · `IV` → IPPU · `V` → AFOLU
- No refs → "Cross-sector"

### Recommendations Page Features
- **TOP PICK cards**: 3-column, segmented reduction bar, sector/timeline metadata, "See more details" drawer, "GENERATE PLAN" bordered button
- **Pick top actions**: checkbox selection mode on ranking table, selected actions replace the top 3 section with reorder (↑↓) and remove (✕) controls
- **Download dropdown**: Export as CSV (functional) · Export as PDF (placeholder)
- **Detail panel**: right-side drawer with score breakdown bars, co-benefits, trade-offs, legal flag

### Session Summary (last session — 8 Apr 2026)
Completed:
1. Weight sliders moved from StrategicPreferences → PreflightCheck (full-width card, 3-column grid layout)
2. Processing.tsx reads weights from localStorage and applies as `weightsOverride`
3. StrategicPreferences preserves existing weights on save (not clobbered)
4. "MEED+ HIAP methodology" wording in scoring weights subtitle
5. GPC sectors now shown in TOP PICK cards and ranking table (was showing action category)
6. Recommendations card redesign: TOP PICK badge, segmented reduction bar, Generate Plan button, removed Estimated Cost row
7. Pick top actions: checkbox selection, reorder with arrows, replaces top 3 section
8. Download dropdown with CSV export
9. Confirmed electricity_access "very high" fix is the root cause of feasibility divergence vs. engineer reference (+0.10 to feasibility for actions with electricity_access as supportive indicator)

### Next Session — Areas to Continue
- Recommendations page: "Generate Plan" button functionality (plan generation flow)
- Any remaining scoring pipeline alignment issues with reference engineer
- City Profile Hub improvements or other pages as needed
