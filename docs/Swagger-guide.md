# Adding Swagger / OpenAPI Docs for a Module

This project builds a single OpenAPI 3.1 document from **per-module doc files**. Each
feature module owns its own `*.docs.ts`, and a central builder merges them all — the
same pattern `modules/index.ts` uses to merge routers.

- **Swagger UI:** `GET /api/v1/docs`
- **Raw spec:** `GET /api/v1/docs.json`
- Docs are mounted **only outside production** (see [`src/app.ts`](../src/app.ts)).

---

## How it fits together

```
src/shared/docs/
  openapi.helpers.ts   ← ModuleDocs type, shared envelope schemas, helper fns, security scheme
  openapi.ts           ← registry: imports every *.docs.ts and merges them → createDocument()
  swagger.ts           ← serves Swagger UI + /docs.json

src/modules/<feature>/
  <feature>.schemas.ts ← Zod request schemas (validation + OpenAPI, single source of truth)
  <feature>.docs.ts    ← exports `<feature>Docs: ModuleDocs`  ← YOU WRITE THIS
  <feature>.routes.ts
  <feature>.controller.ts
  <feature>.service.ts
```

A module contributes a [`ModuleDocs`](../src/shared/docs/openapi.helpers.ts) object:

```ts
export interface ModuleDocs {
  tags?: oas31.TagObject[];        // groups shown in Swagger UI
  paths: ZodOpenApiPathsObject;    // operations keyed by path (relative to /api/v1)
  components?: ZodOpenApiComponentsObject; // optional extra reusable components
}
```

> **Paths are relative to the `/api/v1` server URL.** A route mounted at `/auth`
> is documented as `/auth/sign-up`, **not** `/api/v1/auth/sign-up`.

The walkthrough below uses the real [`auth`](../src/modules/auth) module as the
example. See [`auth.schemas.ts`](../src/modules/auth/auth.schemas.ts) and
[`auth.docs.ts`](../src/modules/auth/auth.docs.ts) for the complete files.

---

## Step-by-step: document a module

### 1. Reuse your request schemas from `<feature>.schemas.ts`

Your Zod validation schemas double as OpenAPI request schemas — never re-declare field
shapes. The auth module already defines these for the `validate` middleware
([`auth.schemas.ts`](../src/modules/auth/auth.schemas.ts)):

```ts
const email = z.string().trim().toLowerCase().email('A valid email is required');
const password = z.string().min(8).max(128);

export const signUpSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email,
  password,
  phone: z.string().trim().min(1).max(32).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});
// …signInSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema
```

> These schemas contain transforms (`.trim()`, `.toLowerCase()`), so they are used
> **inline** in request bodies and are **not** `.meta({ id })`-registered — see
> [Gotchas](#gotchas).

### 2. Define response schemas and the `ModuleDocs` in `<feature>.docs.ts`

Response payloads get `.meta({ id })` so they render once under `components/schemas`
and are referenced by `$ref` everywhere. Wrap every response with `successResponse(...)`
(the `{ success, data, meta }` envelope) and use `errorResponse(...)` for failures — so
the docs match what `responseHandler` / `globalErrorHandler` actually return.

```ts
import { z } from 'zod';
import type { ModuleDocs } from '../../shared/docs/openapi.helpers.js';
import {
  bearerAuth,
  errorResponse,
  jsonBody,
  successResponse,
} from '../../shared/docs/openapi.helpers.js';
import { changePasswordSchema, signUpSchema } from './auth.schemas.js';

const TAG = 'Auth';

// ── Response payload schemas (output → registered components) ──
const userProfileSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(['super_admin', 'admin', 'researcher', 'officer']),
    status: z.enum(['pending_approval', 'active', 'deactivated', 'banned']),
    // …emailVerified, image, phone, timestamps, etc.
  })
  .meta({ id: 'UserProfile' });

const authTokensSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
    tokenType: z.literal('Bearer'),
    expiresIn: z.string().meta({ example: '15m' }),
  })
  .meta({ id: 'AuthTokens' });

const authResultSchema = z
  .object({ user: userProfileSchema, tokens: authTokensSchema })
  .meta({ id: 'AuthResult' });

const messageSchema = z.object({ message: z.string() });

// ── Module docs ───────────────────────────────────────────────
export const authDocs: ModuleDocs = {
  tags: [{ name: TAG, description: 'Authentication and account credential management' }],
  paths: {
    '/auth/sign-up': {
      post: {
        tags: [TAG],
        summary: 'Register a new account',
        operationId: 'signUp',
        requestBody: jsonBody(signUpSchema),          // reuses the validation schema
        responses: {
          '201': successResponse(authResultSchema, 'Account created; tokens issued'),
          '409': errorResponse('An account with this email already exists'),
          '422': errorResponse('Validation failed'),
        },
      },
    },
    '/auth/profile': {
      get: {
        tags: [TAG],
        summary: 'Get the authenticated user',
        operationId: 'getProfile',
        security: [bearerAuth],                        // JWT-protected route
        responses: {
          '200': successResponse(userProfileSchema, 'The current user'),
          '401': errorResponse('Missing or invalid access token'),
          '404': errorResponse('User not found'),
        },
      },
    },
    '/auth/change-password': {
      post: {
        tags: [TAG],
        summary: 'Change the password for the authenticated user',
        operationId: 'changePassword',
        security: [bearerAuth],
        requestBody: jsonBody(changePasswordSchema),
        responses: {
          '200': successResponse(messageSchema, 'Password changed; all sessions revoked'),
          '401': errorResponse('Missing/invalid token or incorrect current password'),
          '422': errorResponse('Validation failed'),
        },
      },
    },
    // …sign-in, refresh, forgot-password, reset-password
  },
};
```

### 3. Register it in the builder

Add the module to the `moduleDocs` array in
[`src/shared/docs/openapi.ts`](../src/shared/docs/openapi.ts) — one line, the same
place you'd wire a router:

```ts
import { healthDocs } from '../../modules/health/health.docs.js';
import { authDocs } from '../../modules/auth/auth.docs.js';  // ← add import

const moduleDocs: ModuleDocs[] = [healthDocs, authDocs];     // ← add here
```

### 4. Verify

```bash
npx tsc --noEmit                 # types must pass; createDocument is type-checked
npm run dev                      # boot (build runs once at startup — fails fast on bad schema)
curl -s localhost:5000/api/v1/docs.json | less   # inspect the merged spec
```

Then open **http://localhost:5000/api/v1/docs** and confirm your `Auth` group,
operations, request/response bodies, and the `AuthResult` / `UserProfile` schemas
(under **Schemas**) appear.

---

## Helper reference

All exported from [`src/shared/docs/openapi.helpers.ts`](../src/shared/docs/openapi.helpers.ts):

| Helper | Use |
| --- | --- |
| `jsonBody(schema, description?)` | Build an `application/json` request body from a Zod schema. |
| `successResponse(dataSchema, description)` | Wrap `dataSchema` in the `{ success, data, meta }` envelope. |
| `errorResponse(description)` | A standard response referencing the shared `ErrorResponse` schema. |
| `bearerAuth` | Security requirement for JWT-protected routes → `security: [bearerAuth]`. |
| `securitySchemes` | The `bearerAuth` scheme; registered globally in `openapi.ts` (you rarely touch this). |
| `metaSchema`, `errorResponseSchema` | The registered envelope component schemas (used internally by the helpers). |

For request path/query/header parameters, use the operation's `requestParams`:

```ts
requestParams: {
  path:  z.object({ id: z.string() }),
  query: z.object({ page: z.coerce.number().optional() }),
}
```

---

## Conventions

- **One tag per module** (`const TAG = 'Auth'`) and put it on every operation so
  routes group cleanly in the UI.
- **`operationId`** should be unique across the whole API (used by client generators).
- **Reuse validation schemas** for request bodies — never re-declare field shapes.
- **Response schemas get `.meta({ id: 'Name' })`** so they render once under
  `components/schemas` and are referenced by `$ref` everywhere (deduplication).
- **Derive TS types from schemas** where useful:
  `export type SafeUser = z.infer<typeof userProfileSchema>` — avoids a hand-written
  interface drifting from the schema. (`.meta()` does **not** affect the inferred type.)

---

## Gotchas

- **`.meta({ id })` only affects the OpenAPI output**, never the inferred TS type.
  Use it to promote a schema to a named, reusable component.
- **Don't register the same `id` twice.** If two files declare a schema with
  `id: 'AuthResult'` and both are referenced, the build conflicts. Define each response
  schema once and import it wherever needed.
- **Request vs response schemas & transforms.** A schema with transforms (e.g.
  `.trim()`, `.toLowerCase()`, `z.coerce.*`) has different *input* and *output* types.
  - Keep such schemas **without** an `id` and use them inline in request bodies
    (input context) — this is why the auth request schemas (`signUpSchema`, …) aren't
    `id`-registered.
  - If you must share one `id`-registered schema between a request **and** a response,
    give it `.meta({ id: 'X', outputId: 'XOutput' })` so `zod-openapi` emits distinct
    input/output components.
- **Paths are `/api/v1`-relative** — the server URL prefix is added by the document,
  not by you.
- **Docs are non-production only.** They're mounted behind
  `if (env.NODE_ENV !== 'production')` in [`src/app.ts`](../src/app.ts).

---

## Reference modules

- [`auth`](../src/modules/auth) — the full example above: request bodies, multiple
  status codes, registered response components, and `bearerAuth`-protected routes
  ([`auth.docs.ts`](../src/modules/auth/auth.docs.ts)).
- [`health`](../src/modules/health) — a minimal single-endpoint module whose response
  schema lives in [`health.schemas.ts`](../src/modules/health/health.schemas.ts) and is
  imported by [`health.docs.ts`](../src/modules/health/health.docs.ts).
