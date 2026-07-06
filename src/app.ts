import express from "express";
import helmet from "helmet";
import cors from "cors";
import { pinoHttp } from "pino-http";
import { logger } from "./shared/lib/logger.js";
import { requestId } from "./shared/middleware/requestId.js";
import { env } from "./config/env.js";
import { unknownRouteHandler } from "./shared/middleware/unknownRouteHandler.js";
import { globalErrorHandler } from "./shared/middleware/globalErrorHandler.js";
import { setupSwagger } from "./shared/docs/swagger.js";
import router from "./modules/index.js";

export const app = express();

// Behind a reverse proxy, req.ip must resolve to the real client address
// (rate limiting keys on it). 0 hops = trust nothing (dev default).
app.set('trust proxy', env.TRUST_PROXY);

// Request ID (reads X-Request-Id from upstream, falls back to UUID).
// Mounted first so even body-parser errors carry a requestId.
app.use(requestId);

app.use(helmet());

// CORS allowlist — FRONTEND_ORIGIN may be a comma-separated list of origins
// (e.g. local dev + the deployed frontend). Trailing slashes are ignored.
const allowedOrigins = env.FRONTEND_ORIGIN
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (curl, health checks) which have no Origin.
      if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ""))) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));

// Request logging (includes requestId in every log line)
app.use(
  pinoHttp({
    logger,
    customProps: (_req, res) => ({
      requestId: (res as express.Response).locals.requestId,
    }),
  }),
);

// Mount all feature routers under /api/v1
app.use("/api/v1", router);

// API documentation (Swagger UI at /docs, raw spec at /docs.json)
if(env.NODE_ENV !== "production") {
  setupSwagger(app, "/api/v1/docs");
}
// Handle unknown routes and global errors
app.use(unknownRouteHandler);
app.use(globalErrorHandler);
