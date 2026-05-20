"use server";
import { revalidatePath } from "next/cache";
import { getStatsService } from "@/services";

export async function createStatAction(formData: FormData) {
  const svc = await getStatsService();
  await svc.create({
    label: formData.get("label") as string,
    value: Number(formData.get("value")),
    suffix: (formData.get("suffix") as string) ?? "",
    iconName: (formData.get("iconName") as string) ?? "FileCheck",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  revalidatePath("/admin/stats");
  revalidatePath("/");
}

export async function updateStatAction(id: string, formData: FormData) {
  const svc = await getStatsService();
  await svc.update(id, {
    label: formData.get("label") as string,
    value: Number(formData.get("value")),
    suffix: (formData.get("suffix") as string) ?? "",
    iconName: (formData.get("iconName") as string) ?? "FileCheck",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  revalidatePath("/admin/stats");
  revalidatePath("/");
}

export async function deleteStatAction(id: string) {
  const svc = await getStatsService();
  await svc.delete(id);
  revalidatePath("/admin/stats");
  revalidatePath("/");
}
