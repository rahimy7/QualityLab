import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import { existsSync } from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";
import { manejadorErrores } from "./lib/errores";

const app: Express = express();

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve the Vite frontend build in production
const staticDir =
  process.env.STATIC_DIR ??
  path.resolve(process.cwd(), "artifacts/qualitylab/dist/public");

if (existsSync(staticDir)) {
  app.use(express.static(staticDir));
  // SPA fallback: send index.html for any non-API GET request
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

app.use(manejadorErrores);

export default app;
