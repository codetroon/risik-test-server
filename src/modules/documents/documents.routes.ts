import { Router, type IRouter } from 'express';
import { DocumentsController } from './documents.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth, requireRole } from '../../shared/middleware/requireAuth.js';
import {
  registerDocumentSchema,
  documentIdParamSchema,
  listDocumentsQuerySchema,
} from './documents.schemas.js';

const router: IRouter = Router();
const controller = new DocumentsController();

// Files are uploaded directly from the browser to Cloudinary using a signature
// issued here, then registered (metadata only) via POST /documents.
router.post('/signature', requireAuth, controller.signature);

router.post('/', requireAuth, validate({ body: registerDocumentSchema }), controller.register);

router.get('/', requireAuth, validate({ query: listDocumentsQuerySchema }), controller.list);

router.get(
  '/:id/file',
  requireAuth,
  validate({ params: documentIdParamSchema }),
  controller.file,
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('super_admin', 'admin'),
  validate({ params: documentIdParamSchema }),
  controller.remove,
);

export { router as documentsRoutes };
