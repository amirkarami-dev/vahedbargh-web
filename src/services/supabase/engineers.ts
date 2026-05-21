import { createClient } from "@/lib/supabase-server";

export interface Engineer {
  id: string;
  clientId: string;
  userId?: string;
  fullName: string;
  naCode?: string;
  cellPhone?: string;
  email?: string;
  dadName?: string;
  tell?: string;
  address?: string;
  sectionId?: number;
  fieldType: number;
  educationType: number;
  bankAccountNumber?: string;
  defaultQuota: number;
  certOfTest: boolean;
  certOfEarth: boolean;
  certOfFiber: boolean;
  certOfInspection: boolean;
  inactive: boolean;
  bankAccountBlocked: boolean;
  has1Percent: boolean;
  hasQuarterIncrease: boolean;
  sortIndex: number;
  isDelete: boolean;
  solarBirthDate?: string;
  solarMembershipDate?: string;
  createdAt: string;
  // joined
  sectionName?: string;
}

export interface EngineerHistory {
  id: string;
  engineerId: string;
  description: string;
  createdAt: string;
}

export interface EngineerService {
  getAll(filter?: { search?: string; sectionId?: number; inactive?: boolean }): Promise<Engineer[]>;
  getById(id: string): Promise<Engineer | null>;
  upsert(data: Partial<Engineer>): Promise<Engineer>;
  delete(id: string): Promise<void>;
  getHistory(engineerId: string): Promise<EngineerHistory[]>;
  addHistory(engineerId: string, description: string): Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEngineer(row: Record<string, any>): Engineer {
  return {
    id: row.id,
    clientId: row.client_id,
    userId: row.user_id ?? undefined,
    fullName: row.full_name,
    naCode: row.na_code ?? undefined,
    cellPhone: row.cell_phone ?? undefined,
    email: row.email ?? undefined,
    dadName: row.dad_name ?? undefined,
    tell: row.tell ?? undefined,
    address: row.address ?? undefined,
    sectionId: row.section_id ?? undefined,
    fieldType: row.field_type ?? 0,
    educationType: row.education_type ?? 0,
    bankAccountNumber: row.bank_account_number ?? undefined,
    defaultQuota: Number(row.default_quota ?? 0),
    certOfTest: row.cert_of_test ?? false,
    certOfEarth: row.cert_of_earth ?? false,
    certOfFiber: row.cert_of_fiber ?? false,
    certOfInspection: row.cert_of_inspection ?? false,
    inactive: row.inactive ?? false,
    bankAccountBlocked: row.bank_account_blocked ?? false,
    has1Percent: row.has_1_percent ?? false,
    hasQuarterIncrease: row.has_quarter_increase ?? false,
    sortIndex: row.sort_index ?? 0,
    isDelete: row.is_delete ?? false,
    solarBirthDate: row.solar_birth_date ?? undefined,
    solarMembershipDate: row.solar_membership_date ?? undefined,
    createdAt: row.created_at,
    sectionName: row.sections?.section_name ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToHistory(row: Record<string, any>): EngineerHistory {
  return {
    id: row.id,
    engineerId: row.engineer_id,
    description: row.description ?? "",
    createdAt: row.created_at,
  };
}

function toSnakeCase(data: Partial<Engineer>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (data.id !== undefined) out.id = data.id;
  if (data.clientId !== undefined) out.client_id = data.clientId;
  if (data.userId !== undefined) out.user_id = data.userId;
  if (data.fullName !== undefined) out.full_name = data.fullName;
  if (data.naCode !== undefined) out.na_code = data.naCode;
  if (data.cellPhone !== undefined) out.cell_phone = data.cellPhone;
  if (data.email !== undefined) out.email = data.email;
  if (data.dadName !== undefined) out.dad_name = data.dadName;
  if (data.tell !== undefined) out.tell = data.tell;
  if (data.address !== undefined) out.address = data.address;
  if (data.sectionId !== undefined) out.section_id = data.sectionId;
  if (data.fieldType !== undefined) out.field_type = data.fieldType;
  if (data.educationType !== undefined) out.education_type = data.educationType;
  if (data.bankAccountNumber !== undefined) out.bank_account_number = data.bankAccountNumber;
  if (data.defaultQuota !== undefined) out.default_quota = data.defaultQuota;
  if (data.certOfTest !== undefined) out.cert_of_test = data.certOfTest;
  if (data.certOfEarth !== undefined) out.cert_of_earth = data.certOfEarth;
  if (data.certOfFiber !== undefined) out.cert_of_fiber = data.certOfFiber;
  if (data.certOfInspection !== undefined) out.cert_of_inspection = data.certOfInspection;
  if (data.inactive !== undefined) out.inactive = data.inactive;
  if (data.bankAccountBlocked !== undefined) out.bank_account_blocked = data.bankAccountBlocked;
  if (data.has1Percent !== undefined) out.has_1_percent = data.has1Percent;
  if (data.hasQuarterIncrease !== undefined) out.has_quarter_increase = data.hasQuarterIncrease;
  if (data.sortIndex !== undefined) out.sort_index = data.sortIndex;
  if (data.solarBirthDate !== undefined) out.solar_birth_date = data.solarBirthDate;
  if (data.solarMembershipDate !== undefined) out.solar_membership_date = data.solarMembershipDate;
  out.updated_at = new Date().toISOString();
  return out;
}

export const supabaseEngineersService: EngineerService = {
  async getAll(filter) {
    const supabase = await createClient();
    let query = supabase
      .from("engineers")
      .select("*, sections(section_name)")
      .eq("is_delete", false);

    if (filter?.search) {
      query = query.ilike("full_name", `%${filter.search}%`);
    }
    if (filter?.sectionId !== undefined) {
      query = query.eq("section_id", filter.sectionId);
    }
    if (filter?.inactive !== undefined) {
      query = query.eq("inactive", filter.inactive);
    }

    const { data, error } = await query.order("sort_index", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToEngineer);
  },

  async getById(id) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("engineers")
      .select("*, sections(section_name), engineer_histories(*)")
      .eq("id", id)
      .eq("is_delete", false)
      .single();
    if (error) return null;
    return rowToEngineer(data);
  },

  async upsert(data) {
    const supabase = await createClient();
    const payload = toSnakeCase(data);
    const { data: result, error } = await supabase
      .from("engineers")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    return rowToEngineer(result);
  },

  async delete(id) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("engineers")
      .update({ is_delete: true, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async getHistory(engineerId) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("engineer_histories")
      .select("*")
      .eq("engineer_id", engineerId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToHistory);
  },

  async addHistory(engineerId, description) {
    const supabase = await createClient();
    const { error } = await supabase.from("engineer_histories").insert({
      engineer_id: engineerId,
      description,
    });
    if (error) throw error;
  },
};

export default supabaseEngineersService;
