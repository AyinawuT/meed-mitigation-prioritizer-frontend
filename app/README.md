# HIAP — High Impact Action Prioritizer

A climate mitigation action ranking tool for Chilean cities, built by the MEED+ team at Open Earth Foundation and Sustainability Solutions Group. HIAP combines a city's GHG inventory, regulatory context, national policy alignment, and socioeconomic profile to score and rank 155 candidate climate actions, giving municipal teams a data-driven starting point for their climate plans.

---

## What it does

1. A planner selects their city (currently fully supported: Iquique, CL IQQ)
2. They step through a six-stage profile wizard:
   - **Emissions data** — GHC inventory by GPC sector
   - **Socioeconomic context** — live city indicators from the OpenEarth ccglobal API
   - **Regulations & laws** — hard/soft legal constraints per action
   - **Strategic preferences** — sectors, co-benefits, timeline, custom scoring weights
   - **Policy alignment** (optional) — national plan scores sourced live from the ccglobal API
   - **Pre-flight check** — review, exclusions, weight tuning
3. HIAP sends the assembled city input to the **hiap-meed** Python backend, which runs the prioritization engine
4. Results are displayed on a Recommendations page: top-pick cards, a ranked table with score breakdowns, CSV export, and a detail drawer per action

---

## Folder structure

```
/
├── artifacts/
│   ├── api-server/              # Express 5 API server (proxy + local data endpoints)
│   │   ├── src/
│   │   │   ├── app.ts           # Express app wiring (middleware, CORS, routers)
│   │   │   ├── index.ts         # Server entry point (reads PORT env var)
│   │   │   ├── lib/
│   │   │   │   ├── logger.ts    # Pino structured logger
│   │   │   │   └── pipeline.ts  # Local scoring engine (fallback, not used in prod flow)
│   │   │   └── routes/
│   │   │       ├── health.ts    # GET /api/healthz
│   │   │       ├── geocode.ts   # GET /api/geocode — proxies OpenStreetMap Nominatim
│   │   │       ├── prioritize.ts# POST /api/prioritize — local fallback prioritizer
│   │   │       ├── hiapProxy.ts # POST /v1/prioritize, /v1/prioritize/exclusions/preview,
│   │   │       │                #   /v1/explanations/translate — proxies to hiap-meed backend
│   │   │       └── index.ts     # Router aggregator for /api/* routes
│   │   └── data/                # Static JSON datasets served by the local pipeline
│   │       ├── actions.json             # 155 candidate actions with scoring metadata
│   │       ├── actionsLegal.json        # Hard/soft legal requirements per action
│   │       ├── actionsPolicySignals.json# Pre-computed policy support scores (legacy, now live)
│   │       ├── cities.json              # Supported city list
│   │       ├── cityData.json            # Static city attribute snapshot (legacy, now live)
│   │       └── prioritizer_request_mock.json  # Example request payload for testing
│   │
│   └── hiap/                    # React + Vite frontend (main user-facing app)
│       └── src/
│           ├── App.tsx          # Route definitions (wouter) and QueryClient provider
│           ├── main.tsx         # React entry point
│           ├── index.css        # Global styles and Tailwind/shadcn CSS variables
│           ├── components/
│           │   ├── Navbar.tsx   # Top navigation (city name, language, methodology link)
│           │   ├── StepBar.tsx  # Six-step wizard progress bar with click-back navigation
│           │   ├── MapEmbed.tsx # OpenStreetMap embed for city profile page
│           │   └── ui/          # shadcn/ui component library (button, card, dialog, etc.)
│           ├── data/
│           │   ├── cities.ts           # CITIES array and city search helpers
│           │   ├── actions.json        # 155 actions (copy; api-server/data is authoritative)
│           │   ├── actionsLegal.json   # Legal requirements (copy)
│           │   ├── actionNames.json    # Action ID → display name lookup
│           │   ├── policyPlans.json    # Policy plan metadata (used by PreflightCheck display)
│           │   └── prioritizerRequestMock.json  # Mock payload used as fallback in Processing
│           ├── hooks/
│           │   └── use-mobile.tsx      # Viewport width breakpoint hook
│           ├── lib/
│           │   ├── hiapApi.ts          # API client: types + fetch wrappers for /v1/* endpoints
│           │   ├── scoringPipeline.ts  # Client-side scoring logic (local fallback only)
│           │   ├── stepProgress.ts     # localStorage read/write helpers for step state
│           │   ├── i18n.tsx            # Translation context and useTranslation hook (EN/ES)
│           │   └── utils.ts            # Tailwind class merger (clsx + tailwind-merge)
│           └── pages/
│               ├── Landing.tsx             # City search and "how it works" home page
│               ├── CityProfile.tsx         # City hub: step overview and progress cards
│               ├── EmissionsReview.tsx     # Step 1: GHG sector inventory review
│               ├── SocioeconomicContext.tsx# Step 2: Live city indicators from ccglobal API
│               ├── RegulationsLaws.tsx     # Step 3: Legal requirements per action
│               ├── StrategicPreferences.tsx# Step 4: Sector/co-benefit/timeline preferences
│               ├── PolicyAlignment.tsx     # Step 5 (optional): National policy plan scores
│               ├── PreflightCheck.tsx      # Step 6: Review, exclusions, weight sliders, CTA
│               ├── Processing.tsx          # Animated processing screen; calls /v1/prioritize
│               ├── Recommendations.tsx     # Ranked results, top picks, detail drawer, export
│               ├── Methodology.tsx         # Full scoring methodology documentation page
│               ├── About.tsx               # About / team page
│               └── not-found.tsx           # 404 page
│
├── lib/                         # Shared TypeScript library packages
│   ├── api-spec/                # OpenAPI spec source (used for codegen)
│   ├── api-zod/                 # Generated Zod schemas from OpenAPI spec
│   ├── api-client-react/        # Generated React Query hooks from OpenAPI spec
│   └── db/                      # Drizzle ORM schema (currently empty — no DB used yet)
│
├── data/                        # Raw source data and processing utilities (not served)
│   ├── dataLoader.ts            # CSV parsing utilities for raw dataset files
│   ├── apiService.ts            # Fetch helpers for upstream data sources
│   ├── csv/                     # Raw CSV exports: actions, legal signals, policy signals, cities
│   └── json/                    # Processed JSON snapshots: actions, cities, policy signals
│
├── scripts/                     # Workspace-level utility scripts
│   └── src/hello.ts             # Placeholder (to be replaced with data pipeline scripts)
│
├── package-lock.json            # npm lockfile for reproducible workspace installs
├── tsconfig.base.json           # Shared strict TypeScript defaults extended by all packages
├── tsconfig.json                # Solution-level tsconfig for composite lib packages only
└── package.json                 # Root: shared dev tooling (TypeScript, ESLint, Vitest)
```

---

## What has been implemented

### Frontend wizard (all 6 steps)
- **Landing page** — city search with OSM geocoding, quick-select chips for known cities
- **City profile hub** — step progress cards, entry point for each wizard step
- **Emissions review** — GPC sector table; Iquique pre-populated from 2022 inventory
- **Socioeconomic context** — live fetch from `ccglobal.openearth.dev/api/v0/city_attributes/{locode}`; renders all indicators dynamically (20 for IQQ), grouped by theme with per-category relevance text
- **Regulations & laws** — hard/soft legal requirement tags per action; confirm/flag interface
- **Strategic preferences** — sector focus, co-benefit priorities, implementation timeline
- **Policy alignment** (optional) — live national plan scores from ccglobal API; municipal plan file upload UI (processing handled offline by the team)
- **Pre-flight check** — full step summary, action exclusion engine, scoring weight sliders (Impact / Alignment / Feasibility), confidence meter, gated Generate CTA
- **Processing** — animated progress screen; calls `/v1/prioritize` → api-server proxy → hiap-meed backend
- **Recommendations** — TOP PICK cards (3-column, segmented reduction bar, sector/timeline metadata), ranked table with GPC sector column, action detail drawer (score breakdown, co-benefits, trade-offs, legal flag), "Pick top actions" checkbox mode with reorder/remove, CSV export

### Scoring pipeline
- Weights: Impact 55% · Alignment 22% · Feasibility 23% (user-adjustable in Pre-flight)
- Impact: emissions reduction share + timeline score
- Alignment: GPC sector match + strategic priority co-benefit match + national policy support score
- Feasibility: legal compliance (soft rules) + socioeconomic indicator match
- All scoring is performed server-side by the hiap-meed backend; the client-side `scoringPipeline.ts` is a local fallback only

### API server
- Proxy routes for `/v1/prioritize`, `/v1/prioritize/exclusions/preview`, `/v1/explanations/translate` → hiap-meed backend
- `/api/geocode` — OSM Nominatim proxy for city search
- `/api/healthz` — health check

### Internationalisation
- EN/ES translation context wired through the app; language toggle in Navbar

---

## What is still in progress or missing

- **Multi-city support** — only Iquique (CL IQQ) has a full GHG inventory; other Chilean cities show partial data
- **Emissions data entry** — users cannot yet enter their own GHG inventory; the form is read-only and pre-populated for IQQ
- **Municipal plan processing** — the file upload UI exists on the Policy Alignment page but processing is manual (team downloads and processes the file offline)
- **"Generate Plan" button** — the button exists on Recommendations but does not yet trigger a plan generation flow
- **PDF export** — Download dropdown shows "Export as PDF" but it is a placeholder; only CSV works
- **Database** — `lib/db` schema is empty; all state is currently in localStorage
- **Authentication** — no user accounts or session persistence across devices
- **Translation completeness** — i18n context exists but not all strings are translated to Spanish
- **Direct URL access to /processing** — bypasses the Pre-flight Check gate; no server-side guard

---

## Running locally

### Prerequisites

- Node.js 24+
- npm 11+ (bundled with Node.js 24+)
- Access to the hiap-meed Kubernetes backend (see Infrastructure section below)

### Install dependencies

```bash
npm install
```

### Environment variables

Copy `.env.example` to `.env` in the `app/` directory and adjust values if needed:

```bash
cp .env.example .env
```

The included local `.env` defaults already work for the standard setup below.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | Yes | `8000` | Port the API server listens on |
| `VITE_PORT` | No | `3000` | Port used by the frontend Vite dev server |
| `BASE_PATH` | No | `/` | Base path used by the frontend build and dev server |
| `HIAP_API_URL` | No | `http://localhost:9000` | URL used by the Node/Express container when it forwards requests to hiap-meed. This matters for Docker and Kubernetes; `npm run dev` frontend development uses the Vite proxy to `localhost:8000` instead |
| `NODE_ENV` | No | `development` | Set to `production` for production builds |
| `LOG_LEVEL` | No | `info` | Pino log level (`debug`, `info`, `warn`, `error`) |
| `SESSION_SECRET` | No | - | Reserved for future session middleware; not currently used |

The frontend dev server reads `VITE_PORT` for its local port and proxies backend requests to `PORT`.

### Start locally

This frontend should be run locally the usual way:

```bash
cd app
npm run dev
```

Then open `http://localhost:3000`.

Local assumptions:

- the frontend always runs on `3000`
- the backend is expected on `localhost:8000`
- the Vite dev server proxies both `/api/*` and `/v1/*` to `localhost:8000`

That means local prioritization and geocoding requests are forwarded to the backend on port `8000`, while Kubernetes and Docker still use the built frontend served by the Node/Express container.

## Running with Docker

1. Make sure hiap-meed is reachable from your host. One simple option is to port-forward the dev backend:

```bash
kubectl port-forward svc/hiap-meed-service-dev 9000:80 -n default
```

2. Build the image:

```bash
cd app
npm run docker:build
```

3. Run the container:

```bash
docker run --rm -p 8000:8000 -e HIAP_API_URL=http://host.docker.internal:9000 meed-mitigation-prioritizer-frontend:local
```

Then open `http://localhost:8000`.

### Why the Dockerfile sets `ENV`

The lines below in `app/Dockerfile` are there because the frontend Vite config reads `PORT` and `BASE_PATH` during the image build:

```Dockerfile
ENV NODE_ENV=production
ENV PORT=8000
ENV BASE_PATH=/
```

And these commands build the two npm workspace packages that the container needs:

```Dockerfile
RUN npm run build --workspace=@workspace/hiap
RUN npm run build --workspace=@workspace/api-server
```

- `@workspace/hiap` is the frontend package in `artifacts/hiap`
- `@workspace/api-server` is the Express backend package in `artifacts/api-server`
- `npm run ... --workspace=...` means "run the script only for this workspace package"

### Regenerating API types (after OpenAPI spec changes)

```bash
npm run codegen --workspace=@workspace/api-spec
```

### Pushing DB schema changes (if/when the DB is used)

```bash
npm run push --workspace=@workspace/db
```

---

## Infrastructure

### Architecture overview

```
Browser
  │  HTTP
  ▼
Kubernetes Service / Ingress
  ├── /              → built artifacts/hiap static app
  ├── /api/*         → artifacts/api-server  (Express)
  └── /v1/*          → artifacts/api-server  (Express, proxied onward)
                              │
                              │  HTTP POST (HIAP_API_URL)
                              ▼
                       hiap-meed backend  (Python / FastAPI)
                       Kubernetes cluster (Open Earth Foundation)
```

### Kubernetes deployment

This repository now keeps runnable application code under `app/` and deployment infrastructure under top-level `k8s/`. The GitHub Actions workflows watch `app/**` for app changes and `k8s/**` for deployment manifest changes, while building from the `app/` directory following the `hiap-meed` and `CityCatalyst/app` pattern.

Branch-to-environment mapping:

- `develop` -> dev cluster deployment via `k8s/deployment-dev.yml`
- `main` -> prod cluster deployment via `k8s/deployment-prod.yml`

The container image is published to:

- `ghcr.io/open-earth-foundation/meed-mitigation-prioritizer-frontend:dev`
- `ghcr.io/open-earth-foundation/meed-mitigation-prioritizer-frontend:stable`

The frontend service talks to the hiap-meed backend through the in-cluster services in the `default` namespace:

- dev: `http://hiap-meed-service-dev`
- prod: `http://hiap-meed-service-prod`

### Local backend assumption

For local frontend development, this repo assumes the backend is reachable at `http://localhost:8000`.

For the containerized Node/Express app, `HIAP_API_URL` should point at a reachable hiap-meed backend from inside the container. In Kubernetes this is set via the deployment manifests to:

- dev: `http://hiap-meed-service-dev`
- prod: `http://hiap-meed-service-prod`

---

## Changelog

### June 2026
- **Dynamic socioeconomic indicators**: replaced 9 hardcoded indicators with fully dynamic rendering of all fields returned by the ccglobal `city_attributes` API (20 indicators for IQQ). Theme grouping and relevance text are driven by an enrichment map keyed to API field names.
- **Scoring pipeline key fix**: cleared `INDICATOR_KEY_MAP` — action rule keys in `actions.json` already match ccglobal API keys directly, so the old remappings were incorrect.
- **Policy alignment upload text**: updated municipal plan upload description to accurately reflect the manual processing workflow.

### May 2026
- **Live API integration**: replaced three static data sources with live API calls:
  - `citiesMock.json` → `ccglobal city_attributes` API (SocioeconomicContext)
  - `actionsPolicySignals.json` → `ccglobal action-policy-scores` API (scoring pipeline + PolicyAlignment page)
  - Local socioeconomic scoring → `ccglobal action-mitigation-feasibility-scores` API (scoring pipeline)
- **Scoring pipeline async**: `runPipeline` made async; policy map and mitigation feasibility map fetched concurrently

### April 2026
- **Scoring weight sliders** moved from Strategic Preferences → Pre-flight Check (full-width card, 3-column grid, defaults Impact 55 / Alignment 22 / Feasibility 23, "Reset to defaults" button)
- **GPC sector column** in TOP PICK cards and ranking table (derived from `action.gpcRefs[0]` prefix: I → Stationary Energy, II → Transportation, etc.)
- **Recommendations page redesign**: TOP PICK badge, segmented reduction bar, "GENERATE PLAN" bordered button, removed Estimated Cost row
- **Pick top actions**: checkbox selection mode, reorder with ↑↓ arrows, replaces top 3 section
- **Download dropdown** with functional CSV export; PDF export placeholder
- **Action detail drawer**: right-side panel with score breakdown bars, co-benefits, trade-offs, legal flag
- **electricity_access data fix**: corrected from `"very low"` to `"very high"` for Iquique (100% electricity access), aligning feasibility scores with the reference pipeline
