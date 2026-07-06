import type { ModuleDocs } from '../../shared/docs/openapi.helpers.js';
import { bearerAuth, jsonBody, successResponse, errorResponse } from '../../shared/docs/openapi.helpers.js';
import { loginSchema, loginResponseSchema, authUserSchema } from './auth.schemas.js';

const TAG = 'Auth';

export const authDocs: ModuleDocs = {
  tags: [{ name: TAG, description: 'Authentication and session' }],
  paths: {
    '/auth/login': {
      post: {
        tags: [TAG],
        summary: 'Authenticate with email + password',
        operationId: 'login',
        requestBody: jsonBody(loginSchema, 'User credentials'),
        responses: {
          '200': successResponse(loginResponseSchema, 'Authenticated — returns a JWT and the user'),
          '401': errorResponse('Invalid credentials'),
        },
      },
    },
    '/auth/me': {
      get: {
        tags: [TAG],
        summary: 'Get the current authenticated user',
        operationId: 'getMe',
        security: [bearerAuth],
        responses: {
          '200': successResponse(authUserSchema, 'The current user'),
          '401': errorResponse('Not authenticated'),
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: [TAG],
        summary: 'Log out (client discards the token)',
        operationId: 'logout',
        security: [bearerAuth],
        responses: {
          '200': successResponse(authUserSchema.pick({}), 'Logged out'),
        },
      },
    },
  },
};
