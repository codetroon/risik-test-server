// ── Error Codes ────────────────────────────────────────────────

/** Application-level error codes used across AppError subclasses and API responses. */
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'PAYLOAD_TOO_LARGE'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

// ── Response Envelope ──────────────────────────────────────────

/** Metadata attached to every API response. */
export interface ResponseMeta {
  requestId?: string;
  /** ISO 8601 timestamp (e.g. `2026-06-05T10:45:43.000Z`). */
  timestamp: string;
  pagination?: PaginationMeta;
}

/** Offset pagination metadata. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Field-level error detail (e.g. from Zod validation). */
export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

// ── Concrete Response Shapes ───────────────────────────────────

/** Standardized API success response. */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ResponseMeta;
}

/** Standardized API error response. */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetail[];
    stack?: string; // development only
  };
  meta: ResponseMeta;
}
