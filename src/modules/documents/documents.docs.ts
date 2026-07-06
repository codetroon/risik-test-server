import type { ModuleDocs } from '../../shared/docs/openapi.helpers.js';
import {
  bearerAuth,
  successResponse,
  paginatedResponse,
  errorResponse,
} from '../../shared/docs/openapi.helpers.js';
import { documentSchema, registerDocumentSchema } from './documents.schemas.js';
import { jsonBody } from '../../shared/docs/openapi.helpers.js';

const TAG = 'Documents';

export const documentsDocs: ModuleDocs = {
  tags: [{ name: TAG, description: 'Document upload, library, and management' }],
  paths: {
    '/documents': {
      get: {
        tags: [TAG],
        summary: 'List documents',
        operationId: 'listDocuments',
        security: [bearerAuth],
        responses: {
          '200': paginatedResponse(documentSchema, 'Paginated document library'),
          '401': errorResponse('Not authenticated'),
        },
      },
      post: {
        tags: [TAG],
        summary: 'Register a document uploaded directly to Cloudinary',
        operationId: 'registerDocument',
        security: [bearerAuth],
        requestBody: jsonBody(registerDocumentSchema, 'Metadata + Cloudinary publicId'),
        responses: {
          '201': successResponse(documentSchema, 'Document created'),
          '400': errorResponse('Invalid metadata or upload reference'),
          '401': errorResponse('Not authenticated'),
        },
      },
    },
    '/documents/signature': {
      post: {
        tags: [TAG],
        summary: 'Get a signature for a direct browser upload to Cloudinary',
        operationId: 'getUploadSignature',
        security: [bearerAuth],
        responses: {
          '200': { description: 'Signed upload parameters' },
          '401': errorResponse('Not authenticated'),
          '503': errorResponse('Cloudinary not configured'),
        },
      },
    },
    '/documents/{id}/file': {
      get: {
        tags: [TAG],
        summary: 'Stream / download a document file',
        operationId: 'getDocumentFile',
        security: [bearerAuth],
        responses: {
          '200': { description: 'The file stream' },
          '404': errorResponse('Document not found'),
        },
      },
    },
    '/documents/{id}': {
      delete: {
        tags: [TAG],
        summary: 'Delete a document (super_admin / admin)',
        operationId: 'deleteDocument',
        security: [bearerAuth],
        responses: {
          '204': { description: 'Deleted' },
          '403': errorResponse('Insufficient permissions'),
          '404': errorResponse('Document not found'),
        },
      },
    },
  },
};
