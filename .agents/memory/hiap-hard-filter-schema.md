---
name: HIAP hard_filter_evidence schema
description: Backend schema for blocked-action evidence in hard_filter_evidence_by_action_id; adaptApiResult must read legal_assessment_summary, not just legal.
---

## Rule
`adaptApiResult()` in `Processing.tsx` must look at **both** `hfEv.legal` (v2+ rich object) and `hfEv.legal_assessment_summary` (v1 current backend) when extracting ownership/restrictions categories for blocked actions.

**Why:** The current backend (as of 2026-07) puts the verdict data inside `legal_assessment_summary`, not in a nested `legal` object. Reading only `hfEv.legal` yields `null` for all ownership/restrictions fields even though the data is present.

## Real shape (current backend)
```json
{
  "discard_reason": "legal_verdict_blocked",
  "legal_assessment_present": true,
  "legal_verdict_category": "blocked",
  "legal_hard_filter_blocked": true,
  "legal_verdict_score": 0,
  "legal_assessment_summary": {
    "country_code": "CL",
    "gpc_sector": "stationary_energy",
    "ownership_category": "blocked",
    "ownership_score": 0,
    "restrictions_category": "blocked",
    "restrictions_score": 0,
    "analysis_date": "2026-04-30",
    "generation_method": "expert review"
  }
}
```

## How to apply
In the `for ... of Object.entries(hardFilterById)` loop:
```typescript
const lv  = hfEv.legal;                    // v2+ (may be undefined)
const las = hfEv.legal_assessment_summary;  // v1 current backend
const verdict = lv?.verdict_category ?? hfEv.legal_verdict_category ?? null;
// ownership/restrictions: prefer lv, fall back to las
const ownershipCategory = lv?.ownership_category ?? las?.ownership_category ?? null;
const restrictionsCategory = lv?.restrictions_category ?? las?.restrictions_category ?? null;
// sector: prefer local GPC refs, fall back to las.gpc_sector
const sectorTag = gpcRefs.length > 0 ? gpcToSectorTag(gpcRefs) : (las?.gpc_sector ?? "cross_sector");
```

## Live data summary (CL ANF, 2026-07-07)
- 102 total actions in hard_filter_evidence
- 19 blocked (excluded from ranking) — all names resolve from actions.json
- Sector breakdown: 11 stationary_energy, 4 waste, 4 transportation
- 0 flagged (assessment_missing) in the top-10 ranked_actions
- The verdict filter (`lv?.verdict_category ?? hfEv.legal_verdict_category`) still works correctly for identifying blocked entries even when `lv` is undefined
