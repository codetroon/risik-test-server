import { z } from 'zod';

// ── Request ────────────────────────────────────────────────────

/** Metadata submitted alongside the uploaded file (multipart text fields). */
export const createDocumentSchema = z
  .object({
    title: z.string().trim().min(1, 'Document title is required').meta({ example: 'Johor Field Assessment' }),
    category: z.string().trim().optional().meta({ example: 'Field Intelligence' }),
    state: z.string().trim().optional().meta({ example: 'Johor Bahru' }),
    district: z.string().trim().optional().meta({ example: 'Johor South' }),
    documentType: z.string().trim().optional().meta({ example: 'PDF' }),
    notes: z.string().trim().optional(),
    documentDate: z.string().trim().optional().meta({ example: '2026-05-20' }),
  })
  .meta({ id: 'CreateDocumentRequest' });

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const listDocumentsQuerySchema = z.object({
  search: z.string().trim().optional(),
  state: z.string().trim().optional(),
  status: z.enum(['pending', 'active', 'archived']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;

export const documentIdParamSchema = z.object({
  id: z.string().min(1),
});

// ── Response ───────────────────────────────────────────────────

export const documentSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    category: z.string().nullable(),
    state: z.string().nullable(),
    district: z.string().nullable(),
    documentType: z.string().nullable(),
    notes: z.string().nullable(),
    status: z.enum(['pending', 'active', 'archived']),
    documentDate: z.string().nullable(),
    originalName: z.string(),
    mimeType: z.string(),
    size: z.number().int(),
    uploadedBy: z.object({ id: z.string(), name: z.string() }),
    createdAt: z.string(),
  })
  .meta({ id: 'Document' });

export type DocumentDto = z.infer<typeof documentSchema>;
