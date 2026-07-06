import "dotenv/config";
import { defineConfig } from "prisma/config";

// Use `process.env` directly (not Prisma's strict `env()` helper) so that
// `prisma generate` — which needs no DB connection — doesn't fail during the
// build/install phase where DATABASE_URL isn't injected yet (e.g. Railway
// `npm ci`). At runtime (`migrate deploy`, the app) DATABASE_URL is present.
export default defineConfig({
  schema: "prisma/",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
