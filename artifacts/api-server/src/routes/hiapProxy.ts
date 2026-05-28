import { Router } from "express";
import { logger } from "../lib/logger.js";

const router = Router();

// Target backend URL — set HIAP_API_URL env var to point to the hiap-meed backend.
// Defaults to localhost:8080, but note the api-server itself also runs on 8080 in dev,
// so if the port-forward is on 8080 there will be a conflict. Use a different port
// for the port-forward (e.g. 8081) and set HIAP_API_URL=http://localhost:8081.
const HIAP_BACKEND_URL = process.env.HIAP_API_URL ?? "http://localhost:8080";

logger.info({ hiapBackendUrl: HIAP_BACKEND_URL }, "hiap-proxy: initialised");

async function proxyPost(
  upstreamPath: string,
  body: unknown
): Promise<{ status: number; data: unknown }> {
  const url = `${HIAP_BACKEND_URL}${upstreamPath}`;
  logger.info({ url }, "hiap-proxy: forwarding request");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as unknown;
  logger.info({ url, status: res.status }, "hiap-proxy: upstream responded");
  return { status: res.status, data };
}

// POST /v1/prioritize/exclusions/preview
router.post("/v1/prioritize/exclusions/preview", async (req, res) => {
  try {
    const { status, data } = await proxyPost("/v1/prioritize/exclusions/preview", req.body);
    res.status(status).json(data);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    const code = (err as NodeJS.ErrnoException).code ?? "unknown";
    req.log.error(
      { targetUrl: `${HIAP_BACKEND_URL}/v1/prioritize/exclusions/preview`, errCode: code, detail },
      "hiap-proxy: exclusions preview FAILED — check that HIAP_API_URL points to the hiap-meed backend (not the api-server itself)"
    );
    res.status(502).json({ error: "Upstream error", code, detail });
  }
});

// POST /v1/prioritize
router.post("/v1/prioritize", async (req, res) => {
  try {
    const { status, data } = await proxyPost("/v1/prioritize", req.body);
    res.status(status).json(data);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    const code = (err as NodeJS.ErrnoException).code ?? "unknown";
    req.log.error(
      { targetUrl: `${HIAP_BACKEND_URL}/v1/prioritize`, errCode: code, detail },
      "hiap-proxy: prioritize FAILED — check that HIAP_API_URL points to the hiap-meed backend"
    );
    res.status(502).json({ error: "Upstream error", code, detail });
  }
});

// POST /v1/explanations/translate
router.post("/v1/explanations/translate", async (req, res) => {
  try {
    const { status, data } = await proxyPost("/v1/explanations/translate", req.body);
    res.status(status).json(data);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    const code = (err as NodeJS.ErrnoException).code ?? "unknown";
    req.log.error(
      { targetUrl: `${HIAP_BACKEND_URL}/v1/explanations/translate`, errCode: code, detail },
      "hiap-proxy: translate FAILED — check that HIAP_API_URL points to the hiap-meed backend"
    );
    res.status(502).json({ error: "Upstream error", code, detail });
  }
});

export default router;
