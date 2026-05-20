import { createClient } from "@supabase/supabase-js";
import type { StatItem } from "@/types";

function getClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

function rowToStat(row: Record<string, unknown>): StatItem {
  return {
    id: row.id as string,
    label: row.label as string,
    value: row.value as number,
    suffix: (row.suffix as string) ?? "",
    iconName: (row.icon_name as string) ?? "FileCheck",
    sortOrder: (row.sort_order as number) ?? 0,
  };
}

export const supabaseStatsService = {
  async getAll(): Promise<StatItem[]> {
    const client = getClient();
    const { data, error } = await client
      .from("stats")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToStat);
  },

  async getById(id: string): Promise<StatItem | null> {
    const client = getClient();
    const { data, error } = await client
      .from("stats")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return rowToStat(data);
  },

  async create(data: Omit<StatItem, "id">): Promise<StatItem> {
    const client = getClient();
    const { data: row, error } = await client
      .from("stats")
      .insert({
        label: data.label,
        value: data.value,
        suffix: data.suffix,
        icon_name: data.iconName,
        sort_order: data.sortOrder,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return rowToStat(row);
  },

  async update(id: string, data: Partial<Omit<StatItem, "id">>): Promise<StatItem> {
    const client = getClient();
    const { data: row, error } = await client
      .from("stats")
      .update({
        ...(data.label !== undefined && { label: data.label }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.suffix !== undefined && { suffix: data.suffix }),
        ...(data.iconName !== undefined && { icon_name: data.iconName }),
        ...(data.sortOrder !== undefined && { sort_order: data.sortOrder }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return rowToStat(row);
  },

  async delete(id: string): Promise<void> {
    const client = getClient();
    const { error } = await client.from("stats").delete().eq("id", id);
    if (error) throw error;
  },
};

export default supabaseStatsService;
