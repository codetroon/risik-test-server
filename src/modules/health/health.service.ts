import type { z } from 'zod';
import type { healthStatusSchema } from './health.schemas.js';

/** Derived from the Zod schema — single source of truth for the health payload. */
export type HealthStatus = z.infer<typeof healthStatusSchema>;

export class HealthService {
  getHealth(environment: string): HealthStatus {
    const mem = process.memoryUsage();
    const toMB = (bytes: number): string => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

    return {
      status: 'ok',
      uptime: process.uptime(),
      environment,
      timestamp: new Date().toISOString(),
      memoryUsage: {
        rss: toMB(mem.rss),
        heapUsed: toMB(mem.heapUsed),
        heapTotal: toMB(mem.heapTotal),
      },
    };
  }
}