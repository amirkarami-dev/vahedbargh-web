"use server";

/**
 * storage-s3.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * File-storage service backed by Liara object storage (S3-compatible).
 *
 * All project files (elect_project_files) are stored here.
 * Legacy paths migrated from the old system follow the pattern:
 *   DB storage_path : "legacy/{uuid}/{filename}"
 *   Actual S3 key   : "Upload/ElectProjects/{uuid}/{filename}"
 *
 * New uploads are stored using the same key scheme so that the mapping is
 * always consistent:  storage_path "legacy/…"  →  S3 key "Upload/ElectProjects/…"
 *
 * Usage (Server Actions / Route Handlers only — "use server" is enforced):
 *   const url = await getFileUrl(row.storage_path);
 *   const path = await uploadProjectFile(file, projectId);
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ── S3 path prefix mapping ────────────────────────────────────────────────────

/**
 * The legacy S3 prefix that all ElectProject files live under in the bucket.
 * Old system: UploadFileAttach(file, name, "ElectProjects", uuid) → "Upload/ElectProjects/{uuid}/{name}"
 */
const LEGACY_S3_PREFIX = "Upload/ElectProjects";

// ── Client factory ────────────────────────────────────────────────────────────

function createS3Client(): S3Client {
  const endpoint = process.env.LIARA_S3_ENDPOINT;
  const accessKeyId = process.env.LIARA_S3_ACCESS_KEY;
  const secretAccessKey = process.env.LIARA_S3_SECRET_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Liara S3 credentials not configured. Set LIARA_S3_ENDPOINT, LIARA_S3_ACCESS_KEY, LIARA_S3_SECRET_KEY."
    );
  }

  return new S3Client({
    endpoint,
    region: "us-east-1",  // Liara ignores region but AWS SDK requires one
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,  // required for Liara / non-AWS S3
  });
}

function bucket(): string {
  const b = process.env.LIARA_S3_BUCKET;
  if (!b) throw new Error("LIARA_S3_BUCKET not set");
  return b;
}

// ── Path helpers ──────────────────────────────────────────────────────────────

/**
 * Convert a `storage_path` column value to the actual S3 object key.
 *
 * "legacy/{uuid}/{file}"  →  "Upload/ElectProjects/{uuid}/{file}"
 * Any other path is used as-is (for future non-legacy uploads stored differently).
 */
export function resolveS3Key(storagePath: string): string {
  if (storagePath.startsWith("legacy/")) {
    return LEGACY_S3_PREFIX + "/" + storagePath.slice("legacy/".length);
  }
  return storagePath;
}

/**
 * Build the storage_path value that goes into the DB from a new S3 key.
 * "Upload/ElectProjects/{uuid}/{file}"  →  "legacy/{uuid}/{file}"
 */
export function s3KeyToStoragePath(s3Key: string): string {
  const prefix = LEGACY_S3_PREFIX + "/";
  if (s3Key.startsWith(prefix)) {
    return "legacy/" + s3Key.slice(prefix.length);
  }
  return s3Key;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get a time-limited presigned URL for reading/downloading a file.
 *
 * @param storagePath  The `storage_path` value from `elect_project_files`
 * @param expiresIn    Seconds until the URL expires (default 1 hour)
 */
export async function getFileUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<string> {
  const client = createS3Client();
  const key = resolveS3Key(storagePath);
  const command = new GetObjectCommand({ Bucket: bucket(), Key: key });
  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Upload a new project file to Liara S3.
 * Creates a unique sub-folder per upload (matching the legacy scheme).
 *
 * @param file        Browser File object
 * @returns           The `storage_path` value to persist in `elect_project_files`
 */
export async function uploadProjectFile(file: File): Promise<string> {
  const client = createS3Client();
  const uuid = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const s3Key = `${LEGACY_S3_PREFIX}/${uuid}/${safeName}`;

  const bytes = await file.arrayBuffer();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: s3Key,
      Body: Buffer.from(bytes),
      ContentType: file.type || "application/octet-stream",
    })
  );

  return s3KeyToStoragePath(s3Key);  // "legacy/{uuid}/{safeName}"
}

/**
 * Upload raw bytes to a specific S3 key (used by PDF generation, reports, etc.).
 *
 * @param key         Full S3 object key (e.g. "Upload/ElectProjects/{id}/approved-comment-form.pdf")
 * @param data        Buffer or Uint8Array
 * @param contentType MIME type
 * @returns           The storage_path equivalent for the DB
 */
export async function uploadRawToS3(
  key: string,
  data: Buffer | Uint8Array,
  contentType = "application/octet-stream"
): Promise<string> {
  const client = createS3Client();
  await client.send(
    new PutObjectCommand({ Bucket: bucket(), Key: key, Body: data, ContentType: contentType })
  );
  return s3KeyToStoragePath(key);
}

/**
 * Delete a file from Liara S3.
 *
 * @param storagePath  The `storage_path` value from `elect_project_files`
 */
export async function deleteProjectFile(storagePath: string): Promise<void> {
  const client = createS3Client();
  const key = resolveS3Key(storagePath);
  await client.send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

/**
 * Check whether a file exists in Liara S3.
 * Returns false if the key doesn't exist (instead of throwing).
 */
export async function fileExists(storagePath: string): Promise<boolean> {
  const client = createS3Client();
  const key = resolveS3Key(storagePath);
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
    return true;
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.name === "NotFound" || err.name === "NoSuchKey" || (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404)
    ) {
      return false;
    }
    throw err;
  }
}
