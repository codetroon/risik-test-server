import path from 'node:path';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import type { Request, Response } from 'express';
import { DocumentsService } from './documents.service.js';
import { responseHandler } from '../../shared/lib/responseHandler.js';
import { ApiError } from '../../shared/errors/AppError.js';
import { signUpload } from '../../config/cloudinary.js';
import type { ListDocumentsQuery, RegisterDocumentInput } from './documents.schemas.js';

export class DocumentsController {
  constructor(private readonly service: DocumentsService = new DocumentsService()) {}

  /** Issue a signature so the browser can upload a file straight to Cloudinary. */
  signature = (_req: Request, res: Response): void => {
    responseHandler.ok(res, signUpload());
  };

  /**
   * Register a document whose file was uploaded directly to Cloudinary by the
   * browser. Only CSV/XLSX are accepted; the file is verified in the service.
   */
  register = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as RegisterDocumentInput;

    const ALLOWED_EXT = ['.csv', '.xlsx'];
    const ext = path.extname(body.originalName).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      throw new ApiError.BadRequest('Only CSV or XLSX files are supported');
    }

    const doc = await this.service.registerUploaded(body, req.auth!.id);
    responseHandler.created(res, doc);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListDocumentsQuery;
    const { items, total } = await this.service.list(query);
    responseHandler.paginated(res, items, {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    });
  };

  /** Stream the stored file. `?download=1` forces a download disposition. */
  file = async (req: Request, res: Response): Promise<void> => {
    const doc = await this.service.getFileMeta(String(req.params.id));
    const disposition = req.query.download ? 'attachment' : 'inline';
    const filename = encodeURIComponent(doc.originalName);

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `${disposition}; filename*=UTF-8''${filename}`);

    // Cloudinary-backed files have an http(s) storagePath; proxy them through
    // this authenticated endpoint so the raw URL is never exposed to clients.
    if (/^https?:\/\//.test(doc.storagePath)) {
      const upstream = await fetch(doc.storagePath);
      if (!upstream.ok || !upstream.body) {
        throw new ApiError.NotFound('File is no longer available');
      }
      res.setHeader('Content-Length', doc.size);
      Readable.fromWeb(upstream.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
      return;
    }

    // Legacy on-disk fallback (records created before Cloudinary).
    res.setHeader('Content-Length', doc.size);
    createReadStream(path.resolve(doc.storagePath)).pipe(res);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.service.remove(String(req.params.id));
    responseHandler.noContent(res);
  };
}
