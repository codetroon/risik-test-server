import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/AppError.js';

export function unknownRouteHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError.NotFound('The requested resource was not found'));
}
