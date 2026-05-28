import { Router } from "express";
import { logger } from "../lib/logger.js";

const router = Router();

const HIAP_BACKEND_URL = process.env.HIAP_API_URL ?? "http://localhost:8080";

logger.info({ hiapBackendUrl: HIAP_BACKEND_URL }, "hiap-proxy: initialised");

async function proxyPost(
  upstreamPath: string,
  body: unknown
): Promise<{ status: number; data: unknown }> {
  const url = `${HIAP_BACKEND_URL}${upstreamPath}`;
  logger.info({ url, requestBody: body }, "hiap-proxy: forwarding request");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as unknown;
  if (res.status >= 400) {
    logger.error({ url, status: res.status, responseBody: data }, "hiap-proxy: upstream error response");
  } else {
    logger.info({ url, status: res.status }, "hiap-proxy: upstream responded");
  }
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
      "hiap-proxy: exclusions preview FAILED"
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
      "hiap-proxy: prioritize FAILED"
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
      "hiap-proxy: translate FAILED"
    );
    res.status(502).json({ error: "Upstream error", code, detail });
  }
});

export default router;
