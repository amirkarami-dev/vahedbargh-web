"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { getUserRoles, hasRole, getClientId, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Transaction, Invoice, EngPaymentList } from "@/services/mock/accounting";

// ─── Auth helpers ──────────────────────────────────────────────────────────────

async function requireAccountingRole() {
  const roles = await getUserRoles();
  if (!hasRole(roles, "Accountant", "Administrator")) {
    redirect("/app");
  }
  return roles;
}

// ─── Data fetching ─────────────────────────────────────────────────────────────

export async function fetchTransactions(filter?: {
  transactionType?: number;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Transaction[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter?.transactionType !== undefined) {
      query = query.eq("transaction_type", filter.transactionType);
    }
    if (filter?.dateFrom) query = query.gte("solar_created", filter.dateFrom);
    if (filter?.dateTo) query = query.lte("solar_created", filter.dateTo);

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map(rowToTransaction);
  } catch {
    return [];
  }
}

export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        elect_projects ( file_number, landlord_name )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(rowToInvoice);
  } catch {
    return [];
  }
}

export interface EngPaymentSummary {
  engineerId: string;
  engineerName: string;
  bankAccount?: string;
  projectCount: number;
  totalOwed: number;
  totalPaid: number;
  balance: number;
  pendingItems: EngPaymentList[];
}

export async function fetchEngPaymentSummaries(): Promise<EngPaymentSummary[]> {
  try {
    const supabase = await createClient();
    const { data: payments, error: payErr } = await supabase
      .from("eng_payment_lists")
      .select(`
        *,
        engineers ( full_name, bank_account_number )
      `)
      .order("created_at", { ascending: false });

    if (payErr) throw payErr;

    const byEngineer = new Map<string, typeof payments>();
    for (const p of payments ?? []) {
      const existing = byEngineer.get(p.engineer_id) ?? [];
      existing.push(p);
      byEngineer.set(p.engineer_id, existing);
    }

    const summaries: EngPaymentSummary[] = [];
    for (const [engId, rows] of byEngineer) {
      const first = rows[0];
      const paid = rows.filter((r) => r.is_approved);
      const pending = rows.filter((r) => !r.is_approved);
      const totalOwed = rows.reduce((s, r) => s + Number(r.sum_amount_system), 0);
      const totalPaid = paid.reduce((s, r) => s + Number(r.sum_amount_system), 0);

      summaries.push({
        engineerId: engId,
        engineerName: first?.engineers?.full_name ?? "مهندس نامشخص",
        bankAccount: first?.engineers?.bank_account_number ?? undefined,
        projectCount: rows.length,
        totalOwed,
        totalPaid,
        balance: totalOwed - totalPaid,
        pendingItems: pending.map(rowToEngPaymentList),
      });
    }

    return summaries;
  } catch {
    return [];
  }
}

export async function fetchSummaryStats(): Promise<{
  monthlyTransactionTotal: number;
  pendingPaymentsCount: number;
  totalInvoiced: number;
  engBalanceTotal: number;
}> {
  try {
    const supabase = await createClient();

    const [txRes, pendingRes, invoiceRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("amount")
        .eq("status", 2),
      supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("invoice_status", 0),
      supabase
        .from("invoices")
        .select("amount"),
    ]);

    const monthlyTransactionTotal = (txRes.data ?? []).reduce(
      (s, r) => s + Number(r.amount),
      0
    );
    const totalInvoiced = (invoiceRes.data ?? []).reduce(
      (s, r) => s + Number(r.amount),
      0
    );

    return {
      monthlyTransactionTotal,
      pendingPaymentsCount: pendingRes.count ?? 0,
      totalInvoiced,
      engBalanceTotal: 0,
    };
  } catch {
    return {
      monthlyTransactionTotal: 0,
      pendingPaymentsCount: 0,
      totalInvoiced: 0,
      engBalanceTotal: 0,
    };
  }
}

// ─── Fetch projects for payment form ──────────────────────────────────────────

export interface ProjectOption {
  id: string;
  fileNumber: string;
  landlordName: string;
}

export async function fetchProjectOptions(): Promise<ProjectOption[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("elect_projects")
      .select("id, file_number, landlord_name")
      .eq("is_delete", false)
      .order("file_number", { ascending: true })
      .limit(200);

    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id as string,
      fileNumber: (r.file_number as string) ?? (r.id as string),
      landlordName: r.landlord_name as string,
    }));
  } catch {
    return [];
  }
}

// ─── Server Actions ───────────────────────────────────────────────────────────

/**
 * Register a manual payment transaction for a project.
 * Accessible to Accountant and Administrator roles.
 */
export async function registerPayment(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAccountingRole();

    const projectId = formData.get("projectId") as string | null;
    const amountStr = formData.get("amount") as string | null;
    const type = formData.get("type") as string | null;
    const jalaliDate = formData.get("jalaliDate") as string | null;
    const description = formData.get("description") as string | null;
    const receiptNumber = formData.get("receiptNumber") as string | null;

    if (!amountStr || !type) {
      return { ok: false, error: "مبلغ و نوع تراکنش الزامی است" };
    }

    const amount = parseFloat(amountStr.replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) {
      return { ok: false, error: "مبلغ معتبر وارد کنید" };
    }

    const transactionTypeMap: Record<string, number> = {
      payment: 0,
      refund: 2,
      fee: 1,
    };
    const transactionType = transactionTypeMap[type] ?? 1;

    const clientId = await getClientId();
    if (!clientId) {
      return { ok: false, error: "شناسه مجموعه یافت نشد" };
    }
    const user = await getCurrentUser();

    // bank_transaction_id is a uuid FK, so a free-text receipt number is folded
    // into the description rather than that column.
    const fullDescription =
      [description, receiptNumber ? `شماره فیش: ${receiptNumber}` : null]
        .filter(Boolean)
        .join(" — ") || null;

    const supabase = await createClient();
    const { error } = await supabase.from("transactions").insert({
      client_id: clientId,
      user_id: user?.id ?? null,
      elect_project_id: projectId || null,
      amount,
      gateway_type: 0,
      transaction_type: transactionType,
      status: 2,
      description: fullDescription,
      solar_created: jalaliDate || null,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;

    revalidatePath("/app/accounting");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "خطای ناشناخته";
    return { ok: false, error: msg };
  }
}

/**
 * Mark all pending payment items for an engineer as approved (paid).
 * Accessible to Accountant and Administrator roles.
 */
export async function markEngineerPayment(
  engineerId: string,
  amount: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    const roles = await getUserRoles();
    if (!hasRole(roles, "Accountant", "Administrator")) {
      return { ok: false, error: "دسترسی مجاز نیست" };
    }

    if (!engineerId || amount <= 0) {
      return { ok: false, error: "اطلاعات ناقص است" };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("eng_payment_lists")
      .update({
        is_approved: true,
        updated_at: new Date().toISOString(),
      })
      .eq("engineer_id", engineerId)
      .eq("is_approved", false);

    if (error) throw error;

    revalidatePath("/app/accounting");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "خطای ناشناخته";
    return { ok: false, error: msg };
  }
}

// ─── Row mappers ───────────────────────────────────────────────────────────────

function rowToTransaction(r: Record<string, unknown>): Transaction {
  return {
    id: r.id as string,
    clientId: (r.client_id as string) ?? "",
    userId: r.user_id as string | undefined,
    electProjectId: r.elect_project_id as string | undefined,
    amount: Number(r.amount),
    gatewayType: Number(r.gateway_type ?? 0),
    transactionType: Number(r.transaction_type ?? 1),
    status: Number(r.status ?? 2),
    bankTransactionId: r.bank_transaction_id as string | undefined,
    description: r.description as string | undefined,
    solarCreated: r.solar_created as string | undefined,
    createdAt: r.created_at as string,
  };
}

function rowToInvoice(r: Record<string, unknown>): Invoice {
  return {
    id: r.id as string,
    clientId: (r.client_id as string) ?? "",
    electProjectId: r.elect_project_id as string | undefined,
    eppId: r.epp_id as string | undefined,
    transactionId: r.transaction_id as string | undefined,
    amount: Number(r.amount),
    amountSupervision: Number(r.amount_supervision ?? 0),
    invoiceStatus: Number(r.invoice_status ?? 0),
    invoicePayType: Number(r.invoice_pay_type ?? 0),
    solarCreated: r.solar_created as string | undefined,
    createdAt: r.created_at as string,
  };
}

function rowToEngPaymentList(r: Record<string, unknown>): EngPaymentList {
  return {
    id: r.id as string,
    clientId: (r.client_id as string) ?? "",
    engineerId: r.engineer_id as string,
    engPaymentTaskId: r.eng_payment_task_id as string | undefined,
    transactionId: r.transaction_id as string | undefined,
    amountSystem: Number(r.amount_system ?? 0),
    deduction1: Number(r.deduction_1 ?? 0),
    deduction2: Number(r.deduction_2 ?? 0),
    deduction3: Number(r.deduction_3 ?? 0),
    deduction4: Number(r.deduction_4 ?? 0),
    addition1: Number(r.addition_1 ?? 0),
    addition2: Number(r.addition_2 ?? 0),
    sumAmountSystem: Number(r.sum_amount_system ?? 0),
    sumAmountWithFish: Number(r.sum_amount_with_fish ?? 0),
    bankAccountNumber: r.bank_account_number as string | undefined,
    payByBankReceipt: r.pay_by_bank_receipt as string | undefined,
    isApproved: Boolean(r.is_approved),
    createdAt: r.created_at as string,
  };
}
