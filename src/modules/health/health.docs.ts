import type { ModuleDocs } from '../../shared/docs/openapi.helpers.js';
import { successResponse } from '../../shared/docs/openapi.helpers.js';
import { healthStatusSchema } from './health.schemas.js';

const TAG = 'Health';

export const healthDocs: ModuleDocs = {
  tags: [{ name: TAG, description: 'Service liveness and diagnostics' }],
  paths: {
    '/health': {
      get: {
        tags: [TAG],
        summary: 'Service health check',
        operationId: 'getHealth',
        responses: {
          '200': successResponse(healthStatusSchema, 'Service is healthy'),
        },
      },
    },
  },
};
