import 'express-serve-static-core';
import type { Role } from '../../generated/prisma/enums.js';

/**
 * Express module augmentation.
 *
 * Extends `res.locals` with application-specific properties set by middleware
 * (e.g. requestId middleware) and `req.auth` with the authenticated principal
 * attached by `requireAuth`.
 */
declare module 'express-serve-static-core' {
  interface Locals {
    requestId: string;
  }

  interface Request {
    auth?: {
      id: string;
      email: string;
      role: Role;
    };
  }
}
