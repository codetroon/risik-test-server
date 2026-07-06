# Running Guide — Risik CRM Server

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 22+ (24+ recommended) | Prisma 7 needs ≥ 20.19 |
| Docker Desktop | any recent | Runs Postgres + Redis locally |
| npm | bundled with Node | pnpm/yarn also fine |

Verify before starting:

```bash
node -v
docker -v
```

---

## 1. Clone the repo and install dependencies

Clone the repo:
```bash
git clone https://github.com/codetroon/risik-prn-server.git
```

From the project root (`risik-crm-server/`):

```bash
npm install
```

---

## 2. Configure environment variables

Copy `.env` and fill in values. Edit `.env` - see README for placeholder values

```bash
cp .env.example .env
```


---

## 3. Start docker dependencies

```bash
docker compose up -d
```

Confirm both containers are healthy:

```bash
docker compose ps
```

You should see all the dependencies in the running state. To stop them later: `docker compose down` (add `-v` to also wipe the database volume).

---

## 4. Set up the database

Run these in order the first time:

```bash
# 1. Generate the Prisma Client into src/generated/prisma
npm run db:generate

# 2. Create and apply the initial migration
npm run db:migrate        # you'll be prompted for a name, e.g. "init"

# 3. Seed the admin user
npm run db:seed
```

After the first run, you only re-run `db:migrate` when you change `schema.prisma`, and `db:generate` happens automatically as part of it.

---

## 5. Run the dev server

```bash
npm run dev
```

This starts the server with `tsx watch` (hot reload). Verify it's up:

```
http://localhost:4000/health   →   { "status": "ok" }
```

---

## Scripts reference

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Type-check and compile to `dist/` |
| `npm start` | Run the compiled production build |
| `npm run db:generate` | Regenerate Prisma Client from the schema |
| `npm run db:migrate` | Create + apply a migration (development) |
<!-- | `npm run db:deploy` | Apply committed migrations (production/CI) | -->
| `npm run db:seed` | Seed the admin user |
| `npm run db:studio` | Open Prisma Studio (DB browser GUI) |

---

<!-- ## Production build & run

```bash
npm run db:generate     # ensure the client exists before compiling
npm run build           # tsc → dist/
npm run db:deploy       # apply migrations against the prod database
npm start               # node dist/server.js
```

In production, `DATABASE_URL` and `REDIS_URL` must point at your real infrastructure, and you run `migrate deploy` (never `migrate dev`) — it replays the committed migration files without prompting.

--- -->

## Project structure

```
risik-crm-server/
├── prisma/
│   ├── schema.prisma          # models + generator config (committed)
│   └── migrations/            # migration history (committed)
├── src/
│   ├── generated/prisma/      # generated Prisma Client (gitignored)
│   ├── config/                # env.ts, redis.ts
│   ├── lib/
│   │   └── prisma.ts          # PrismaClient singleton (adapter-wired)
│   ├── middleware/
│   ├── modules/               # feature folders (voters, users, ...)
│   ├── scripts/
│   │   └── seed.ts            # admin seed
│   ├── app.ts                 # express app + middleware
│   └── server.ts              # entry point
├── prisma.config.ts           # datasource URL for the CLI (Prisma 7)
├── docker-compose.yml         # postgres + redis
├── .env                       # secrets (gitignored)
├── tsconfig.json
└── package.json
```


---

## Troubleshooting