import path from 'node:path';
import { createReadStream, promises as fs } from 'node:fs';
import type { Request, Response } from 'express';
import { DocumentsService } from './documents.service.js';
import { responseHandler } from '../../shared/lib/responseHandler.js';
import { ApiError } from '../../shared/errors/AppError.js';
import type { CreateDocumentInput, ListDocumentsQuery } from './documents.schemas.js';

export class DocumentsController {
  constructor(private readonly service: DocumentsService = new DocumentsService()) {}

  upload = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new ApiError.BadRequest('A file is required');
    }

    // Only CSV / XLSX are accepted. Reject (and clean up) anything else.
    const ALLOWED_EXT = ['.csv', '.xlsx'];
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      await fs.unlink(req.file.path).catch(() => {});
      throw new ApiError.BadRequest('Only CSV or XLSX files are supported');
    }

    const doc = await this.service.create(
      req.body as CreateDocumentInput,
      {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        storagePath: req.file.path,
      },
      req.auth!.id,
    );
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
    res.setHeader('Content-Length', doc.size);
    res.setHeader('Content-Disposition', `${disposition}; filename*=UTF-8''${filename}`);

    createReadStream(path.resolve(doc.storagePath)).pipe(res);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.service.remove(String(req.params.id));
    responseHandler.noContent(res);
  };
}
