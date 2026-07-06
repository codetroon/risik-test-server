import { z } from 'zod';

export const healthStatusSchema = z
    .object({
        status: z.string().meta({ example: 'ok' }),
        uptime: z.number().meta({ description: 'Process uptime in seconds', example: 123.45 }),
        environment: z.string().meta({ example: 'development' }),
        timestamp: z.string().meta({ example: '2026-07-05T10:45:43.000Z' }),
        memoryUsage: z.object({
            rss: z.string().meta({ example: '48.21 MB' }),
            heapUsed: z.string().meta({ example: '20.10 MB' }),
            heapTotal: z.string().meta({ example: '30.00 MB' }),
        }),
    })
    .meta({ id: 'HealthStatus' });