import { createDocument } from 'zod-openapi';
import type { oas31 } from 'zod-openapi';
import type {
  ZodOpenApiComponentsObject,
  ZodOpenApiObject,
  ZodOpenApiPathsObject,
} from 'zod-openapi';
import { env } from '../../config/env.js';
import { securitySchemes, type ModuleDocs } from './openapi.helpers.js';
import { healthDocs } from '../../modules/health/health.docs.js';
import { authDocs } from '../../modules/auth/auth.docs.js';
import { documentsDocs } from '../../modules/documents/documents.docs.js';

/**
 * Registry of per-module OpenAPI contributions.
 *
 * To document a new module, add its `*.docs.ts` export here — the same pattern
 * used by `modules/index.ts` for routers.
 */
const moduleDocs: ModuleDocs[] = [healthDocs, authDocs, documentsDocs];

/** Merge every module's tags, paths, and components into a single document. */
export function buildOpenApiDocument(): ReturnType<typeof createDocument> {
  const tags: oas31.TagObject[] = [];
  const paths: ZodOpenApiPathsObject = {};
  const schemas: NonNullable<ZodOpenApiComponentsObject['schemas']> = {};

  for (const mod of moduleDocs) {
    if (mod.tags) tags.push(...mod.tags);
    Object.assign(paths, mod.paths);
    if (mod.components?.schemas) Object.assign(schemas, mod.components.schemas);
  }

  const document: ZodOpenApiObject = {
    openapi: '3.1.0',
    info: {
      title: 'Risik CRM API',
      version: '1.0.0',
      description: 'HTTP API for the Risik Election CRM server.',
    },
    servers: [{ url: '/api/v1', description: `${env.NODE_ENV} server` }],
    tags,
    paths,
    components: {
      securitySchemes,
      ...(Object.keys(schemas).length > 0 && { schemas }),
    },
  };

  return createDocument(document);
}