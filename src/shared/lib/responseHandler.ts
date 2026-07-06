import type { Response } from 'express';
import type { ApiSuccessResponse, PaginationMeta, ResponseMeta } from '../types/index.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';

// ── Helpers ────────────────────────────────────────────────────

function buildMeta(res: Response, pagination?: PaginationMeta): ResponseMeta {
  return {
    requestId: res.locals.requestId,
    timestamp: new Date().toISOString(),
    ...(pagination && { pagination }),
  };
}

// ── Response Handler ───────────────────────────────────────────

/**
 * Centralized response builder.
 *
 * Usage:
 * ```ts
 * responseHandler.ok(res, data);
 * responseHandler.created(res, data);
 * responseHandler.noContent(res);
 * responseHandler.paginated(res, items, pagination);
 * ```
 */
export const responseHandler = {
  /** 200 OK — standard success with data. */
  ok<T>(res: Response, data: T): void {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      meta: buildMeta(res),
    };
    res.status(HTTP_STATUS.OK).json(response);
  },

  /** 201 Created — resource successfully created. */
  created<T>(res: Response, data: T): void {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      meta: buildMeta(res),
    };
    res.status(HTTP_STATUS.CREATED).json(response);
  },

  /** 204 No Content — success with empty body (delete, update-no-body). */
  noContent(res: Response): void {
    res.status(HTTP_STATUS.NO_CONTENT).end();
  },

  /** 200 OK — paginated list response. */
  paginated<T>(res: Response, data: T[], pagination: PaginationMeta): void {
    const response: ApiSuccessResponse<T[]> = {
      success: true,
      data,
      meta: buildMeta(res, pagination),
    };
    res.status(HTTP_STATUS.OK).json(response);
  },
} as const;
