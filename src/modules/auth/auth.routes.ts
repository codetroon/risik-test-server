import { Router, type IRouter } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth } from '../../shared/middleware/requireAuth.js';
import { loginSchema } from './auth.schemas.js';

const router: IRouter = Router();
const controller = new AuthController();

router.post('/login', validate({ body: loginSchema }), controller.login);
router.get('/me', requireAuth, controller.me);
router.post('/logout', requireAuth, controller.logout);

export { router as authRoutes };
