import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export const supabaseSettingsService = {
  async getAll(): Promise<Record<string, string>> {
    const client = getClient();
    const { data, error } = await client.from("site_settings").select("key, value");
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  },

  async get(key: string): Promise<string | null> {
    const client = getClient();
    const { data, error } = await client
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single();
    if (error) return null;
    return data.value;
  },

  async setMany(values: Record<string, string>): Promise<void> {
    const client = getClient();
    const rows = Object.entries(values).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await client
      .from("site_settings")
      .upsert(rows, { onConflict: "key" });
    if (error) throw error;
  },
};

export default supabaseSettingsService;
