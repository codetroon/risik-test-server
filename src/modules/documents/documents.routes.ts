import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { Router, type IRouter } from 'express';
import multer from 'multer';
import { DocumentsController } from './documents.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth, requireRole } from '../../shared/middleware/requireAuth.js';
import { env } from '../../config/env.js';
import {
  createDocumentSchema,
  documentIdParamSchema,
  listDocumentsQuerySchema,
} from './documents.schemas.js';

// Ensure the upload directory exists at startup.
const uploadDir = path.resolve(env.UPLOAD_DIR);
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB (matches the upload UI)
});

const router: IRouter = Router();
const controller = new DocumentsController();

router.post(
  '/',
  requireAuth,
  upload.single('file'),
  validate({ body: createDocumentSchema }),
  controller.upload,
);

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
