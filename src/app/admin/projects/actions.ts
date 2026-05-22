"use server";

import { revalidatePath } from "next/cache";
import mockProjectsService from "@/services/mock/projects";
import type { ProjectFilter, ElectProject } from "@/services/mock/projects";

async function getService() {
  const provider = process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "mock";
  if (provider === "supabase") {
    const mod = await import("@/services/supabase/projects");
    return mod.default;
  }
  return mockProjectsService;
}

export async function getProjects(filter?: ProjectFilter): Promise<ElectProject[]> {
  const svc = await getService();
  return svc.getAll(filter);
}

export async function getProjectById(id: string): Promise<ElectProject | null> {
  const svc = await getService();
  return svc.getById(id);
}

export async function saveProject(
  formData: FormData
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const svc = await getService();
    const data: Partial<ElectProject> = {
      id: (formData.get("id") as string) || undefined,
      landlordName: formData.get("landlordName") as string,
      landlordNaCode: formData.get("landlordNaCode") as string,
      landlordPhoneNumber: formData.get("landlordPhoneNumber") as string,
      companyName: (formData.get("companyName") as string) || undefined,
      licenseNumber: (formData.get("licenseNumber") as string) || undefined,
      buildingType: Number(formData.get("buildingType") ?? 0),
      numberOfFloor: Number(formData.get("numberOfFloor") ?? 1),
      isEarthSystem: formData.get("isEarthSystem") === "true",
      panelNeed: formData.get("panelNeed") === "true",
      isErtTest: formData.get("isErtTest") === "true",
      isBuildingInspection: formData.get("isBuildingInspection") === "true",
      isTestAndDelivery: formData.get("isTestAndDelivery") === "true",
      isBigProject: formData.get("isBigProject") === "true",
      hasSupervision: formData.get("hasSupervision") === "true",
      hasRelatedPermit: formData.get("hasRelatedPermit") === "true",
      needElectNetwork: formData.get("needElectNetwork") === "true",
      isNeedEb: formData.get("isNeedEb") === "true",
      provinceId: Number(formData.get("provinceId") ?? 10),
      cityId: formData.get("cityId") ? Number(formData.get("cityId")) : undefined,
      sectionId: formData.get("sectionId") ? Number(formData.get("sectionId")) : undefined,
      address: (formData.get("address") as string) || undefined,
      postalCode: (formData.get("postalCode") as string) || undefined,
      lat: formData.get("lat") ? Number(formData.get("lat")) : undefined,
      lng: formData.get("lng") ? Number(formData.get("lng")) : undefined,
      description: (formData.get("description") as string) || undefined,
      projectTypeRequest: Number(formData.get("projectTypeRequest") ?? 0),
    };

    const result = await svc.upsert(data);
    revalidatePath("/admin/projects");
    return { ok: true, id: result.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    return { ok: false, error: message };
  }
}

export async function submitProject(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const svc = await getService();
    await svc.submit(id);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    return { ok: false, error: message };
  }
}

export async function stopProject(
  id: string,
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const svc = await getService();
    await svc.stop(id, reason);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    return { ok: false, error: message };
  }
}

export async function deleteProject(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const svc = await getService();
    await svc.delete(id);
    revalidatePath("/admin/projects");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    return { ok: false, error: message };
  }
}

export async function uploadProjectFile(
  projectId: string,
  file: File,
  fileType: number
): Promise<{ ok: boolean; path?: string; error?: string }> {
  try {
    const provider = process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "mock";
    if (provider !== "supabase") {
      // mock: just return a fake path
      return { ok: true, path: `project-files/${projectId}/${fileType}-${file.name}` };
    }

    const { createAdminClient } = await import("@/lib/supabase-server");
    const supabase = await createAdminClient();
    const path = `project-files/${projectId}/${fileType}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("project-files").upload(path, file);
    if (error) throw error;
    return { ok: true, path };
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    return { ok: false, error: message };
  }
}
