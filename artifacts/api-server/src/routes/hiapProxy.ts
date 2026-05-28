import { Router } from "express";

const router = Router();

// Target backend URL — set HIAP_API_URL env var to point to the hiap-meed backend.
// Defaults to localhost:8080 (port-forwarded hiap-meed service).
const HIAP_BACKEND_URL = process.env.HIAP_API_URL ?? "http://localhost:8080";

async function proxyPost(
  upstreamPath: string,
  body: unknown
): Promise<{ status: number; data: unknown }> {
  const url = `${HIAP_BACKEND_URL}${upstreamPath}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as unknown;
  return { status: res.status, data };
}

// POST /api/v1/prioritize/exclusions/preview
router.post("/v1/prioritize/exclusions/preview", async (req, res) => {
  try {
    const { status, data } = await proxyPost("/v1/prioritize/exclusions/preview", req.body);
    res.status(status).json(data);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, "hiap-proxy: exclusions preview failed");
    res.status(502).json({ error: "Upstream error", detail });
  }
});

// POST /api/v1/prioritize
router.post("/v1/prioritize", async (req, res) => {
  try {
    const { status, data } = await proxyPost("/v1/prioritize", req.body);
    res.status(status).json(data);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, "hiap-proxy: prioritize failed");
    res.status(502).json({ error: "Upstream error", detail });
  }
});

// POST /api/v1/explanations/translate
router.post("/v1/explanations/translate", async (req, res) => {
  try {
    const { status, data } = await proxyPost("/v1/explanations/translate", req.body);
    res.status(status).json(data);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, "hiap-proxy: translate failed");
    res.status(502).json({ error: "Upstream error", detail });
  }
});

export default router;
