import { Router } from "express";
import https from "https";

const router = Router();

const cache = new Map<string, { lat: number; lon: number } | null>();

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
          const match =
            features.find((f) => f.properties?.country_code === "CL") ??
            features[0];
          if (match) {
            const [lon, lat] = match.geometry.coordinates as [number, number];
            resolve({ lat, lon });
          } else {
            resolve(null);
          }
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
