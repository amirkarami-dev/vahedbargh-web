"use server";

import { revalidatePath } from "next/cache";

interface EngQuotaBurn {
  id: string;
  clientId: string;
  engineerId: string;
  quarterTariffId?: string;
  amountRemaining: number;
  amountBurning: number;
  ertCountRemaining: number;
  ertCountBurning: number;
  inspectionDelayFactor: number;
  ertDelayFactor: number;
  isApproved: boolean;
  createdAt: string;
  engineerName?: string;
  quarterLabel?: string;
}

async function getQuotaService() {
  const provider = process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "mock";
  if (provider === "supabase") {
    const mod = await import("@/services/supabase/quotas");
    return mod.default;
  }
  const mod = await import("@/services/mock/quotas");
  return mod.default;
}

export async function getQuotas(filter?: {
  isApproved?: boolean;
}): Promise<EngQuotaBurn[]> {
  const svc = await getQuotaService();
  return svc.getAll(filter);
}

export async function approveQuota(id: string): Promise<void> {
  try {
    const svc = await getQuotaService();
    await svc.approve(id);
    revalidatePath("/admin/quotas");
  } catch {
    // silent — page will simply not reflect change until next load
  }
}
