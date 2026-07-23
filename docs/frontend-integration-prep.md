# Frontend integration prep — plan of work

**Audience: the coding agent.** This plan is written to be executed by an agent under supervision.
Carlos directs and approves; he does not write code and does not verify by reading diffs. Every
task below must therefore be provable by the agent through checks a non-developer can trust (the
app still runs, it looks identical, typecheck/build pass) — not by "trust me, it's correct."

Companion strategy docs (the *destination*, CityCatalyst side) live in that repo's PR #2887. This
doc is only about the *origin* side: what we do to **this** repo
(`meed-mitigation-prioritizer-frontend`) to make the eventual port smaller and safer.

---

## 0. In plain terms (read this first)

The rest of this doc is written for the agent and uses some jargon. Here's the whole plan in plain
language, and what the technical words mean.

**The idea.** Right now the prototype is one tangled app: the "thinking" (which actions rank
highest, how emissions add up) is mixed into the "looks" (buttons, tables, colors). When we move it
into CityCatalyst we have to rebuild the *looks* anyway — CityCatalyst has its own design. So before
we move, we tidy the app **without changing how it looks or works**: we pull the thinking out of the
looks, clean up, and put one tidy "plug" between the app and the internet. Then the move into
CityCatalyst is re-skinning a clean app instead of untangling a messy one.

**The steps, in order:**

1. **Take a "before" snapshot.** Screenshot every screen and record the data it loads, so we have
   proof of exactly how the app looks and behaves today. *(This snapshot is what "golden master"
   means below.)* You approve it once as "this is correct." From then on, after every change, we
   just check the app still matches the snapshot.
2. **Throw out the junk.** Delete code that's dead or unused, so there's less to move.
3. **Write down the data agreement.** Pin down, in one place, the exact shape of the messages the
   app sends and receives. The backend team needs this anyway.
4. **Put in one plug.** Today the app reaches out to the internet from ~22 scattered spots. We
   funnel all of them through a single point, so in CityCatalyst there's one thing to reconnect
   instead of 22.
5. **Separate thinking from looks.** For each screen, move the "thinking" into its own file so it
   can travel to CityCatalyst untouched; the "looks" stay behind (they get rebuilt over there).
6. **Collect the text.** Gather all the on-screen English wording into one list, ready for
   translation later.

**The rule that keeps this safe:** every step is a *tidy-up, never a redesign*. The app must look
and work **exactly the same** after each step. The only thing you have to check is: *does it still
look and behave like the "before" snapshot?* If a screen changes, the step went wrong.

**Glossary (words used below):**
- **Golden master** — the approved "before" snapshot (screenshots + recorded data). Our yardstick
  for "did we accidentally change anything?"
- **Behavior-preserving / refactor** — tidying the code's insides without changing what the user
  sees. The opposite of a redesign.
- **Seam / `dataClient`** — the single "plug" from step 4: one place all internet traffic goes
  through.
- **Contract** — the written-down data agreement from step 3 (the exact shape of requests and
  responses).
- **Gates (typecheck / build)** — automatic checks the agent runs to prove nothing is broken. You
  don't run these; the agent does and reports the result.
- **Design system** — CityCatalyst's ready-made set of buttons, cards, inputs, and colors (see §1).
  When we rebuild the looks over there, we use these, not hand-made ones.

---

## 1. The question this answers

> The prototype lives in its own repo, external to CityCatalyst. Can we adapt it *first*, in place,
> so it's ready for integration? What's the best strategy?

**Short answer: yes, but only for the parts that survive the move.** Roughly half the frontend work
cannot be prepared in-place and is genuinely new in CityCatalyst. The other half — all the
non-visual logic — can be cleaned and reshaped here, in a running app we can see, before anything
is ported. Doing that first turns the CityCatalyst port from "rewrite a tangled app" into "re-skin
an already-clean one."

### What survives the move (worth preparing here)

- **Business/derivation logic** — scoring adaptation, emissions math, table/row building, policy
  and finance aggregation. Framework-agnostic. Copies into CityCatalyst almost as-is.
- **The API contract** — request/response types. Milan needs these for week-0 anyway.
- **The data-access shape** — *where* and *how* the app reads/writes the outside world.
- **The English copy** — becomes the source strings for i18next.

### What does NOT survive (do not invest here)

- The **looks**, which are rebuilt on CityCatalyst's own **design system** — not raw Chakra. See
  the priority order below; this is a target we can't reproduce in a Vite/Tailwind app.
- Next App Router vs `wouter` — routing is a CityCatalyst-side change.
- RTK Query vs react-query — CityCatalyst's data layer.
- The i18next *mechanism* — only the strings carry over, not the plumbing.

### The looks are rebuilt on CityCatalyst's design system, in this priority order

CityCatalyst does not just "use Chakra" — it has a curated component library and a predefined theme
on top of it. When the presentation is rebuilt (CityCatalyst side, **not here**), the order of
preference is:

1. **Reuse CityCatalyst's design-system components first** — `app/src/components/ui/` (primitives:
   button, dialog, field, data-table, …) and `app/src/components/package/` (e.g. typography:
   `Texts/Button`, `Texts/Body`, `Texts/Title`). Match an existing component before building
   anything.
2. **Themed Chakra with semantic tokens** where no design-system component fits — colors and
   spacing come from `app/src/lib/theme/` tokens, **never** hardcoded values.
3. **Raw/custom Chakra only as a last resort**, and flagged for review when used.

This matters for our prep in one concrete way: while we separate looks from thinking (Phase 4), the
agent also produces a **component-mapping table** — each shadcn/Radix primitive the prototype uses,
paired with its CityCatalyst design-system equivalent — so the eventual rebuild is a lookup, not a
research task.

**The dividing line, stated once:** if we'd rewrite it during the Chakra port anyway, we do NOT
touch it twice here. If it's logic we'd carry over, we clean it here where the running app proves
we didn't break it.

---

## 2. The strategy: seam-first, behavior-preserving

We use the disposable Vite/Radix shell as a **test harness for its own guts**. The app keeps
running and looking identical at every step; underneath, we pull the portable logic out of the
UI, put one clean seam between the app and the outside world, and delete the genuinely dead code.

Three properties make this safe to hand to an agent with a non-coding supervisor:

1. **Behavior-preserving invariant.** Every task is a refactor, never a redesign. The app must look
   and behave *identically* before and after. If a screen changes visibly, the task failed.
2. **Golden master before touching anything** (§4). Because this repo has **no test tooling**, our
   safety net is a captured record of current behavior — screenshots per screen + recorded API
   responses — that we diff against after each step. This is what lets Carlos approve "correct"
   once and then just confirm "still looks the same."
3. **Small, ordered, always-green steps.** No step leaves the app broken. Each ends with machine
   gates (typecheck, build, boot) the agent runs and reports.

---

## 3. How we work (agent ⇄ supervisor)

**Per task, the agent:**
1. States the goal and the exact files it will touch, and waits for go-ahead on anything ambiguous.
2. Makes the change **behavior-preserving** — no visible difference.
3. Runs and reports the task's **Done-when gates** (below). Never claims done without them.
4. If a gate fails or behavior changed, says so plainly and stops — does not paper over it.

**Per task, Carlos:**
- Approves the golden master once (§4) as "this is correct behavior."
- After each task, spot-checks the running app against the golden screenshots — the only
  verification needed is *"does it still look and work the same?"*
- Directs scope and priority; approves deletions.

**Standing gates every task must pass** (agent runs, agent reports):

```bash
npm run typecheck --workspace=@workspace/hiap   # must pass
npm run build     --workspace=@workspace/hiap   # must succeed
npm run dev       --workspace=@workspace/hiap   # app boots, no console errors
```

Plus the task-specific "Done when" line. Plus: **golden master unchanged** (§4).

---

## 4. Phase 0 — Safety net (do this first, once)

**Goal:** capture current behavior so every later step is verifiable without reading code.

**Agent does:**
- Write a short **reference walkthrough**: the exact click-path through the full wizard for one
  seeded city, in both `en` and `es`, ending at a fully-rendered Recommendations page. Save as
  `docs/reference-walkthrough.md`.
- Capture **golden screenshots** of every screen in that walkthrough (both languages) into
  `docs/golden/`. Use the browser-preview tooling; one image per screen per language.
- Capture **network fixtures**: record the real responses from every `hiap-meed` and Global API
  call during one full run, saved as JSON under `docs/golden/fixtures/`. (These double as the exact
  data the backend's golden test will need — hand them to Milan/Mirco.)

**Done when:** `docs/reference-walkthrough.md` exists; `docs/golden/` has a screenshot per screen ×
language; fixtures are saved. **Carlos approves this set as the definition of "correct."** Nothing
else starts until he does.

**Why it's non-negotiable:** with no tests, this is the *only* regression signal. It's also the
artifact that lets a non-developer sign off on correctness once and then verify by eye thereafter.

---

## 5. Phase 1 — Delete dead weight

**Goal:** shrink the surface the port has to understand. Pure subtraction.

**Agent does:**
- **Split `lib/scoringPipeline.ts` (874 LOC), don't blind-delete it.** It is a *mix*: the
  client-side scoring math and its `fetch()` calls (`fetchPolicyMap`, `fetchMitigationMap`,
  `fetchFinanceMap`, the scoring functions) are **dead** — the backend owns scoring now. But the
  file also exports **live** symbols the app depends on: the types `PipelineResult`, `RankedAction`,
  `LegalData`, `LegalExcludedAction`, the constant `PIPELINE_RESULT_SCHEMA_VERSION`, and the
  function `deriveEmissions()` (all imported by `pipelineRunner.ts`, `Recommendations.tsx`,
  `RegulationsLaws.tsx`). Move the live symbols into a clean `lib/resultTypes.ts` +
  `lib/deriveEmissions.ts`; delete the dead scoring/fetch code; update the three importers.
- Delete the unused chart stack: `components/ui/chart.tsx` and the `recharts` dependency — grep
  first to confirm nothing imports it (the app has no charts).
- Delete the mock fallback path: `data/prioritizerRequestMock.json` and the "fall back to mock"
  branch in `pipelineRunner.ts` — no inventory should mean a precondition state later, not fake
  data. (Flag to Carlos before removing, since it changes behavior for a city with no inventory —
  this is the one place we may *intentionally* break behavior; confirm first.)

**Done when:** `grep -r "scoringPipeline\|recharts\|prioritizerRequestMock"` returns only expected
hits; standing gates pass; golden master unchanged (except the mock-fallback case, if Carlos
approved changing it).

---

## 6. Phase 2 — Extract the API contract

**Goal:** produce the single source of truth for request/response shapes that both this app and
CityCatalyst build against. This is a **hand-off artifact** — it's what Milan extracts in week 0,
so producing it here does his week-0 job for him.

**Agent does:**
- Create `lib/contract/` (or a tiny standalone package) holding the request/response types that
  currently live in `lib/hiapApi.ts` and `lib/reportApi.ts`: `FrontendCityInput`,
  `PrioritizerRequestData`, `PrioritizerApiCityResult`, `RankedActionResult`, exclusions preview
  types, `ReportOutputPlanResponse`, the i18n text helpers' types, etc. **Types and pure helpers
  only — zero imports from React, fetch, or app code.**
- Point `hiapApi.ts` and `reportApi.ts` at the contract module.

**Done when:** the contract module has no runtime dependencies; the two API files import from it;
standing gates pass; golden master unchanged. Deliverable noted for Milan.

---

## 7. Phase 3 — One data seam (highest-leverage step)

**Goal:** collapse the app's entire conversation with the outside world into a single, swappable
interface. Today that conversation is **16 `fetch()` calls scattered across 7 files** plus **6
`localStorage` key families** touched from many components (both fully enumerated in the
CityCatalyst inventory doc). After this phase there is exactly one place to reimplement.

**Agent does:**
- Define `lib/dataClient.ts` — one interface covering every read and write the app needs:
  - **Remote reads:** prioritize, exclusions preview, report output-plan, explanations translate,
    action catalog, city attributes, policy scores, mitigation feasibility, finance
    feasibility/projects/opportunities.
  - **Persistence:** get/set preferences, exclusions, ranking result, snapshot, step progress.
- Provide the current behavior as `dataClient.local.ts` — direct `fetch()` + `localStorage`, moved
  verbatim from where it lives now. **No behavior change; just relocation behind the interface.**
- Replace every direct `fetch()` and `localStorage` call in components/pages with a `dataClient`
  call. When done, **no component references `fetch` or `localStorage` directly.**

**Done when:** `grep -rn "fetch(\|localStorage" src/pages src/components` returns nothing (only
`dataClient.local.ts` and `lib/*` may touch them); standing gates pass; golden master unchanged.

**Why this is the biggest win:** it converts the CityCatalyst port's hardest, most error-prone
task — hunting 22 scattered I/O sites across pages and rewiring each — into "write one RTK
Query-backed `dataClient` that satisfies a known interface." The seam is the integration point.

---

## 8. Phase 4 — Separate logic from presentation

**Goal:** make each screen's brain portable, independent of its Radix skin.

**Agent does, one screen at a time (start with the smallest, end with `Recommendations`):**
- Move the pure logic — derivations, adaptations, formatting, aggregation — out of the page
  component into a co-located module or a hook that depends only on `dataClient` and the contract
  types. The page keeps its Radix JSX for now (disposable), but its non-JSX logic becomes a
  framework-agnostic unit.
- For `Recommendations.tsx` (2,134 LOC, already **8 components in one file** — `ReductionBar`,
  `ScoreBar`, `EmptyState`, `DetailPanel`, `TopPickCard`, `RankingTable`, `ContextBreakdownTab`,
  and the page): split each into its own file. This is the one screen big enough that splitting is
  worthwhile *here* — it lets the later Chakra rewrite proceed piece by piece and in parallel.

**Agent also produces (once, alongside the screens):** `docs/component-map.md` — a table pairing
each shadcn/Radix primitive the prototype uses (`Card`, `Dialog`, `Tabs`, `Badge`, `Select`, …)
with its CityCatalyst design-system equivalent in `app/src/components/ui/` or
`app/src/components/package/`, and noting the few that have no direct match (candidates for themed
Chakra). This is the lookup table that makes the CityCatalyst rebuild mechanical and keeps it on the
design system rather than raw Chakra.

**Done when (per screen):** the screen's logic lives in a testable module importing only
`dataClient` + contract types; the page file is presentation + that module; standing gates pass;
golden master for that screen unchanged. Plus `docs/component-map.md` exists.

**Note:** this is the phase to add lightweight unit tests *if* we choose to (the logic is now pure
and testable). Optional — flag to Carlos; the golden master already covers regressions.

---

## 9. Phase 5 — i18n: extract strings, defer re-keying (decision point)

**Recommendation: do NOT re-key translations in this repo.** The strings are keyed by their
English source today (`t("How this score is calculated")`). Converting to structured keys
(`t("recommendations.score-explainer")`) touches every call site — and the Chakra rewrite touches
every call site anyway. Re-keying now means editing every component **twice**. Defer the re-key to
the port, where it rides along with the visual rewrite for free.

**What we *do* here (cheap, portable):** the agent produces `docs/strings.en.json` — a flat catalog
of every user-facing English string in the app, extracted from `lib/translations/`. That's the raw
material the i18next EN file is built from during the port, with no double-editing of components.

**Done when:** `docs/strings.en.json` exists and covers the translation modules; no component
changes.

---

## 10. What the port receives (the hand-off)

After this prep, the CityCatalyst work inherits:

- A **dead-code-free** app (Phase 1).
- A **formal contract** module — Milan's week-0 artifact, already done (Phase 2).
- A **single `dataClient` seam** to reimplement on RTK Query + CityCatalyst routes, instead of 22
  scattered I/O sites (Phase 3).
- **Portable logic modules** per screen; the port rewrites *skins*, not brains (Phase 4).
- A **component-mapping table** (Phase 4) so the skin rebuild reuses CityCatalyst's design-system
  components by lookup, rather than reinventing them or dropping to raw Chakra.
- A **golden master + network fixtures** to check the port against, and the fixtures the backend's
  golden test needs (Phase 0).
- An **EN string catalog** for the i18next file (Phase 5).

The CityCatalyst-side rewrite that remains — genuinely new work, not preparable here — is:
rebuilding the presentation **on CityCatalyst's design system** (`components/ui/` +
`components/package/` first, themed Chakra tokens second, raw Chakra last), Next routing, the RTK
Query `dataClient` implementation, and the i18next re-key. That is the frontend track in PR #2887 §8.

---

## 11. Guard rails

- **Behavior-preserving is the law.** The only intentional behavior change in the whole plan is
  removing the mock-inventory fallback (Phase 1), and even that is confirmed with Carlos first.
- **Never leave the app broken** between tasks. Small steps, always green.
- **No CityCatalyst dependencies enter this repo.** No Chakra, no Next, no RTK. Prep stays
  framework-agnostic; that's what keeps it portable and keeps the app runnable as our test harness.
- **The agent proves, the supervisor confirms by eye.** No task is "done" on assertion alone.
- **When unsure whether something survives the move, ask before investing.** The default is: clean
  logic, leave skin alone.

---

## 12. Suggested order (each step ships independently)

1. Phase 0 — golden master + fixtures → **Carlos approves**
2. Phase 1 — delete dead weight (split `scoringPipeline`, drop `recharts`, confirm mock removal)
3. Phase 2 — extract contract module (hand to Milan)
4. Phase 3 — the `dataClient` seam
5. Phase 4 — logic/presentation split, smallest screen → `Recommendations` last
6. Phase 5 — EN string catalog

Phases 1–3 are the highest value and the most agent-friendly. Phase 4 is the largest but fully
incremental and screen-independent. None of it depends on the CityCatalyst-side decisions, so this
whole track can start as soon as the golden master is approved — including before kickoff.
