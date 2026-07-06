import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { env } from './env.js';
import { ApiError } from '../shared/errors/AppError.js';
import { logger } from '../shared/lib/logger.js';

/**
 * Cloudinary is used as the document file store (resource_type `raw`, so any
 * CSV/XLSX bytes are kept verbatim). Configured once from env; if the three
 * credentials are missing the API still boots — upload/download/delete just
 * return a clear "not configured" error until they're provided.
 */
export const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info('☁️  Cloudinary configured for document storage');
} else {
  logger.warn('Cloudinary is not configured — set CLOUDINARY_* env vars to enable uploads');
}

function assertConfigured(): void {
  if (!isCloudinaryConfigured) {
    throw new ApiError.ServiceUnavailable('File storage (Cloudinary) is not configured');
  }
}

/** Upload a file buffer as a raw asset. Returns `{ public_id, secure_url, ... }`. */
export function uploadRawBuffer(buffer: Buffer): Promise<UploadApiResponse> {
  assertConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', folder: 'risik-documents' },
      (error, result) => {
        if (error || !result) reject(error ?? new Error('Cloudinary upload failed'));
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
}

/** Permanently delete a raw asset by its public id. */
export async function destroyRaw(publicId: string): Promise<void> {
  assertConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: 'raw', invalidate: true });
}

/** Folder every uploaded document is stored under. */
export const DOCUMENTS_FOLDER = 'risik-documents';

/**
 * Produce a signed payload the browser uses to upload a raw file straight to
 * Cloudinary (bypassing our server). Only the `folder` + `timestamp` are signed
 * — the client must send exactly those, plus the file and api_key.
 */
export function signUpload(): {
  timestamp: number;
  signature: string;
  folder: string;
  apiKey: string;
  cloudName: string;
} {
  assertConfigured();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = DOCUMENTS_FOLDER;
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    env.CLOUDINARY_API_SECRET as string,
  );
  return {
    timestamp,
    signature,
    folder,
    apiKey: env.CLOUDINARY_API_KEY as string,
    cloudName: env.CLOUDINARY_CLOUD_NAME as string,
  };
}

/**
 * Fetch a raw asset's authoritative metadata (used to verify a client-reported
 * direct upload really exists before we persist it).
 */
export async function getRawResource(
  publicId: string,
): Promise<{ secure_url: string; bytes: number }> {
  assertConfigured();
  const res = await cloudinary.api.resource(publicId, { resource_type: 'raw' });
  return { secure_url: res.secure_url, bytes: res.bytes };
}
