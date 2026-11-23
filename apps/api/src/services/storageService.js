import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Saves uploaded evidence buffer to persistent storage
 * @param {Object} options
 * @param {Buffer} options.buffer - Raw binary data
 * @param {string} options.originalFilename - Uploaded file name
 * @param {string} options.mimeType - Content MIME type
 * @returns {Promise<{storageKey: string, url: string, originalFilename: string, mimeType: string, size: number}>}
 */
export async function saveFile({ buffer, originalFilename, mimeType }) {
  const extension = path.extname(originalFilename) || '.bin';
  const fileHash = crypto.randomBytes(16).toString('hex');
  const storageKey = `evidence/${Date.now()}-${fileHash}${extension}`;

  // If R2 credentials configured, upload to S3-compatible endpoint (optional)
  // For local/self-contained MVP execution, save to secure local uploads dir:
  const localFilePath = path.join(UPLOAD_DIR, path.basename(storageKey));
  await fs.promises.writeFile(localFilePath, buffer);

  const url = `${env.API_URL}/api/support/evidence-file/${path.basename(storageKey)}`;

  return {
    storageKey,
    url,
    originalFilename,
    mimeType,
    size: buffer.length
  };
}

/**
 * Reads file from storage
 */
export async function getFile(storageKey) {
  const localFilePath = path.join(UPLOAD_DIR, path.basename(storageKey));
  if (!fs.existsSync(localFilePath)) {
    throw new Error('File not found in storage');
  }
  return fs.promises.readFile(localFilePath);
}

