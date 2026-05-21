"use server";

import { revalidatePath } from "next/cache";

export interface Engineer {
  id: string;
  clientId: string;
  userId?: string;
  fullName: string;
  naCode?: string;
  cellPhone?: string;
  email?: string;
  dadName?: string;
  tell?: string;
  address?: string;
  sectionId?: number;
  fieldType: number;
  educationType: number;
  bankAccountNumber?: string;
  defaultQuota: number;
  certOfTest: boolean;
  certOfEarth: boolean;
  certOfFiber: boolean;
  certOfInspection: boolean;
  inactive: boolean;
  bankAccountBlocked: boolean;
  has1Percent: boolean;
  hasQuarterIncrease: boolean;
  sortIndex: number;
  isDelete: boolean;
  solarBirthDate?: string;
  solarMembershipDate?: string;
  createdAt: string;
}

async function getEngineersService() {
  const provider = process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "mock";
  if (provider === "supabase") {
    const mod = await import("@/services/supabase/engineers");
    return mod.default;
  }
  const mod = await import("@/services/mock/engineers");
  return mod.default;
}

export async function getEngineers(filter?: {
  search?: string;
  sectionId?: number;
  inactive?: boolean;
}): Promise<Engineer[]> {
  const svc = await getEngineersService();
  return svc.getAll(filter) as Promise<Engineer[]>;
}

export async function getEngineerById(id: string): Promise<Engineer | null> {
  const svc = await getEngineersService();
  return svc.getById(id) as Promise<Engineer | null>;
}

export async function saveEngineer(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const svc = await getEngineersService();

    const id = formData.get("id") as string | null;
    const sectionIdRaw = formData.get("sectionId") as string | null;

    const data: Partial<Engineer> = {
      ...(id ? { id } : {}),
      fullName: (formData.get("fullName") as string) ?? "",
      naCode: (formData.get("naCode") as string) || undefined,
      cellPhone: (formData.get("cellPhone") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
      dadName: (formData.get("dadName") as string) || undefined,
      tell: (formData.get("tell") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      sectionId: sectionIdRaw ? Number(sectionIdRaw) : undefined,
      fieldType: Number(formData.get("fieldType") ?? 0),
      educationType: Number(formData.get("educationType") ?? 0),
      bankAccountNumber: (formData.get("bankAccountNumber") as string) || undefined,
      defaultQuota: Number(formData.get("defaultQuota") ?? 0),
      certOfTest: formData.get("certOfTest") === "on",
      certOfEarth: formData.get("certOfEarth") === "on",
      certOfFiber: formData.get("certOfFiber") === "on",
      certOfInspection: formData.get("certOfInspection") === "on",
      inactive: formData.get("inactive") === "on",
      bankAccountBlocked: formData.get("bankAccountBlocked") === "on",
      has1Percent: formData.get("has1Percent") === "on",
      hasQuarterIncrease: formData.get("hasQuarterIncrease") === "on",
      solarBirthDate: (formData.get("solarBirthDate") as string) || undefined,
      solarMembershipDate: (formData.get("solarMembershipDate") as string) || undefined,
    };

    await svc.upsert(data);
    revalidatePath("/admin/engineers");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطا در ذخیره";
    return { ok: false, error: message };
  }
}

export async function deleteEngineer(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const svc = await getEngineersService();
    await svc.delete(id);
    revalidatePath("/admin/engineers");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطا در حذف";
    return { ok: false, error: message };
  }
}

export async function addHistory(
  engineerId: string,
  description: string
): Promise<{ ok: boolean }> {
  try {
    const svc = await getEngineersService();
    await svc.addHistory(engineerId, description);
    revalidatePath(`/admin/engineers/${engineerId}`);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
