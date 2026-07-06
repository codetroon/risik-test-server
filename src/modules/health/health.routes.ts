import { Router, type IRouter } from 'express';
import { HealthController } from './health.controller.js';

const router: IRouter = Router();
const controller = new HealthController();

router.get('/', controller.getHealth);

export { router as healthRoutes };