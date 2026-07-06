import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import type { ApiErrorResponse, ErrorCode, ErrorDetail } from '../types/index.js';
import { env } from '../../config/env.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { logger } from '../lib/logger.js';

/**
 * Global Express error-handling middleware.
 *
 * Handles the full production error spectrum:
 * - AppError subclasses   → mapped status + code + optional details
 * - ZodError (Zod 4)      → 422 with field-level details
 * - SyntaxError           → 400 (malformed JSON body)
 * - PayloadTooLargeError  → 413
 * - Unknown errors        → 500 (safe generic message)
 *
 * Every error response includes a request ID and timestamp for traceability.
 * Stack traces are only included in development mode.
 */

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  // ── Guard: headers already sent ────────────────────────────
  if (res.headersSent) {
    next(err);
    return;
  }

  const requestId = res.locals.requestId;
  const isDev = env.NODE_ENV === 'development';

  let statusCode: number;
  let code: ErrorCode;
  let message: string;
  let details: ErrorDetail[] | undefined;
  let isOperational: boolean;

  // ── 1. Known operational errors ────────────────────────────
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
    isOperational = err.isOperational;

  // ── 2. Zod 4 validation errors ─────────────────────────────
  } else if (err.name === 'ZodError' && 'issues' in err) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    isOperational = true;

    const issues = err.issues as Array<{ path: Array<string | number>; message: string; code?: string }>;
    details = issues.map((issue) => ({
      field: issue.path.join('.') || undefined,
      message: issue.message,
      code: issue.code,
    }));

  // ── 3. Malformed JSON body ─────────────────────────────────
  } else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    code = 'BAD_REQUEST';
    message = 'Malformed JSON in request body';
    isOperational = true;

  // ── 4. Payload too large ───────────────────────────────────
  } else if (err.name === 'PayloadTooLargeError' || ('type' in err && (err as Record<string, unknown>).type === 'entity.too.large')) {
    statusCode = HTTP_STATUS.PAYLOAD_TOO_LARGE;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request body exceeds the allowed size';
    isOperational = true;

  // ── 5. Unexpected / unknown errors ─────────────────────────
  } else {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    code = 'INTERNAL_ERROR';
    message = 'An unexpected error occurred';
    isOperational = false;
  }

  // ── Logging ────────────────────────────────────────────────
  const logPayload = { err, requestId, statusCode, code };

  if (isOperational) {
    logger.warn(logPayload, message);
  } else {
    logger.error(logPayload, 'Unexpected error');
  }

  // ── Response ───────────────────────────────────────────────
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(isDev && err.stack && { stack: err.stack }),
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(statusCode).json(response);
}
