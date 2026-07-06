import type { Request, Response } from 'express';
import { HealthService } from './health.service.js';
import { env } from '../../config/env.js';
import { responseHandler } from '../../shared/lib/responseHandler.js';

export class HealthController {
  constructor(private readonly healthService: HealthService = new HealthService()) {}

  getHealth = (_req: Request, res: Response): void => {
    const data = this.healthService.getHealth(env.NODE_ENV);
    responseHandler.ok(res, data);
  };
}
