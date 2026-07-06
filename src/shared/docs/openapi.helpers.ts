import { z, type ZodType } from 'zod';
import type {
  oas31,
  ZodOpenApiComponentsObject,
  ZodOpenApiPathsObject,
  ZodOpenApiRequestBodyObject,
  ZodOpenApiResponseObject,
} from 'zod-openapi';

/**
 * The OpenAPI contribution of a single feature module.
 *
 * Each module owns its own `*.docs.ts` file exporting one of these; the central
 * builder ({@link ./openapi.ts}) merges them into the global document — mirroring
 * how `modules/index.ts` merges routers.
 */
export interface ModuleDocs {
  /** Tag definitions (name + description) shown as groups in Swagger UI. */
  tags?: oas31.TagObject[];
  /** Operations keyed by path, relative to the document server url (`/api/v1`). */
  paths: ZodOpenApiPathsObject;
  /** Optional extra reusable components (schemas, etc.) for this module. */
  components?: ZodOpenApiComponentsObject;
}

// ── Shared response envelope schemas ───────────────────────────
// These mirror the runtime shape produced by `responseHandler` and
// `globalErrorHandler`, and are registered as reusable components via `.meta`.

/** Offset pagination metadata attached to paginated responses. */
export const paginationSchema = z
  .object({
    page: z.number().int().meta({ description: 'Current page (1-based)', example: 1 }),
    limit: z.number().int().meta({ description: 'Items per page', example: 20 }),
    total: z.number().int().meta({ description: 'Total items across all pages', example: 57 }),
    totalPages: z.number().int().meta({ example: 3 }),
  })
  .meta({ id: 'PaginationMeta' });

/** Metadata attached to every response by `responseHandler`. */
export const metaSchema = z
  .object({
    requestId: z
      .string()
      .optional()
      .meta({
        description: 'Correlation ID; also returned in the `X-Request-Id` header',
        example: '7f9c824e-6c4f-42a3-9e21-5a4f8d3b2c10',
      }),
    timestamp: z.string().meta({ example: '2026-07-05T10:45:43.000Z' }),
    pagination: paginationSchema.optional(),
  })
  .meta({ id: 'ResponseMeta' });

/** Field-level detail attached to validation errors. */
const errorDetailSchema = z
  .object({
    field: z
      .string()
      .optional()
      .meta({ description: 'Dot-separated path of the offending field', example: 'email' }),
    message: z.string().meta({ example: 'A valid email is required' }),
    code: z.string().optional().meta({ description: 'Machine-readable issue code', example: 'invalid_format' }),
  })
  .meta({ id: 'ErrorDetail' });

/** Standard error body emitted by `globalErrorHandler`. */
export const errorResponseSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      code: z.string().meta({ example: 'VALIDATION_ERROR' }),
      message: z.string().meta({ example: 'Validation failed' }),
      details: z.array(errorDetailSchema).optional(),
    }),
    meta: metaSchema,
  })
  .meta({ id: 'ErrorResponse' });

/** Security requirement referencing the `bearerAuth` scheme. */
export const bearerAuth: oas31.SecurityRequirementObject = { bearerAuth: [] };

/** Security schemes registered on the global document. */
export const securitySchemes: ZodOpenApiComponentsObject['securitySchemes'] = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Provide the JWT access token as `Bearer <token>`.',
  },
};

// ── Builder helpers ────────────────────────────────────────────

/** Build a `application/json` request body from a Zod schema. */
export function jsonBody(schema: ZodType, description?: string): ZodOpenApiRequestBodyObject {
  return {
    description,
    required: true,
    content: { 'application/json': { schema } },
  };
}

/** Wrap a data schema in the standard success envelope (`{ success, data, meta }`). */
export function successResponse(data: ZodType, description: string): ZodOpenApiResponseObject {
  return {
    description,
    content: {
      'application/json': {
        schema: z.object({ success: z.literal(true), data, meta: metaSchema }),
      },
    },
  };
}

/**
 * Wrap an item schema in the paginated success envelope
 * (`{ success, data: T[], meta: { …, pagination } }`) — mirrors `responseHandler.paginated`.
 */
export function paginatedResponse(item: ZodType, description: string): ZodOpenApiResponseObject {
  return {
    description,
    content: {
      'application/json': {
        schema: z.object({
          success: z.literal(true),
          data: z.array(item),
          meta: metaSchema.extend({ pagination: paginationSchema }),
        }),
      },
    },
  };
}

/** A standard error response referencing the shared `ErrorResponse` schema. */
export function errorResponse(description: string): ZodOpenApiResponseObject {
  return {
    description,
    content: { 'application/json': { schema: errorResponseSchema } },
  };
}