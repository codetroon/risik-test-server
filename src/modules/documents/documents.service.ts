import { promises as fs } from 'node:fs';
import path from 'node:path';
import { prisma } from '../../db/prisma.js';
import { ApiError } from '../../shared/errors/AppError.js';
import type { CreateDocumentInput, DocumentDto, ListDocumentsQuery } from './documents.schemas.js';
import type { Prisma } from '../../generated/prisma/client.js';

type DocumentWithUploader = Prisma.DocumentModel & {
  uploadedBy: { id: string; name: string };
};

function toDto(doc: DocumentWithUploader): DocumentDto {
  return {
    id: doc.id,
    title: doc.title,
    category: doc.category,
    state: doc.state,
    district: doc.district,
    documentType: doc.documentType,
    notes: doc.notes,
    status: doc.status,
    documentDate: doc.documentDate ? doc.documentDate.toISOString() : null,
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    size: doc.size,
    uploadedBy: { id: doc.uploadedBy.id, name: doc.uploadedBy.name },
    createdAt: doc.createdAt.toISOString(),
  };
}

/** Multer file info the service needs to persist a document. */
export interface StoredFile {
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  storagePath: string;
}

export class DocumentsService {
  /** Persist an uploaded file's metadata. */
  async create(
    input: CreateDocumentInput,
    file: StoredFile,
    uploadedById: string,
  ): Promise<DocumentDto> {
    const doc = await prisma.document.create({
      data: {
        id: crypto.randomUUID(),
        title: input.title,
        category: input.category ?? null,
        state: input.state ?? null,
        district: input.district ?? null,
        documentType: input.documentType ?? null,
        notes: input.notes ?? null,
        documentDate: input.documentDate ? new Date(input.documentDate) : null,
        status: 'active',
        originalName: file.originalName,
        storedName: file.storedName,
        mimeType: file.mimeType,
        size: file.size,
        storagePath: file.storagePath,
        uploadedById,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });
    return toDto(doc);
  }

  /** List non-deleted documents with optional filters + pagination. */
  async list(query: ListDocumentsQuery): Promise<{ items: DocumentDto[]; total: number }> {
    const where: Prisma.DocumentWhereInput = {
      deletedAt: null,
      ...(query.state && { state: query.state }),
      ...(query.status && { status: query.status }),
      ...(query.search && {
        title: { contains: query.search, mode: 'insensitive' },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: { uploadedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.document.count({ where }),
    ]);

    return { items: items.map(toDto), total };
  }

  /** Load a document row (including storage path) for streaming its file. */
  async getFileMeta(id: string): Promise<Prisma.DocumentModel> {
    const doc = await prisma.document.findFirst({ where: { id, deletedAt: null } });
    if (!doc) {
      throw new ApiError.NotFound('Document not found');
    }
    return doc;
  }

  /** Soft-delete a document and remove its file from disk. */
  async remove(id: string): Promise<void> {
    const doc = await prisma.document.findFirst({ where: { id, deletedAt: null } });
    if (!doc) {
      throw new ApiError.NotFound('Document not found');
    }

    await prisma.document.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
    });

    // Best-effort file cleanup — a missing file must not fail the delete.
    try {
      await fs.unlink(path.resolve(doc.storagePath));
    } catch {
      /* file already gone — ignore */
    }
  }
}
