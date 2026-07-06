import type { ModuleDocs } from '../../shared/docs/openapi.helpers.js';
import {
  bearerAuth,
  successResponse,
  paginatedResponse,
  errorResponse,
} from '../../shared/docs/openapi.helpers.js';
import { documentSchema } from './documents.schemas.js';

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
        summary: 'Upload a document (multipart/form-data)',
        operationId: 'uploadDocument',
        security: [bearerAuth],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['title', 'file'],
                properties: {
                  file: { type: 'string', format: 'binary' },
                  title: { type: 'string' },
                  category: { type: 'string' },
                  state: { type: 'string' },
                  district: { type: 'string' },
                  documentType: { type: 'string' },
                  notes: { type: 'string' },
                  documentDate: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': successResponse(documentSchema, 'Document created'),
          '400': errorResponse('Missing file or invalid metadata'),
          '401': errorResponse('Not authenticated'),
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
