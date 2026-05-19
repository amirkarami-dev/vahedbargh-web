"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDocumentService } from "@/services";
import type { DocumentCategory } from "@/types";

export async function createDocument(formData: FormData) {
  const svc = await getDocumentService();
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  await svc.create({
    title: formData.get("title") as string,
    category: formData.get("category") as DocumentCategory,
    jalaliDate: formData.get("jalaliDate") as string,
    version: formData.get("version") as string,
    description: formData.get("description") as string,
    fileSize: formData.get("fileSize") as string,
    downloadCount: 0,
    tags,
    fileUrl: (formData.get("fileUrl") as string) || undefined,
    featured: formData.get("featured") === "true",
  });

  revalidatePath("/admin/documents");
  revalidatePath("/archive");
  revalidatePath("/");
  redirect("/admin/documents");
}

export async function updateDocument(id: string, formData: FormData) {
  const svc = await getDocumentService();
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  await svc.update(id, {
    title: formData.get("title") as string,
    category: formData.get("category") as DocumentCategory,
    jalaliDate: formData.get("jalaliDate") as string,
    version: formData.get("version") as string,
    description: formData.get("description") as string,
    fileSize: formData.get("fileSize") as string,
    tags,
    fileUrl: (formData.get("fileUrl") as string) || undefined,
    featured: formData.get("featured") === "true",
  });

  revalidatePath("/admin/documents");
  revalidatePath("/archive");
  revalidatePath("/");
  redirect("/admin/documents");
}

export async function deleteDocument(id: string) {
  const svc = await getDocumentService();
  await svc.delete(id);
  revalidatePath("/admin/documents");
  revalidatePath("/archive");
  revalidatePath("/");
}
