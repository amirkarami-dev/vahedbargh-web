"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMeetingService } from "@/services";
import type { Meeting } from "@/types";

export async function createMeeting(formData: FormData) {
  const svc = await getMeetingService();
  const resolutionsRaw = formData.get("resolutions") as string;
  let resolutions: Meeting["resolutions"] = [];
  try { resolutions = JSON.parse(resolutionsRaw || "[]"); } catch { resolutions = []; }

  const attendeesRaw = formData.get("attendees") as string;
  const attendees = attendeesRaw ? attendeesRaw.split("\n").map((s) => s.trim()).filter(Boolean) : [];

  await svc.create({
    sessionNumber: Number(formData.get("sessionNumber")),
    subject: formData.get("subject") as string,
    jalaliDate: formData.get("jalaliDate") as string,
    status: formData.get("status") as Meeting["status"],
    type: formData.get("type") as Meeting["type"],
    pdfUrl: (formData.get("pdfUrl") as string) || undefined,
    resolutions,
    attendees,
    notes: (formData.get("notes") as string) || undefined,
  });

  revalidatePath("/admin/meetings");
  revalidatePath("/meetings");
  revalidatePath("/");
  redirect("/admin/meetings");
}

export async function updateMeeting(id: string, formData: FormData) {
  const svc = await getMeetingService();
  const resolutionsRaw = formData.get("resolutions") as string;
  let resolutions: Meeting["resolutions"] = [];
  try { resolutions = JSON.parse(resolutionsRaw || "[]"); } catch { resolutions = []; }

  const attendeesRaw = formData.get("attendees") as string;
  const attendees = attendeesRaw ? attendeesRaw.split("\n").map((s) => s.trim()).filter(Boolean) : [];

  await svc.update(id, {
    sessionNumber: Number(formData.get("sessionNumber")),
    subject: formData.get("subject") as string,
    jalaliDate: formData.get("jalaliDate") as string,
    status: formData.get("status") as Meeting["status"],
    type: formData.get("type") as Meeting["type"],
    pdfUrl: (formData.get("pdfUrl") as string) || undefined,
    resolutions,
    attendees,
    notes: (formData.get("notes") as string) || undefined,
  });

  revalidatePath("/admin/meetings");
  revalidatePath("/meetings");
  revalidatePath("/");
  redirect("/admin/meetings");
}

export async function deleteMeeting(id: string) {
  const svc = await getMeetingService();
  await svc.delete(id);
  revalidatePath("/admin/meetings");
  revalidatePath("/meetings");
  revalidatePath("/");
}
