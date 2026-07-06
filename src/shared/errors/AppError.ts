
// ── Base Error ─────────────────────────────────────────────────

import { ErrorCode, ErrorDetail } from "../types/index.js";
import { HTTP_STATUS } from "../utils/httpStatus.js";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: ErrorDetail[];

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    isOperational = true,
    details?: ErrorDetail[],
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── 4xx Client Errors ──────────────────────────────────────────

class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: ErrorDetail[]) {
    super(message, HTTP_STATUS.BAD_REQUEST, 'BAD_REQUEST', true, details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details?: ErrorDetail[]) {
    super(message, HTTP_STATUS.CONFLICT, 'CONFLICT', true, details);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: ErrorDetail[]) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', true, details);
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, 'RATE_LIMITED');
  }
}

// ── 5xx Server Errors ──────────────────────────────────────────

class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'INTERNAL_ERROR', false);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, 'SERVICE_UNAVAILABLE', false);
  }
}

export const ApiError = {
    BadRequest: BadRequestError,
    Unauthorized: UnauthorizedError,
    Forbidden: ForbiddenError,
    NotFound: NotFoundError,
    Conflict: ConflictError,
    ValidationError: ValidationError,
    RateLimit: RateLimitError,
    Internal: InternalError,
    ServiceUnavailable: ServiceUnavailableError
}