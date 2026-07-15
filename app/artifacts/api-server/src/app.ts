import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import hiapProxyRouter from "./routes/hiapProxy";
import { logger } from "./lib/logger";

const app: Express = express();
const frontendDistDir = fileURLToPath(
  new URL("../../hiap/dist/public", import.meta.url),
);
const frontendIndexPath = path.join(frontendDistDir, "index.html");

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// hiap-meed proxy routes — mounted at root so frontend can call /v1/... directly
// (the shared proxy routes /v1 → this server via artifact.toml)
app.use(hiapProxyRouter);

app.use("/api", router);
app.use(express.static(frontendDistDir));
app.get(/^(?!\/api(?:\/|$))(?!\/v1(?:\/|$)).*/, (_req, res) => {
  res.sendFile(frontendIndexPath);
});

export default app;
