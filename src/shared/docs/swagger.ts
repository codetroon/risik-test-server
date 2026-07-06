import type { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { buildOpenApiDocument } from './openapi.js';
import { logger } from '../lib/logger.js';

/**
 * Mounts the API documentation:
 * - `GET /docs`      → interactive Swagger UI
 * - `GET /docs.json` → the raw OpenAPI 3.1 document
 *
 * The document is built once at startup so an invalid schema fails fast.
 */
export function setupSwagger(app: Express, basePath = '/docs'): void {
  const document = buildOpenApiDocument();

  app.get(`${basePath}.json`, (_req: Request, res: Response) => {
    res.json(document);
  });

  app.use(
    basePath,
    swaggerUi.serve,
    swaggerUi.setup(document, { customSiteTitle: 'Risik CRM API Docs' }),
  );

  logger.info(`📚 API docs available at ${basePath}`);
}