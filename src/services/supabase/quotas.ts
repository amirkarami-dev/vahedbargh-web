import { createClient } from "@supabase/supabase-js";

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

export interface QuotaFilter {
  isApproved?: boolean;
}

export interface QuotaService {
  getAll(filter?: QuotaFilter): Promise<EngQuotaBurn[]>;
  approve(id: string): Promise<void>;
  updateQuota(id: string, data: Partial<EngQuotaBurn>): Promise<EngQuotaBurn>;
}

function getClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

function rowToQuota(row: Record<string, unknown>): EngQuotaBurn {
  const eng = row.engineers as Record<string, unknown> | undefined;
  const qt = row.quarter_tariffs as Record<string, unknown> | undefined;
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    engineerId: row.engineer_id as string,
    quarterTariffId: row.quarter_tariff_id as string | undefined,
    amountRemaining: Number(row.amount_remaining ?? 0),
    amountBurning: Number(row.amount_burning ?? 0),
    ertCountRemaining: Number(row.ert_count_remaining ?? 0),
    ertCountBurning: Number(row.ert_count_burning ?? 0),
    inspectionDelayFactor: Number(row.inspection_delay_factor ?? 1),
    ertDelayFactor: Number(row.ert_delay_factor ?? 1),
    isApproved: (row.is_approved as boolean) ?? false,
    createdAt: row.created_at as string,
    engineerName: eng
      ? `${eng.first_name ?? ""} ${eng.last_name ?? ""}`.trim() || undefined
      : undefined,
    quarterLabel: qt ? (qt.label as string | undefined) : undefined,
  };
}

export const supabaseQuotaService: QuotaService = {
  async getAll(filter?: QuotaFilter): Promise<EngQuotaBurn[]> {
    const client = getClient();
    let query = client
      .from("eng_quota_burns")
      .select("*, engineers(first_name, last_name), quarter_tariffs(label)");

    if (filter?.isApproved !== undefined) {
      query = query.eq("is_approved", filter.isApproved);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToQuota);
  },

  async approve(id: string): Promise<void> {
    const client = getClient();
    const { error } = await client
      .from("eng_quota_burns")
      .update({ is_approved: true, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async updateQuota(id: string, data: Partial<EngQuotaBurn>): Promise<EngQuotaBurn> {
    const client = getClient();
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (data.amountRemaining !== undefined) updatePayload.amount_remaining = data.amountRemaining;
    if (data.amountBurning !== undefined) updatePayload.amount_burning = data.amountBurning;
    if (data.ertCountRemaining !== undefined) updatePayload.ert_count_remaining = data.ertCountRemaining;
    if (data.ertCountBurning !== undefined) updatePayload.ert_count_burning = data.ertCountBurning;
    if (data.inspectionDelayFactor !== undefined) updatePayload.inspection_delay_factor = data.inspectionDelayFactor;
    if (data.ertDelayFactor !== undefined) updatePayload.ert_delay_factor = data.ertDelayFactor;
    if (data.isApproved !== undefined) updatePayload.is_approved = data.isApproved;

    const { data: row, error } = await client
      .from("eng_quota_burns")
      .update(updatePayload)
      .eq("id", id)
      .select("*, engineers(first_name, last_name), quarter_tariffs(label)")
      .single();
    if (error) throw error;
    return rowToQuota(row);
  },
};

export default supabaseQuotaService;
