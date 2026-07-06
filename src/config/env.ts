import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000"),

  /**
   * Number of reverse-proxy hops in front of the app (Express `trust proxy`).
   * 0 = direct connection (local dev). Set to 1 behind a single nginx/LB so
   * `req.ip` reflects the real client.
   */
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),

  /** Secret used to sign JWT access tokens. Must be long and random in prod. */
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  /** Access-token lifetime, e.g. "15m", "7d". */
  JWT_ACCESS_EXPIRES_IN: z.string().default("7d"),

  /** Directory (relative to server root) for the legacy on-disk file fallback. */
  UPLOAD_DIR: z.string().default("uploads"),

  /** Cloudinary credentials — document files are stored there (resource_type "raw"). */
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export const env = schema.parse(process.env);
