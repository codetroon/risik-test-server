import { Router, type IRouter } from 'express';
import { healthRoutes } from './health/health.routes.js';
import { authRoutes } from './auth/auth.routes.js';
import { documentsRoutes } from './documents/documents.routes.js';

/** A feature router and the path it mounts under (relative to `API_PREFIX`). */
export interface ModuleRoute {
    path: string;
    router: IRouter;
}

const router: IRouter = Router();

const modules: ModuleRoute[] = [
    {
        path: '/health',
        router: healthRoutes,
    },
    {
        path: '/auth',
        router: authRoutes,
    },
    {
        path: '/documents',
        router: documentsRoutes,
    },
];

modules.forEach((module) => router.use(module.path, module.router));

export default router;