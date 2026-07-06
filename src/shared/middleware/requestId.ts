import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

/**
 * Attaches a unique request ID to every request.
 *
 * - Accepts an existing `X-Request-Id` header (from load balancer / API gateway)
 * - Falls back to a new UUID v4 via `crypto.randomUUID()`
 * - Stores the ID on `res.locals.requestId` for downstream use
 * - Sets the `X-Request-Id` response header for client-side correlation
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id =
    (typeof req.headers['x-request-id'] === 'string' && req.headers['x-request-id']) ||
    randomUUID();

  res.locals.requestId = id;
  res.setHeader('X-Request-Id', id);

  next();
}
