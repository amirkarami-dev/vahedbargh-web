"use server";

import mockTariffService from "@/services/mock/tariffs";
import type { QuarterTariff, BuildingTariff } from "@/services/mock/tariffs";

const USE_MOCK = process.env.USE_MOCK_DATA === "true" || !process.env.NEXT_PUBLIC_SUPABASE_URL;

async function getService() {
  if (USE_MOCK) return mockTariffService;
  const { supabaseTariffService } = await import("@/services/supabase/tariffs");
  return supabaseTariffService;
}

export async function getQuarterTariffs(): Promise<QuarterTariff[]> {
  const svc = await getService();
  return svc.getQuarterTariffs();
}

export async function getBuildingTariffs(): Promise<BuildingTariff[]> {
  const svc = await getService();
  return svc.getBuildingTariffs();
}

export async function saveQuarterTariff(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const svc = await getService();
    const CLIENT_ID = process.env.DEFAULT_CLIENT_ID ?? "00000000-0000-0000-0000-000000000001";
    const id = (formData.get("id") as string) || undefined;

    await svc.upsertQuarterTariff({
      id,
      clientId: CLIENT_ID,
      quarterType: Number(formData.get("quarterType")),
      year: Number(formData.get("year")),
      fee: Number(formData.get("fee")) * 10, // Toman → Rial
      ertFee: Number(formData.get("ertFee")) * 10,
      testAndDeliveryFee: Number(formData.get("testAndDeliveryFee")) * 10,
      countErt: Number(formData.get("countErt") ?? 0),
      countTestDelivery: Number(formData.get("countTestDelivery") ?? 0),
      isQuota: formData.get("isQuota") === "true",
      period: (formData.get("period") as string) || undefined,
      percentIncrease: Number(formData.get("percentIncrease") ?? 0),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function saveBuildingTariff(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const svc = await getService();
    const CLIENT_ID = process.env.DEFAULT_CLIENT_ID ?? "00000000-0000-0000-0000-000000000001";
    const id = (formData.get("id") as string) || undefined;

    await svc.upsertBuildingTariff({
      id,
      clientId: CLIENT_ID,
      buildingGroupType: Number(formData.get("buildingGroupType")),
      buildingGroupParam: Number(formData.get("buildingGroupParam") ?? 0),
      tariff: Number(formData.get("tariff")) * 10,
      minTariff: Number(formData.get("minTariff")) * 10,
      factor: Number(formData.get("factor") ?? 1),
      testDeliveryFactor: Number(formData.get("testDeliveryFactor") ?? 1),
      supervisionTariff: Number(formData.get("supervisionTariff") ?? 0) * 10,
      supervisionMinTariff: Number(formData.get("supervisionMinTariff") ?? 0) * 10,
      supervisionFactor: Number(formData.get("supervisionFactor") ?? 1),
      solarYear: (formData.get("solarYear") as string) || undefined,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function deleteQuarterTariff(id: string): Promise<{ ok: boolean }> {
  try {
    const svc = await getService();
    await svc.deleteQuarterTariff(id);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function deleteBuildingTariff(id: string): Promise<{ ok: boolean }> {
  try {
    const svc = await getService();
    await svc.deleteBuildingTariff(id);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
