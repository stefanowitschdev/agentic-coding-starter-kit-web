import { existsSync } from "fs";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Result from uploading a file to storage
 */
export interface StorageResult {
  url: string; // Public URL to access the file
  pathname: string; // Path/key of the stored file
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  /** Maximum file size in bytes (default: 5MB) */
  maxSize?: number;
  /** Allowed MIME types (default: images and documents) */
  allowedTypes?: string[];
}

/**
 * Default storage configuration
 */
const DEFAULT_CONFIG: Required<StorageConfig> = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Documents
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/json",
  ],
};

/**
 * Allowed file extensions mapped from MIME types
 */
const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".pdf",
  ".txt",
  ".csv",
  ".json",
]);

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".json": "application/json",
};

/**
 * S3 connection settings, resolved from the environment.
 *
 * Works with any S3-compatible provider (Hetzner Object Storage, MinIO, AWS,
 * Cloudflare R2, …). `S3_ENDPOINT` is optional — leave it unset for AWS S3.
 */
interface S3Settings {
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Optional public base URL for object access (e.g. a CDN domain) */
  publicBaseUrl?: string;
}

/**
 * Returns S3 settings if fully configured, otherwise `null` (local fallback).
 */
function getS3Settings(): S3Settings | null {
  const {
    S3_BUCKET,
    S3_REGION,
    S3_ENDPOINT,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    S3_PUBLIC_URL,
  } = process.env;

  if (S3_BUCKET && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY) {
    return {
      bucket: S3_BUCKET,
      region: S3_REGION || "auto",
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
      ...(S3_ENDPOINT ? { endpoint: S3_ENDPOINT } : {}),
      ...(S3_PUBLIC_URL ? { publicBaseUrl: S3_PUBLIC_URL } : {}),
    };
  }

  return null;
}

let cachedClient: S3Client | null = null;

function getClient(settings: S3Settings): S3Client {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: settings.region,
      // Path-style addressing is required by most non-AWS S3 providers.
      forcePathStyle: Boolean(settings.endpoint),
      credentials: {
        accessKeyId: settings.accessKeyId,
        secretAccessKey: settings.secretAccessKey,
      },
      ...(settings.endpoint ? { endpoint: settings.endpoint } : {}),
    });
  }
  return cachedClient;
}

/**
 * Builds the public URL for a stored object.
 */
function buildPublicUrl(settings: S3Settings, key: string): string {
  if (settings.publicBaseUrl) {
    return `${settings.publicBaseUrl.replace(/\/$/, "")}/${key}`;
  }
  if (settings.endpoint) {
    return `${settings.endpoint.replace(/\/$/, "")}/${settings.bucket}/${key}`;
  }
  return `https://${settings.bucket}.s3.${settings.region}.amazonaws.com/${key}`;
}

/**
 * Resolves an object key from a value that may be a full URL or already a key.
 */
function toKey(urlOrKey: string, settings: S3Settings): string {
  if (!/^https?:\/\//.test(urlOrKey)) {
    return urlOrKey.replace(/^\/+/, "");
  }
  const base = settings.publicBaseUrl
    ? settings.publicBaseUrl.replace(/\/$/, "")
    : settings.endpoint
      ? `${settings.endpoint.replace(/\/$/, "")}/${settings.bucket}`
      : `https://${settings.bucket}.s3.${settings.region}.amazonaws.com`;
  return urlOrKey.replace(`${base}/`, "").replace(/^\/+/, "");
}

function contentTypeFor(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return CONTENT_TYPES[ext] || "application/octet-stream";
}

/**
 * Sanitize a filename by removing dangerous characters and path traversal attempts
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components (prevent directory traversal)
  const basename = filename.split(/[/\\]/).pop() || filename;

  // Remove or replace dangerous characters
  const sanitized = basename
    .replace(/[<>:"|?*\x00-\x1f]/g, "") // Remove dangerous chars
    .replace(/\.{2,}/g, ".") // Collapse multiple dots
    .replace(/^\.+/, "") // Remove leading dots
    .trim();

  // Ensure filename is not empty
  if (!sanitized || sanitized.length === 0) {
    throw new Error("Invalid filename");
  }

  // Limit filename length
  if (sanitized.length > 255) {
    const ext = sanitized.slice(sanitized.lastIndexOf("."));
    const name = sanitized.slice(0, 255 - ext.length);
    return name + ext;
  }

  return sanitized;
}

/**
 * Validate file for upload
 */
export function validateFile(
  buffer: Buffer,
  filename: string,
  config: StorageConfig = {}
): { valid: true } | { valid: false; error: string } {
  const { maxSize } = { ...DEFAULT_CONFIG, ...config };

  // Check file size
  if (buffer.length > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  // Check file extension
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed extensions: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}`,
    };
  }

  // Optionally check MIME type if provided
  // Note: For full MIME type validation, consider using a library like 'file-type'

  return { valid: true };
}

/**
 * Returns `true` when an S3-compatible backend is configured.
 */
export function isRemoteStorageConfigured(): boolean {
  return getS3Settings() !== null;
}

/**
 * Uploads a file to storage (S3-compatible backend or local filesystem)
 *
 * @param buffer - File contents as a Buffer
 * @param filename - Name of the file (e.g., "image.png")
 * @param folder - Optional folder/prefix (e.g., "avatars")
 * @param config - Optional storage configuration
 * @returns StorageResult with url and pathname
 *
 * @example
 * ```ts
 * const result = await upload(fileBuffer, "avatar.png", "avatars");
 * console.log(result.url); // https://<bucket>.../avatars/avatar.png or /uploads/avatars/avatar.png
 * ```
 */
export async function upload(
  buffer: Buffer,
  filename: string,
  folder?: string,
  config?: StorageConfig
): Promise<StorageResult> {
  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(filename);

  // Validate file
  const validation = validateFile(buffer, sanitizedFilename, config);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const pathname = folder
    ? `${folder}/${sanitizedFilename}`
    : sanitizedFilename;

  const settings = getS3Settings();

  if (settings) {
    // Use S3-compatible object storage
    const client = getClient(settings);
    await client.send(
      new PutObjectCommand({
        Bucket: settings.bucket,
        Key: pathname,
        Body: buffer,
        ContentType: contentTypeFor(sanitizedFilename),
      })
    );

    return {
      url: buildPublicUrl(settings, pathname),
      pathname,
    };
  }

  // Use local filesystem storage (development fallback)
  const uploadsDir = join(process.cwd(), "public", "uploads");
  const targetDir = folder ? join(uploadsDir, folder) : uploadsDir;

  // Ensure the directory exists
  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
  }

  // Write the file
  const filepath = join(targetDir, sanitizedFilename);
  await writeFile(filepath, buffer);

  return {
    url: `/uploads/${pathname}`,
    pathname,
  };
}

/**
 * Deletes a file from storage
 *
 * @param urlOrKey - The public URL or object key of the file to delete
 *
 * @example
 * ```ts
 * await deleteFile("https://<bucket>.../avatars/avatar.png");
 * // or
 * await deleteFile("/uploads/avatars/avatar.png");
 * ```
 */
export async function deleteFile(urlOrKey: string): Promise<void> {
  const settings = getS3Settings();

  if (settings) {
    const client = getClient(settings);
    await client.send(
      new DeleteObjectCommand({
        Bucket: settings.bucket,
        Key: toKey(urlOrKey, settings),
      })
    );
    return;
  }

  // Delete from local filesystem
  // Extract pathname from URL (e.g., /uploads/avatars/avatar.png -> avatars/avatar.png)
  const pathname = urlOrKey.replace(/^\/uploads\//, "");
  const filepath = join(process.cwd(), "public", "uploads", pathname);

  // Only attempt to delete if file exists
  if (existsSync(filepath)) {
    await unlink(filepath);
  }
}

/**
 * Creates a pre-signed URL for uploading directly to the bucket from the client.
 * Requires an S3-compatible backend to be configured.
 *
 * @param key - Object key (e.g. "uploads/file.pdf")
 * @param contentType - MIME type the client will upload
 * @param expiresIn - Validity in seconds (default: 900 = 15 minutes)
 */
export async function getUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 900
): Promise<string> {
  const settings = getS3Settings();
  if (!settings) {
    throw new Error(
      "Pre-signed uploads require an S3-compatible backend. Set the S3_* environment variables."
    );
  }
  const client = getClient(settings);
  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: settings.bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn }
  );
}

/**
 * Creates a pre-signed URL for downloading a (private) object.
 * Requires an S3-compatible backend to be configured.
 *
 * @param key - Object key
 * @param expiresIn - Validity in seconds (default: 900 = 15 minutes)
 */
export async function getDownloadUrl(
  key: string,
  expiresIn = 900
): Promise<string> {
  const settings = getS3Settings();
  if (!settings) {
    throw new Error(
      "Pre-signed downloads require an S3-compatible backend. Set the S3_* environment variables."
    );
  }
  const client = getClient(settings);
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: settings.bucket, Key: key }),
    { expiresIn }
  );
}
