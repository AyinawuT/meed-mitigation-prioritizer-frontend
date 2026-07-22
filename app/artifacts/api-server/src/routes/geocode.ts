import { Router } from "express";
import https from "https";

const router = Router();

const cache = new Map<string, { lat: number; lon: number } | null>();

// Rank a Photon feature by how likely it is to be the actual municipality
// (comuna) rather than the surrounding region/province. Photon frequently
// returns the metropolitan region first and omits country_code, so a naive
// "first CL hit" pick lands on the region centroid — e.g. Santiago resolved
// to "Santiago Metropolitan Region" instead of the Santiago comuna.
const MUNICIPAL = new Set(["city", "town", "municipality", "village"]);
const REGIONAL = new Set(["state", "region", "province", "county", "district"]);

function scoreFeature(f: any, name: string): number {
  const p = f?.properties ?? {};
  const key = String(p.osm_key ?? "").toLowerCase();
  const val = String(p.osm_value ?? "").toLowerCase();
  const type = String(p.type ?? "").toLowerCase();
  let score = 0;

  if (key === "place" && MUNICIPAL.has(val)) score += 100;
  else if (MUNICIPAL.has(type)) score += 90;
  else if (key === "boundary" && val === "administrative") score += 40;

  if (REGIONAL.has(val) || REGIONAL.has(type)) score -= 100;

  if (p.country_code === "CL" || String(p.country ?? "").toLowerCase().includes("chile")) score += 20;
  if (String(p.name ?? "").toLowerCase() === name.toLowerCase()) score += 30;

  return score;
}

function fetchPhoton(name: string, region: string): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    const q = encodeURIComponent(`${name} ${region} Chile`);
    const url = `https://photon.komoot.io/api/?q=${q}&limit=5&lang=en`;
    const opts = { headers: { "User-Agent": "MEED-HIAP/1.0" } };
    https.get(url, opts, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const features: any[] = json.features ?? [];
          if (features.length === 0) {
            resolve(null);
            return;
          }
          // Pick the best-scored feature; ties keep Photon's relevance order
          // (strict > never replaces an equal-scored earlier feature).
          let best = features[0];
          let bestScore = -Infinity;
          for (const f of features) {
            const s = scoreFeature(f, name);
            if (s > bestScore) {
              bestScore = s;
              best = f;
            }
          }
          const [lon, lat] = best.geometry.coordinates as [number, number];
          resolve({ lat, lon });
        } catch {
          resolve(null);
        }
      });
    }).on("error", () => resolve(null));
  });
}

router.get("/geocode", async (req, res) => {
  const name = (req.query.name as string | undefined)?.trim();
  const region = (req.query.region as string | undefined)?.trim();

  if (!name || !region) {
    return res.status(400).json({ error: "name and region are required" });
  }

  const key = `${name}|${region}`;

  if (cache.has(key)) {
    const cached = cache.get(key);
    if (cached) return res.json(cached);
    return res.status(404).json({ error: "Not found" });
  }

  const coords = await fetchPhoton(name, region);
  cache.set(key, coords);

  if (!coords) {
    return res.status(404).json({ error: "Coordinates not found" });
  }

  return res.json(coords);
});

export default router;
