import { createClient } from "@supabase/supabase-js";
import type {
  Transaction,
  Invoice,
  EngPaymentTask,
  EngPaymentList,
  AccountingFilter,
  AccountingService,
} from "@/services/mock/accounting";

function getClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// ─── Row Mappers ────────────────────────────────────────────────────────────

function rowToTransaction(r: Record<string, unknown>): Transaction {
  return {
    id: r.id as string,
    clientId: r.client_id as string,
    userId: r.user_id as string | undefined,
    electProjectId: r.elect_project_id as string | undefined,
    amount: Number(r.amount),
    gatewayType: r.gateway_type as number,
    transactionType: r.transaction_type as number,
    status: r.status as number,
    bankTransactionId: r.bank_transaction_id as string | undefined,
    description: r.description as string | undefined,
    solarCreated: r.solar_created as string | undefined,
    createdAt: r.created_at as string,
  };
}

function rowToInvoice(r: Record<string, unknown>): Invoice {
  return {
    id: r.id as string,
    clientId: r.client_id as string,
    electProjectId: r.elect_project_id as string | undefined,
    eppId: r.epp_id as string | undefined,
    transactionId: r.transaction_id as string | undefined,
    amount: Number(r.amount),
    amountSupervision: Number(r.amount_supervision),
    invoiceStatus: r.invoice_status as number,
    invoicePayType: r.invoice_pay_type as number,
    solarCreated: r.solar_created as string | undefined,
    createdAt: r.created_at as string,
  };
}

function rowToEngPaymentTask(r: Record<string, unknown>): EngPaymentTask {
  return {
    id: r.id as string,
    clientId: r.client_id as string,
    description: r.description as string | undefined,
    isApproved: r.is_approved as boolean,
    createdAt: r.created_at as string,
  };
}

function rowToEngPaymentList(r: Record<string, unknown>): EngPaymentList {
  return {
    id: r.id as string,
    clientId: r.client_id as string,
    engineerId: r.engineer_id as string,
    engPaymentTaskId: r.eng_payment_task_id as string | undefined,
    transactionId: r.transaction_id as string | undefined,
    amountSystem: Number(r.amount_system),
    deduction1: Number(r.deduction_1),
    deduction2: Number(r.deduction_2),
    deduction3: Number(r.deduction_3),
    deduction4: Number(r.deduction_4),
    addition1: Number(r.addition_1),
    addition2: Number(r.addition_2),
    sumAmountSystem: Number(r.sum_amount_system),
    sumAmountWithFish: Number(r.sum_amount_with_fish),
    bankAccountNumber: r.bank_account_number as string | undefined,
    payByBankReceipt: r.pay_by_bank_receipt as string | undefined,
    isApproved: r.is_approved as boolean,
    createdAt: r.created_at as string,
  };
}

// ─── Supabase Implementation ─────────────────────────────────────────────────

export const supabaseAccountingService: AccountingService = {
  async getTransactions(filter?: AccountingFilter): Promise<Transaction[]> {
    const client = getClient();
    let query = client.from("transactions").select("*").order("created_at", { ascending: false });
    if (filter?.status !== undefined) query = query.eq("status", filter.status);
    if (filter?.transactionType !== undefined) query = query.eq("transaction_type", filter.transactionType);
    if (filter?.electProjectId) query = query.eq("elect_project_id", filter.electProjectId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(rowToTransaction);
  },

  async getInvoices(filter?: AccountingFilter): Promise<Invoice[]> {
    const client = getClient();
    let query = client.from("invoices").select("*").order("created_at", { ascending: false });
    if (filter?.status !== undefined) query = query.eq("invoice_status", filter.status);
    if (filter?.electProjectId) query = query.eq("elect_project_id", filter.electProjectId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(rowToInvoice);
  },

  async getEngPaymentTasks(): Promise<EngPaymentTask[]> {
    const client = getClient();
    const { data, error } = await client
      .from("eng_payment_tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToEngPaymentTask);
  },

  async getEngPaymentLists(taskId: string): Promise<EngPaymentList[]> {
    const client = getClient();
    const { data, error } = await client
      .from("eng_payment_lists")
      .select("*")
      .eq("eng_payment_task_id", taskId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToEngPaymentList);
  },

  async addTransaction(data: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
    const client = getClient();
    const { data: row, error } = await client
      .from("transactions")
      .insert({
        client_id: data.clientId,
        user_id: data.userId,
        elect_project_id: data.electProjectId,
        amount: data.amount,
        gateway_type: data.gatewayType,
        transaction_type: data.transactionType,
        status: data.status,
        bank_transaction_id: data.bankTransactionId,
        description: data.description,
        solar_created: data.solarCreated,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return rowToTransaction(row);
  },

  async approveEngPayment(id: string): Promise<void> {
    const client = getClient();
    const { error } = await client
      .from("eng_payment_lists")
      .update({ is_approved: true, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
};

export default supabaseAccountingService;
