"use server";

import { createAdminClient } from "@/lib/supabase-server";

// ─── Generate File Path ────────────────────────────────────────────────────────

/**
 * Generate a unique, collision-resistant storage path.
 * Format: {folder}/{uuid}-{sanitized-filename}
 */
export function generateFilePath(folder: string, file: File): string {
  const uuid = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${folder}/${uuid}-${safeName}`;
}

// ─── Upload File ───────────────────────────────────────────────────────────────

/**
 * Upload a file to Supabase Storage.
 * @returns The storage path of the uploaded file.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const supabase = await createAdminClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return path;
}

// ─── Get Signed URL ────────────────────────────────────────────────────────────

/**
 * Get a signed URL for a private bucket file (default 1 hour expiry).
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 3600
): Promise<string> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message ?? "unknown error"}`);
  }
  return data.signedUrl;
}

// ─── Get Public URL ────────────────────────────────────────────────────────────

/**
 * Get the public URL for a file in a public bucket (e.g. avatars).
 * This is synchronous — no server call needed.
 */
export async function getPublicUrl(
  bucket: string,
  path: string
): Promise<string> {
  const supabase = await createAdminClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Delete File ───────────────────────────────────────────────────────────────

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<void> {
  const supabase = await createAdminClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}
