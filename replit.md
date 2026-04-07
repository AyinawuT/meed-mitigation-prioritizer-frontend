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
Design system: **MEED+** — white backgrounds, deep navy nav `#001EA7`, green CTA `#16A34A`, amber/orange priority badges.

### Artifacts
| Artifact | Kind | Path | Notes |
|---|---|---|---|
| `artifacts/hiap` | react-vite | `/` | Main HIAP web app |
| `artifacts/api-server` | api | — | Shared Express backend |
| `artifacts/mockup-sandbox` | design | — | UI mockups (canvas reference) |

### Data Layer (`/data/`)
All 16 mock API files are organized under `/data/`:
- **`/data/json/`** — 8 mock JSON responses: `actions.json` (155 actions), `actions-legal.json`, `actions-policy-signals.json`, `cities.json` (11 cities), `city.json` (CL IQQ detail), `projects.json`, `prioritizer-request.json`, `prioritizer-bulk-request.json`
- **`/data/csv/`** — 8 raw datasets: `policy-signals.csv`, `policy-evidence.csv`, `legal-signals.csv`, `legal-evidence.csv`, `legal-signal-codes.csv`, `action-legal-requirements.csv`, `city-context.csv`, `cities-list.csv`
- **`/data/dataLoader.ts`** — CSV parsing utilities: `getPolicySignals()`, `getLegalSignals()`, `getCityContext(locode?)`, etc.
- **`/data/apiService.ts`** — JSON service: `getActions()`, `getCityData()`, `getProjects()`, etc.

### HIAP App Pages (`artifacts/hiap/src/`)
| File | Status | Notes |
|---|---|---|
| `pages/Landing.tsx` | ✅ Done | City search, autocomplete, map preview, "How it works", city grid |
| `pages/CityProfile.tsx` | 🔜 Next | City Profile Hub — see below |
| `components/Navbar.tsx` | ✅ Done | Sticky MEED+ navy navbar |
| `data/cities.ts` | ✅ Done | 11 real cities with locode, region, emissions, population, area, mapUrl |

### Canvas Mockup Reference (mockup-sandbox)
All HIAP UI mockup shapes on the canvas — use as visual reference when building:
- `hiap-landing` — Landing page (✅ implemented)
- `hiap-city-profile` — City Profile
- `hiap-emissions` / `hiap-emissions-adjust` — Emissions Review/Adjust
- `hiap-socioeconomic` — Socioeconomic Context
- `hiap-regulations` — Regulations & Laws
- `hiap-strategic` — Strategic Preferences
- `hiap-policy` — Policy Alignment
- `hiap-preflight` — Pre-flight Summary
- `hiap-processing` — Processing screen
- `hiap-results` / `hiap-results-panel` — Results & Detail Panel

### Step Bar (6 steps, 0-indexed)
`0=Emissions data · 1=Socioeconomic context · 2=Regulations & laws · 3=Strategic preferences · 4=Policy alignment · 5=Pre-flight check`

### Next Session: City Profile Hub
The City Profile Hub is the page reached after clicking "Open {City} City Profile" on the Landing page.
It should show:
- City name, region, locode, key stats (population, area, emissions year)
- Entry point to start the HIAP prioritization wizard (6-step flow)
- Socioeconomic indicators overview (from `city-context.csv` / `city.json`)

Route: `/city/:locode` (e.g. `/city/CL-IQQ`)
Mockup reference: canvas shape `hiap-city-profile`
