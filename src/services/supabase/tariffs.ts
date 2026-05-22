import { createClient } from "@supabase/supabase-js";
import type {
  QuarterTariff,
  BuildingTariff,
  TariffService,
} from "@/services/mock/tariffs";

function getClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// ─── Row Mappers ────────────────────────────────────────────────────────────

function rowToQuarterTariff(r: Record<string, unknown>): QuarterTariff {
  return {
    id: r.id as string,
    clientId: r.client_id as string,
    quarterType: r.quarter_type as number,
    year: r.year as number,
    fee: Number(r.fee),
    ertFee: Number(r.ert_fee),
    testAndDeliveryFee: Number(r.test_and_delivery_fee),
    countErt: r.count_ert as number,
    countTestDelivery: r.count_test_delivery as number,
    isQuota: r.is_quota as boolean,
    period: r.period as string | undefined,
    percentIncrease: Number(r.percent_increase),
    createdAt: r.created_at as string,
  };
}

function rowToBuildingTariff(r: Record<string, unknown>): BuildingTariff {
  return {
    id: r.id as string,
    clientId: r.client_id as string,
    buildingGroupType: r.building_group_type as number,
    buildingGroupParam: r.building_group_param as number,
    tariff: Number(r.tariff),
    minTariff: Number(r.min_tariff),
    factor: Number(r.factor),
    testDeliveryFactor: Number(r.test_delivery_factor),
    supervisionTariff: Number(r.supervision_tariff),
    supervisionMinTariff: Number(r.supervision_min_tariff),
    supervisionFactor: Number(r.supervision_factor),
    solarYear: r.solar_year as string | undefined,
    createdAt: r.created_at as string,
  };
}

// ─── Supabase Implementation ─────────────────────────────────────────────────

export const supabaseTariffService: TariffService = {
  async getQuarterTariffs(): Promise<QuarterTariff[]> {
    const client = getClient();
    const { data, error } = await client
      .from("quarter_tariffs")
      .select("*")
      .order("year", { ascending: true })
      .order("quarter_type", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToQuarterTariff);
  },

  async getBuildingTariffs(): Promise<BuildingTariff[]> {
    const client = getClient();
    const { data, error } = await client
      .from("building_tariffs")
      .select("*")
      .order("building_group_type", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToBuildingTariff);
  },

  async upsertQuarterTariff(data): Promise<QuarterTariff> {
    const client = getClient();
    const payload: Record<string, unknown> = {
      client_id: data.clientId,
      quarter_type: data.quarterType,
      year: data.year,
      fee: data.fee,
      ert_fee: data.ertFee,
      test_and_delivery_fee: data.testAndDeliveryFee,
      count_ert: data.countErt,
      count_test_delivery: data.countTestDelivery,
      is_quota: data.isQuota,
      period: data.period,
      percent_increase: data.percentIncrease,
      updated_at: new Date().toISOString(),
    };
    if (data.id) payload.id = data.id;

    const { data: row, error } = await client
      .from("quarter_tariffs")
      .upsert(payload)
      .select()
      .single();
    if (error) throw error;
    return rowToQuarterTariff(row);
  },

  async upsertBuildingTariff(data): Promise<BuildingTariff> {
    const client = getClient();
    const payload: Record<string, unknown> = {
      client_id: data.clientId,
      building_group_type: data.buildingGroupType,
      building_group_param: data.buildingGroupParam,
      tariff: data.tariff,
      min_tariff: data.minTariff,
      factor: data.factor,
      test_delivery_factor: data.testDeliveryFactor,
      supervision_tariff: data.supervisionTariff,
      supervision_min_tariff: data.supervisionMinTariff,
      supervision_factor: data.supervisionFactor,
      solar_year: data.solarYear,
      updated_at: new Date().toISOString(),
    };
    if (data.id) payload.id = data.id;

    const { data: row, error } = await client
      .from("building_tariffs")
      .upsert(payload)
      .select()
      .single();
    if (error) throw error;
    return rowToBuildingTariff(row);
  },

  async deleteQuarterTariff(id: string): Promise<void> {
    const client = getClient();
    const { error } = await client.from("quarter_tariffs").delete().eq("id", id);
    if (error) throw error;
  },

  async deleteBuildingTariff(id: string): Promise<void> {
    const client = getClient();
    const { error } = await client.from("building_tariffs").delete().eq("id", id);
    if (error) throw error;
  },
};

export default supabaseTariffService;
