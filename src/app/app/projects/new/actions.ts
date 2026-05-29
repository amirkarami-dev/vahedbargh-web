"use server";

import { revalidatePath } from "next/cache";
import supabaseProjectsService from "@/services/supabase/projects";
import type { ElectProject } from "@/services/mock/projects";
import { getClientId, getCurrentUser } from "@/lib/auth";

export async function createProject(
  formData: FormData
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const clientId = await getClientId();
    if (!clientId) {
      return { ok: false, error: "شناسه مجموعه یافت نشد" };
    }
    const user = await getCurrentUser();

    const data: Partial<ElectProject> = {
      clientId,
      userId: user?.id,
      landlordName: formData.get("landlordName") as string,
      landlordNaCode: formData.get("landlordNaCode") as string,
      landlordPhoneNumber: formData.get("landlordPhoneNumber") as string,
      companyName: (formData.get("companyName") as string) || undefined,
      licenseNumber: (formData.get("licenseNumber") as string) || undefined,
      buildingType: Number(formData.get("buildingType") ?? 1),
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
      provinceId: 10,
      cityId: formData.get("cityId") ? Number(formData.get("cityId")) : undefined,
      sectionId: formData.get("sectionId") ? Number(formData.get("sectionId")) : undefined,
      address: (formData.get("address") as string) || undefined,
      postalCode: (formData.get("postalCode") as string) || undefined,
      lat: formData.get("lat") ? Number(formData.get("lat")) : undefined,
      lng: formData.get("lng") ? Number(formData.get("lng")) : undefined,
      projectTypeRequest: Number(formData.get("projectTypeRequest") ?? 0),
      description: (formData.get("description") as string) || undefined,
      projectLevel: 0,
      electProjectStatus: 0,
      isOk: false,
      isStop: false,
      isDelete: false,
      expired: false,
      panelMakerSubmit: false,
      isDefectEng: false,
      solvedDefectEng: false,
    };

    // Validate required fields
    if (!data.landlordName?.trim()) {
      return { ok: false, error: "نام مالک الزامی است" };
    }
    if (!data.landlordNaCode?.trim() || !/^\d{10}$/.test(data.landlordNaCode)) {
      return { ok: false, error: "کد ملی باید ۱۰ رقم عددی باشد" };
    }
    if (!data.landlordPhoneNumber?.trim()) {
      return { ok: false, error: "شماره تماس الزامی است" };
    }
    if (!data.address?.trim()) {
      return { ok: false, error: "آدرس الزامی است" };
    }

    const result = await supabaseProjectsService.upsert(data);
    revalidatePath("/app/projects");
    return { ok: true, id: result.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    return { ok: false, error: message };
  }
}
