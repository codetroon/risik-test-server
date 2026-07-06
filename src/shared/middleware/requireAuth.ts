import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors/AppError.js';
import { verifyAccessToken } from '../lib/jwt.js';
import type { Role } from '../../generated/prisma/enums.js';

/**
 * Extract a bearer token from the `Authorization` header or, as a fallback,
 * a `token` query param (used by browser file-download/view links that can't
 * set headers).
 */
function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim();
  }
  if (typeof req.query.token === 'string' && req.query.token.length > 0) {
    return req.query.token;
  }
  return null;
}

/**
 * Authenticate the request from a JWT access token and attach the principal
 * (`{ id, email, role }`) to `req.auth`. Rejects with 401 when the token is
 * missing, malformed, or expired.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    next(new ApiError.Unauthorized('Authentication required'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    next(new ApiError.Unauthorized('Invalid or expired token'));
  }
}

/**
 * Guard a route to one or more roles. Must run after `requireAuth`.
 *
 * @example router.delete('/:id', requireAuth, requireRole('super_admin'), ctrl.remove)
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new ApiError.Unauthorized('Authentication required'));
      return;
    }
    if (!roles.includes(req.auth.role)) {
      next(new ApiError.Forbidden('You do not have permission to perform this action'));
      return;
    }
    next();
  };
}
