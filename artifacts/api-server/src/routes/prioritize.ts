import { Router } from "express";
import { runPipeline, allData, type PrioritizerRequest } from "../lib/pipeline.js";

const router = Router();

// POST /api/prioritize
router.post("/prioritize", (req, res) => {
  try {
    const body = req.body as {
      requestData?: { cityDataList?: PrioritizerRequest[] };
    } & PrioritizerRequest;

    // Accept both wrapper format (prioritizer_request_mock.json) and flat format
    let cityReq: PrioritizerRequest;
    if (body.requestData?.cityDataList?.[0]) {
      cityReq = body.requestData.cityDataList[0];
    } else if (body.locode && body.cityEmissionsData) {
      cityReq = body as PrioritizerRequest;
    } else {
      res.status(400).json({ error: "Invalid request body. Provide locode and cityEmissionsData." });
      return;
    }

    // Find city record (fall back to default if not found)
    const cityRecord = (allData.cities.find(
      c => c.locode.replace(" ", "-") === cityReq.locode.replace(" ", "-")
    ) ?? allData.defaultCity) as Record<string, unknown>;

    const result = runPipeline(cityReq, cityRecord);

    res.json({
      meta: {
        generatedAtUtc: new Date().toISOString(),
        locode: cityReq.locode,
        totalRanked: result.ranked.length,
        totalDiscarded: result.discarded.length,
        totalCityEmissions: result.totalCityEmissions,
        weights: cityReq.weightsOverride ?? { impact: 0.55, alignment: 0.22, feasibility: 0.23 },
      },
      ranked: result.ranked,
      discarded: result.discarded,
      cityEmissionsByGpc: result.cityEmissionsByGpc,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "Pipeline failed", detail: message });
  }
});

// GET /api/cities
router.get("/cities", (_req, res) => {
  res.json({ cities: allData.cities });
});

// GET /api/city/:locode
router.get("/city/:locode", (req, res) => {
  const lc = decodeURIComponent(req.params.locode).replace("-", " ");
  const city = allData.cities.find(c => c.locode.replace(" ", "-") === lc.replace(" ", "-"));
  if (!city) {
    res.status(404).json({ error: "City not found" });
    return;
  }
  res.json({ city });
});

// GET /api/actions
router.get("/actions", (_req, res) => {
  res.json({ total: allData.actions.length, actions: allData.actions });
});

export default router;
