"use server";

import mockAccountingService from "@/services/mock/accounting";
import type { Transaction, Invoice, EngPaymentTask, EngPaymentList, AccountingFilter } from "@/services/mock/accounting";

const USE_MOCK = process.env.USE_MOCK_DATA === "true" || !process.env.NEXT_PUBLIC_SUPABASE_URL;

async function getService() {
  if (USE_MOCK) return mockAccountingService;
  const { supabaseAccountingService } = await import("@/services/supabase/accounting");
  return supabaseAccountingService;
}

export async function getTransactions(filter?: AccountingFilter): Promise<Transaction[]> {
  const svc = await getService();
  return svc.getTransactions(filter);
}

export async function getInvoices(filter?: AccountingFilter): Promise<Invoice[]> {
  const svc = await getService();
  return svc.getInvoices(filter);
}

export async function getEngPaymentTasks(): Promise<EngPaymentTask[]> {
  const svc = await getService();
  return svc.getEngPaymentTasks();
}

export async function getEngPaymentLists(taskId: string): Promise<EngPaymentList[]> {
  const svc = await getService();
  return svc.getEngPaymentLists(taskId);
}

export async function addManualPayment(
  projectId: string,
  amount: number,
  description: string
): Promise<{ ok: boolean }> {
  try {
    const svc = await getService();
    const CLIENT_ID = process.env.DEFAULT_CLIENT_ID ?? "00000000-0000-0000-0000-000000000001";
    await svc.addTransaction({
      clientId: CLIENT_ID,
      electProjectId: projectId || undefined,
      amount: amount * 10, // Toman → Rial
      gatewayType: 0, // Manual
      transactionType: 1,
      status: 2, // Confirmed
      description,
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function approveEngPaymentList(id: string): Promise<{ ok: boolean }> {
  try {
    const svc = await getService();
    await svc.approveEngPayment(id);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
