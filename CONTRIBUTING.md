# Contributing to this project
Welcome. This document is the starting point for anyone joining this project —
whether you're picking it up in a handover, onboarding as a new team member. It covers the workflow and rules for making changes.

## Where all the guides live

| What you need | Where to find it |
|---|---|
| What we're building & why (requirements) | [`docs/PRD.md`](./docs/PRD.md) |
| Getting the project running locally | [`docs/SETUP.md`](./docs/SETUP.md) |
| How to run commands, code style, dev conventions | [`AGENTS.md`](./AGENTS.md) (root) |
| Documenting API endpoint in OpenAPI | [`docs/Swagger-guide.md`](docs/Swagger-guide.md)|
| This file (workflow, issues, PRs, boundaries) | `CONTRIBUTING.md` (you are here) |

<!-- | System/architecture overview | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | -->
<!-- | Known issues / tech debt | [`docs/KNOWN_ISSUES.md`](./docs/KNOWN_ISSUES.md) | -->
<!-- | Deployment process | [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | -->

## Before you start

1. Set up the project per [docs/SETUP.md](docs/SETUP.md) (Node 22+, Docker, `.env` from `.env.example`).
2. Read the relevant section of [docs/PRD.md](docs/PRD.md) before building a feature — don't guess at product behavior the PRD already defines.
3. Check the four-role model (`super_admin`, `admin`, `researcher`, `officer`) when your change touches permissions.

## Development workflow

Follow these steps **in order** for every non-trivial change. Don't skip
straight to coding.

1. **Understand the requirement**
   Read the linked issue/ticket. If it references the PRD, read the relevant
   section in `docs/PRD.md`. If anything is ambiguous, ask before building —
   don't guess at product intent.

2. **Check `AGENTS.md`**
   Confirm you know the current commands, folder conventions, and boundaries
   before touching anything. These change over time — don't rely on memory
   from a previous feature.

3. **Create a branch from `main` or `dev`**
   ```bash
   git checkout main && git pull
   git checkout -b feat/short-description
   ```

4. **Branch naming `feat/<short-name>`, `fix/<short-name>`**
   ```
   feat/document
   fix/rate-limiter
   chore/upgrade-prisma
   docs/update-api-md
   ```

5. **Design before coding (for anything touching >1 file or the DB schema)**
   Sketch the approach: which routes/services/models are affected. For DB
   changes, write the Prisma migration plan first. Post a short comment on the
   issue if the approach isn't obvious — cheap to review a plan, expensive to
   review a wrong implementation.

6. **Implement in this order (Optional, you can follow your own)**:
   - Data layer first — schema/migration (`prisma/`)
   - Service layer — business logic
   - Controller layer - consistant request-response
   - Route layer — thin handlers wiring request → controller
   - Middleware, if needed (auth, validation)
   - Wire up input validation (Zod/Joi/express-validator per project convention)

7. Verify: `npx tsc --noEmit` must pass — there is no test runner yet, so the type-checker is the correctness gate. Boot `npm run dev` and exercise your endpoints (Swagger UI at `/api/v1/docs` helps).

8. **Commit using Conventional** Commits, matching the existing history:

   ```
   feat(auth): add refresh-token rotation
   fix(docs): correct pagination example in ResponseMeta
   refactor: restructure shared middleware
   chore: bump prisma to 5.20
   ```
9. **Update docs in the same change** If you create any complete feature then also confirm that you have created the `<feature>.docs.ts` file for API documentation. And if you create any `lib`, `middleware`,`utils` etc then write documentation in the (`/docs`) folder.

10. **Open a PR against `dev`** Describe **what** changed and **why**; link the PRD section for feature work. Check this for details: [Opening PR](#checklist-before-opening-a-pr)



## Code conventions (the short version)

Full detail in [AGENTS.md](AGENTS.md). The rules reviewers will actually block on:

- **ESM imports**: every relative import ends in `.js`, even when the file is `.ts`.
- **Environment**: never read `process.env` — import `env` from `src/config/env.ts`. New variables go in that Zod schema **and** `.env.example`.
- **Responses**: controllers never call `res.json`. Success → `responseHandler.ok/created/noContent/paginated`; failure → `throw new ApiError.NotFound(...)` (etc.). The global error handler owns the error envelope.
- **Validation**: request shapes are Zod schemas in `<feature>.schemas.ts`, applied with the `validate({ body/query/params })` middleware. Derive types with `z.infer` — no hand-written request interfaces.
- **Auth**: protect routes with `requireAuth`; read the caller from `req.auth`.
- **Database**: always import the singleton from `src/db/prisma.ts`; never instantiate `PrismaClient` yourself.

## Adding a feature module

Create `src/modules/<feature>/` with the standard file set:

| File | Responsibility |
| --- | --- |
| `<feature>.schemas.ts` | Zod request schemas + `z.infer` types |
| `<feature>.service.ts` | Business logic; Prisma queries; throws `ApiError.*` |
| `<feature>.controller.ts` | Thin handlers: parse → service → `responseHandler` |
| `<feature>.routes.ts` | Router wiring `validate` / `requireAuth` middleware |
| `<feature>.docs.ts` | OpenAPI contribution (`ModuleDocs`) |

Then register it in **two** places (both are one-line array entries):

1. `src/modules/index.ts` — add the router to the `modules` array (mounts under `/api/v1`).
2. `src/shared/docs/openapi.ts` — add the docs export to the `moduleDocs` array.

Use the [`auth`](src/modules/auth) module as the reference implementation and follow
[docs/Swagger-guide.md](docs/Swagger-guide.md) when writing `*.docs.ts` — in particular:
give every response schema `.meta({ id: 'Name' })` and an `example` per field, and keep
transform-bearing request schemas (`.trim()`, `.coerce`) unregistered.

## Database changes

- Models live in `prisma/model/*.prisma` (multi-file schema); `prisma/schema.prisma` holds only the generator/datasource.
- Apply changes with `npm run db:migrate` and commit the generated migration folder.
- **Never** edit an already-applied migration in `prisma/migrations/`, and never edit `src/generated/` (regenerated by `npm run db:generate`).

>**Note:** Must reminde the team member about the database migration after PR merge.

## Security boundaries (non-negotiable)

This project handles confidential political data under strict client requirements ([docs/PRD.md](docs/PRD.md) §3.5). These aren't suggestions — treat them as hard rules.

- **Never commit `.env`, credentials, API keys, or tokens** — even temporarily,
  even in a "fix later" commit. If it happens, rotate the secret immediately,
  don't just delete the commit.
- **Never push directly to `main`.** All changes go through a PR, no exceptions,
  including "tiny" fixes.
- **Never merge your own PR without review**, except for genuinely trivial docs
  typo fixes.
- **Never modify database migrations that have already been merged/deployed.**
  Write a new migration instead — editing history breaks other environments.
- **Never touch `src/generated/`** (Prisma client, or any auto-generated code) —
  it's overwritten on the next build.
- **Never refactor `src/legacy/`** as a side effect of an unrelated ticket —
  raise it as its own tech-debt issue first.
- **Never bypass validation or auth middleware** "just for testing" in code
  that gets merged.
- **Never install a new dependency without checking with the team first**
  (license, bundle size, maintenance status) — flag it in the PR description
  at minimum.
- **Never assume undocumented behavior is intentional.** If something in the
  code contradicts `AGENTS.md` or the PRD, raise it — don't silently work
  around it or silently "fix" it without discussion.
- **Never leave a PR open with failing CI overnight** without a comment
  explaining why — it blocks others building on that branch.

- **No third-party AI or cloud service calls** from application code — no off-premise data transmission without client permission.

- Sensitive routes must be rate-limited and auditable; passwords are hashed with argon2, reset tokens stored only as hashes.

## Creating an issue

Before creating an issue, search existing open/closed issues to avoid
duplicates.

**Use this template:**

```markdown
### Summary
One or two sentences on what's needed or broken.

### Context / Motivation
Why does this matter? Link to PRD section or user report if relevant.

### Acceptance criteria
- [ ] Clear, testable condition 1
- [ ] Clear, testable condition 2

### Notes
Anything relevant: affected endpoints, related issues, screenshots, logs.
```

**Labeling convention:**
- Type: `bug`, `feature`, `chore`, `docs`, `tech-debt`
- Priority: `p0` (blocking) → `p3` (nice to have)
- Area: `api`, `db`, `auth`, `infra` (adjust to your modules)

Bug reports must include: steps to reproduce, expected vs. actual behavior,
environment (local/staging/prod), and relevant log output or stack trace.

---

## Checklist before opening a PR

- [ ] `npx tsc --noEmit` passes
- [ ] New/changed endpoints documented in `*.docs.ts` and visible at `/api/v1/docs`
- [ ] New env vars added to `src/config/env.ts` **and** `.env.example`
- [ ] Migrations committed; `src/generated/` untouched
- [ ] Conventional commit messages
- [ ] Feature behavior matches the PRD (link the section in your PR description)

**PR description template:**

```markdown
### What
Short description of the change.

### Why
Link to issue: Closes #123

### How to test
Steps a reviewer can follow to verify locally.

### Checklist
- [ ] Tests added/updated and passing (`npm test`)
- [ ] Lint passing (`npm run lint`)
- [ ] Docs updated (AGENTS.md / API.md / PRD.md) if conventions or contracts changed
- [ ] No secrets, debug logs, or commented-out code left in
```

**Review & merge rules:**
- At least 1 approval required before merge (2 for changes touching auth,
  payments, or DB migrations)
- CI must be green — no merging with failing checks
- Author merges after approval, not the reviewer — unless team agrees otherwise