import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from '../errors/AppError.js';

export interface RequestValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export interface ValidateOptions {
  /**
   * If true, and req.body.data is a JSON string (common with multipart/form-data
   * uploads where JSON metadata is sent alongside a file), it will be parsed
   * before body validation runs.
   * Default: false — only opt in on routes that actually need it.
   */
  parseMultipartJson?: boolean;
}

/**
 * Express middleware to validate request body, query params, and route params using Zod.
 * Automatically parses, transforms, and casts inputs, writing the typed results back to the request.
 * Handled errors are passed to next() and caught by the global error handler.
 *
 * @example
 * router.get('/users/:id', validate({ params: idParamSchema }), controller.getUser);
 *
 * @example
 * // multipart route: file upload + JSON metadata in req.body.data
 * router.post(
 *   '/users/:id/avatar',
 *   upload.single('avatar'),
 *   validate({ params: idParamSchema, body: updateUserSchema }, { parseMultipartJson: true }),
 *   controller.updateAvatar,
 * );
 */
export function validate(schemas: RequestValidationSchemas, options: ValidateOptions = {}) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as unknown as Request['params'];
      }

      if (schemas.query) {
        const parsedQuery = (await schemas.query.parseAsync(req.query)) as unknown as Request['query'];
        Object.defineProperty(req, 'query', {
          value: parsedQuery,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }

      if (schemas.body) {
        if (options.parseMultipartJson && typeof req.body?.data === 'string') {
          try {
            req.body = JSON.parse(req.body.data);
          } catch {
            throw new ApiError.BadRequest('Invalid JSON in "data" field');
          }
        }

        req.body = (await schemas.body.parseAsync(req.body)) as unknown;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}