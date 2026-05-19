"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAnnouncementService } from "@/services";
import type { Announcement } from "@/types";

export async function createAnnouncement(formData: FormData) {
  const svc = await getAnnouncementService();
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const excerpt = formData.get("excerpt") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const priority = formData.get("priority") as Announcement["priority"];
  const jalaliDate = formData.get("jalaliDate") as string;
  const featured = formData.get("featured") === "true";

  await svc.create({
    title,
    slug: slug || title.replace(/\s+/g, "-"),
    excerpt,
    content,
    category,
    priority,
    jalaliDate,
    featured,
    publishedAt: new Date().toISOString(),
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}

export async function updateAnnouncement(id: string, formData: FormData) {
  const svc = await getAnnouncementService();
  await svc.update(id, {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    excerpt: formData.get("excerpt") as string,
    content: formData.get("content") as string,
    category: formData.get("category") as string,
    priority: formData.get("priority") as Announcement["priority"],
    jalaliDate: formData.get("jalaliDate") as string,
    featured: formData.get("featured") === "true",
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}

export async function deleteAnnouncement(id: string) {
  const svc = await getAnnouncementService();
  await svc.delete(id);
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/");
}
