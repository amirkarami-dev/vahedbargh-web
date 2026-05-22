import { createClient } from "@supabase/supabase-js";
import type { ElectProject, ProjectFilter, ProjectsService } from "@/services/mock/projects";

function getClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

function rowToProject(row: Record<string, unknown>): ElectProject {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    fileNumber: row.file_number as string | undefined,
    electRequestNumber: row.elect_request_number as string | undefined,
    userId: row.user_id as string | undefined,
    sectionId: row.section_id as number | undefined,
    cityId: row.city_id as number | undefined,
    provinceId: row.province_id as number | undefined,
    address: row.address as string | undefined,
    postalCode: row.postal_code as string | undefined,
    lat: row.lat as number | undefined,
    lng: row.lng as number | undefined,
    landlordName: (row.landlord_name as string) ?? "",
    landlordNaCode: (row.landlord_na_code as string) ?? "",
    landlordPhoneNumber: (row.landlord_phone_number as string) ?? "",
    companyName: row.company_name as string | undefined,
    licenseNumber: row.license_number as string | undefined,
    description: row.description as string | undefined,
    numberOfFloor: (row.number_of_floor as number) ?? 1,
    desNumberOfFloor: row.des_number_of_floor as number | undefined,
    projectCreatedType: (row.project_created_type as number) ?? 0,
    projectTypeRequest: (row.project_type_request as number) ?? 0,
    projectLevel: (row.project_level as number) ?? 0,
    buildingType: (row.building_type as number) ?? 0,
    electProjectStatus: (row.elect_project_status as number) ?? 0,
    isOk: (row.is_ok as boolean) ?? false,
    isStop: (row.is_stop as boolean) ?? false,
    isDelete: (row.is_delete as boolean) ?? false,
    expired: (row.expired as boolean) ?? false,
    panelNeed: (row.panel_need as boolean) ?? false,
    panelMakerSubmit: (row.panel_maker_submit as boolean) ?? false,
    isEarthSystem: (row.is_earth_system as boolean) ?? false,
    isErtTest: (row.is_ert_test as boolean) ?? false,
    isBuildingInspection: (row.is_building_inspection as boolean) ?? false,
    isTestAndDelivery: (row.is_test_and_delivery as boolean) ?? false,
    needElectNetwork: (row.need_elect_network as boolean) ?? false,
    isBigProject: (row.is_big_project as boolean) ?? false,
    hasRelatedPermit: (row.has_related_permit as boolean) ?? false,
    hasSupervision: (row.has_supervision as boolean) ?? false,
    isNeedEb: (row.is_need_eb as boolean) ?? false,
    amountPerArea: row.amount_per_area as number | undefined,
    foundationElectrodeArea: row.foundation_electrode_area as number | undefined,
    areaAsBuilt: row.area_as_built as number | undefined,
    defectDes: row.defect_des as string | undefined,
    isDefectEng: (row.is_defect_eng as boolean) ?? false,
    solvedDefectEng: (row.solved_defect_eng as boolean) ?? false,
    supervisorName: row.supervisor_name as string | undefined,
    supervisorPhoneNumber: row.supervisor_phone_number as string | undefined,
    panelSerialNumber: row.panel_serial_number as string | undefined,
    stopDes: row.stop_des as string | undefined,
    parentProjectId: row.parent_project_id as string | undefined,
    buildingTariffId: row.building_tariff_id as string | undefined,
    ertTariffId: row.ert_tariff_id as string | undefined,
    panelMakerId: row.panel_maker_id as string | undefined,
    solarCreated: row.solar_created as string | undefined,
    julianCreated: row.julian_created as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string | undefined,
  };
}

function projectToRow(data: Partial<ElectProject>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.clientId !== undefined) row.client_id = data.clientId;
  if (data.fileNumber !== undefined) row.file_number = data.fileNumber;
  if (data.electRequestNumber !== undefined) row.elect_request_number = data.electRequestNumber;
  if (data.userId !== undefined) row.user_id = data.userId;
  if (data.sectionId !== undefined) row.section_id = data.sectionId;
  if (data.cityId !== undefined) row.city_id = data.cityId;
  if (data.provinceId !== undefined) row.province_id = data.provinceId;
  if (data.address !== undefined) row.address = data.address;
  if (data.postalCode !== undefined) row.postal_code = data.postalCode;
  if (data.lat !== undefined) row.lat = data.lat;
  if (data.lng !== undefined) row.lng = data.lng;
  if (data.landlordName !== undefined) row.landlord_name = data.landlordName;
  if (data.landlordNaCode !== undefined) row.landlord_na_code = data.landlordNaCode;
  if (data.landlordPhoneNumber !== undefined) row.landlord_phone_number = data.landlordPhoneNumber;
  if (data.companyName !== undefined) row.company_name = data.companyName;
  if (data.licenseNumber !== undefined) row.license_number = data.licenseNumber;
  if (data.description !== undefined) row.description = data.description;
  if (data.numberOfFloor !== undefined) row.number_of_floor = data.numberOfFloor;
  if (data.desNumberOfFloor !== undefined) row.des_number_of_floor = data.desNumberOfFloor;
  if (data.projectCreatedType !== undefined) row.project_created_type = data.projectCreatedType;
  if (data.projectTypeRequest !== undefined) row.project_type_request = data.projectTypeRequest;
  if (data.projectLevel !== undefined) row.project_level = data.projectLevel;
  if (data.buildingType !== undefined) row.building_type = data.buildingType;
  if (data.electProjectStatus !== undefined) row.elect_project_status = data.electProjectStatus;
  if (data.isOk !== undefined) row.is_ok = data.isOk;
  if (data.isStop !== undefined) row.is_stop = data.isStop;
  if (data.isDelete !== undefined) row.is_delete = data.isDelete;
  if (data.expired !== undefined) row.expired = data.expired;
  if (data.panelNeed !== undefined) row.panel_need = data.panelNeed;
  if (data.panelMakerSubmit !== undefined) row.panel_maker_submit = data.panelMakerSubmit;
  if (data.isEarthSystem !== undefined) row.is_earth_system = data.isEarthSystem;
  if (data.isErtTest !== undefined) row.is_ert_test = data.isErtTest;
  if (data.isBuildingInspection !== undefined) row.is_building_inspection = data.isBuildingInspection;
  if (data.isTestAndDelivery !== undefined) row.is_test_and_delivery = data.isTestAndDelivery;
  if (data.needElectNetwork !== undefined) row.need_elect_network = data.needElectNetwork;
  if (data.isBigProject !== undefined) row.is_big_project = data.isBigProject;
  if (data.hasRelatedPermit !== undefined) row.has_related_permit = data.hasRelatedPermit;
  if (data.hasSupervision !== undefined) row.has_supervision = data.hasSupervision;
  if (data.isNeedEb !== undefined) row.is_need_eb = data.isNeedEb;
  if (data.amountPerArea !== undefined) row.amount_per_area = data.amountPerArea;
  if (data.foundationElectrodeArea !== undefined) row.foundation_electrode_area = data.foundationElectrodeArea;
  if (data.areaAsBuilt !== undefined) row.area_as_built = data.areaAsBuilt;
  if (data.defectDes !== undefined) row.defect_des = data.defectDes;
  if (data.isDefectEng !== undefined) row.is_defect_eng = data.isDefectEng;
  if (data.solvedDefectEng !== undefined) row.solved_defect_eng = data.solvedDefectEng;
  if (data.supervisorName !== undefined) row.supervisor_name = data.supervisorName;
  if (data.supervisorPhoneNumber !== undefined) row.supervisor_phone_number = data.supervisorPhoneNumber;
  if (data.panelSerialNumber !== undefined) row.panel_serial_number = data.panelSerialNumber;
  if (data.stopDes !== undefined) row.stop_des = data.stopDes;
  if (data.parentProjectId !== undefined) row.parent_project_id = data.parentProjectId;
  if (data.buildingTariffId !== undefined) row.building_tariff_id = data.buildingTariffId;
  if (data.ertTariffId !== undefined) row.ert_tariff_id = data.ertTariffId;
  if (data.panelMakerId !== undefined) row.panel_maker_id = data.panelMakerId;
  if (data.solarCreated !== undefined) row.solar_created = data.solarCreated;
  if (data.julianCreated !== undefined) row.julian_created = data.julianCreated;
  row.updated_at = new Date().toISOString();
  return row;
}

export const supabaseProjectsService: ProjectsService = {
  async getAll(filter?: ProjectFilter): Promise<ElectProject[]> {
    const client = getClient();
    let query = client
      .from("elect_projects")
      .select("*, sections(section_name)")
      .eq("is_delete", false)
      .order("created_at", { ascending: false });

    if (filter?.status !== undefined) {
      query = query.eq("elect_project_status", filter.status);
    }
    if (filter?.level !== undefined) {
      query = query.eq("project_level", filter.level);
    }
    if (filter?.sectionId !== undefined) {
      query = query.eq("section_id", filter.sectionId);
    }
    if (filter?.search) {
      query = query.or(
        `file_number.ilike.%${filter.search}%,landlord_name.ilike.%${filter.search}%,elect_request_number.ilike.%${filter.search}%`
      );
    }

    const page = filter?.page ?? 1;
    const pageSize = filter?.pageSize ?? 20;
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => rowToProject(row as Record<string, unknown>));
  },

  async getById(id: string): Promise<ElectProject | null> {
    const client = getClient();
    const { data, error } = await client
      .from("elect_projects")
      .select("*, sections(section_name), elect_project_files(*), elect_project_processes(*)")
      .eq("id", id)
      .eq("is_delete", false)
      .single();
    if (error) return null;
    return rowToProject(data as Record<string, unknown>);
  },

  async upsert(data: Partial<ElectProject>): Promise<ElectProject> {
    const client = getClient();
    const row = projectToRow(data);
    if (data.id) {
      row.id = data.id;
    }
    const { data: result, error } = await client
      .from("elect_projects")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    return rowToProject(result as Record<string, unknown>);
  },

  async delete(id: string): Promise<{ ok: boolean }> {
    const client = getClient();
    const { error } = await client
      .from("elect_projects")
      .update({ is_delete: true, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  },

  async submit(id: string): Promise<{ ok: boolean }> {
    const client = getClient();
    const { error } = await client
      .from("elect_projects")
      .update({
        project_level: 1,
        elect_project_status: 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  },

  async stop(id: string, reason: string): Promise<{ ok: boolean }> {
    const client = getClient();
    const { error } = await client
      .from("elect_projects")
      .update({
        is_stop: true,
        stop_des: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  },
};

export default supabaseProjectsService;
