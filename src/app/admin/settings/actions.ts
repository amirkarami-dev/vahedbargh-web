"use server";

import { revalidatePath } from "next/cache";
import { getSettingsService } from "@/services";

export async function saveSettingsAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  try {
    const svc = await getSettingsService();
    const values: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") values[key] = value;
    }
    await svc.setMany(values);
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
