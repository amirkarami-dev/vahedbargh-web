// ---- Inline types ----
export interface ElectProject {
  id: string;
  clientId: string;
  fileNumber?: string;
  electRequestNumber?: string;
  userId?: string;
  sectionId?: number;
  cityId?: number;
  provinceId?: number;
  address?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  landlordName: string;
  landlordNaCode: string;
  landlordPhoneNumber: string;
  companyName?: string;
  licenseNumber?: string;
  description?: string;
  numberOfFloor: number;
  desNumberOfFloor?: number;
  projectCreatedType: number;
  projectTypeRequest: number;
  projectLevel: number;
  buildingType: number;
  electProjectStatus: number;
  isOk: boolean;
  isStop: boolean;
  isDelete: boolean;
  expired: boolean;
  panelNeed: boolean;
  panelMakerSubmit: boolean;
  isEarthSystem: boolean;
  isErtTest: boolean;
  isBuildingInspection: boolean;
  isTestAndDelivery: boolean;
  needElectNetwork: boolean;
  isBigProject: boolean;
  hasRelatedPermit: boolean;
  hasSupervision: boolean;
  isNeedEb: boolean;
  amountPerArea?: number;
  foundationElectrodeArea?: number;
  areaAsBuilt?: number;
  defectDes?: string;
  isDefectEng: boolean;
  solvedDefectEng: boolean;
  supervisorName?: string;
  supervisorPhoneNumber?: string;
  panelSerialNumber?: string;
  stopDes?: string;
  parentProjectId?: string;
  buildingTariffId?: string;
  ertTariffId?: string;
  panelMakerId?: string;
  solarCreated?: string;
  julianCreated?: string;
  createdAt: string;
  updatedAt?: string;
}

export const ProjectLevelLabel: Record<number, string> = {
  0: "ثبت شده",
  1: "در انتظار بررسی",
  2: "کارشناسی",
  3: "نقشه",
  4: "تست",
  5: "ارت",
  6: "تابلو",
  7: "بازرسی",
  8: "تحویل",
  9: "تکمیل شده",
};

export const PROJECT_LEVEL_COLORS: Record<number, string> = {
  0: "bg-gray-500",
  1: "bg-yellow-500",
  2: "bg-blue-500",
  3: "bg-purple-500",
  4: "bg-orange-500",
  5: "bg-teal-500",
  6: "bg-indigo-500",
  7: "bg-pink-500",
  8: "bg-green-500",
  9: "bg-emerald-600",
};

export const BuildingTypeLabel: Record<number, string> = {
  0: "نامشخص",
  1: "مسکونی",
  2: "تجاری",
  3: "اداری",
  4: "صنعتی",
  5: "عمومی",
};

// ---- Service interface ----
export interface ProjectFilter {
  search?: string;
  status?: number;
  level?: number;
  sectionId?: number;
  page?: number;
  pageSize?: number;
}

export interface ProjectsService {
  getAll(filter?: ProjectFilter): Promise<ElectProject[]>;
  getById(id: string): Promise<ElectProject | null>;
  upsert(data: Partial<ElectProject>): Promise<ElectProject>;
  delete(id: string): Promise<{ ok: boolean }>;
  submit(id: string): Promise<{ ok: boolean }>;
  stop(id: string, reason: string): Promise<{ ok: boolean }>;
}

// ---- Mock data ----
const MOCK_CLIENT_ID = "00000000-0000-0000-0000-000000000001";

const store: ElectProject[] = [
  {
    id: "proj-001",
    clientId: MOCK_CLIENT_ID,
    fileNumber: "1402/ک/0034",
    electRequestNumber: "REQ-1402-034",
    sectionId: 1001,
    cityId: 101,
    provinceId: 10,
    address: "سنندج، خیابان فردوسی، کوچه شماره ۳، پلاک ۱۲",
    postalCode: "6617634521",
    lat: 35.3219,
    lng: 46.9987,
    landlordName: "کاوه رشیدی",
    landlordNaCode: "3860412378",
    landlordPhoneNumber: "09181238765",
    description: "ساختمان مسکونی ۴ طبقه با زیرزمین",
    numberOfFloor: 4,
    desNumberOfFloor: 4,
    projectCreatedType: 0,
    projectTypeRequest: 0,
    projectLevel: 2,
    buildingType: 1,
    electProjectStatus: 1,
    isOk: false,
    isStop: false,
    isDelete: false,
    expired: false,
    panelNeed: true,
    panelMakerSubmit: false,
    isEarthSystem: true,
    isErtTest: true,
    isBuildingInspection: true,
    isTestAndDelivery: true,
    needElectNetwork: false,
    isBigProject: false,
    hasRelatedPermit: true,
    hasSupervision: false,
    isNeedEb: false,
    isDefectEng: false,
    solvedDefectEng: false,
    solarCreated: "1402/09/15",
    createdAt: "2023-12-06T09:30:00Z",
  },
  {
    id: "proj-002",
    clientId: MOCK_CLIENT_ID,
    fileNumber: "1402/ک/0051",
    electRequestNumber: "REQ-1402-051",
    sectionId: 1002,
    cityId: 102,
    provinceId: 10,
    address: "مریوان، بلوار آزادی، پلاک ۴۵",
    postalCode: "6671834522",
    lat: 35.5247,
    lng: 46.1778,
    landlordName: "شیرین محمدی",
    landlordNaCode: "3840196234",
    landlordPhoneNumber: "09183456789",
    companyName: "شرکت ساختمانی آذر",
    licenseNumber: "LIC-2023-0789",
    description: "مجتمع تجاری ۲ طبقه",
    numberOfFloor: 2,
    desNumberOfFloor: 2,
    projectCreatedType: 0,
    projectTypeRequest: 1,
    projectLevel: 4,
    buildingType: 2,
    electProjectStatus: 1,
    isOk: false,
    isStop: false,
    isDelete: false,
    expired: false,
    panelNeed: true,
    panelMakerSubmit: false,
    isEarthSystem: true,
    isErtTest: true,
    isBuildingInspection: true,
    isTestAndDelivery: true,
    needElectNetwork: false,
    isBigProject: false,
    hasRelatedPermit: true,
    hasSupervision: false,
    isNeedEb: true,
    isDefectEng: false,
    solvedDefectEng: false,
    solarCreated: "1402/10/20",
    createdAt: "2024-01-10T11:00:00Z",
  },
  {
    id: "proj-003",
    clientId: MOCK_CLIENT_ID,
    fileNumber: "1402/ک/0078",
    electRequestNumber: "REQ-1402-078",
    sectionId: 1003,
    cityId: 103,
    provinceId: 10,
    address: "سقز، خیابان امام خمینی، ساختمان اداری شماره ۷",
    postalCode: "6681256433",
    lat: 36.2491,
    lng: 46.2644,
    landlordName: "هیمن عبداللهی",
    landlordNaCode: "3850723411",
    landlordPhoneNumber: "09187654321",
    description: "ساختمان اداری ۶ طبقه",
    numberOfFloor: 6,
    desNumberOfFloor: 6,
    projectCreatedType: 0,
    projectTypeRequest: 0,
    projectLevel: 7,
    buildingType: 3,
    electProjectStatus: 1,
    isOk: false,
    isStop: false,
    isDelete: false,
    expired: false,
    panelNeed: true,
    panelMakerSubmit: true,
    isEarthSystem: true,
    isErtTest: true,
    isBuildingInspection: true,
    isTestAndDelivery: true,
    needElectNetwork: false,
    isBigProject: true,
    hasRelatedPermit: true,
    hasSupervision: true,
    isNeedEb: false,
    supervisorName: "مهندس فرهاد کریمی",
    supervisorPhoneNumber: "09181112233",
    isDefectEng: false,
    solvedDefectEng: false,
    solarCreated: "1402/07/05",
    createdAt: "2023-09-27T08:15:00Z",
  },
  {
    id: "proj-004",
    clientId: MOCK_CLIENT_ID,
    fileNumber: "1403/ک/0009",
    electRequestNumber: "REQ-1403-009",
    sectionId: 1001,
    cityId: 101,
    provinceId: 10,
    address: "سنندج، بلوار شهید بهشتی، کوی شماره ۲، پلاک ۸",
    postalCode: "6617912345",
    lat: 35.3312,
    lng: 47.0045,
    landlordName: "ژیلا رستمی",
    landlordNaCode: "3870135622",
    landlordPhoneNumber: "09186661234",
    description: "واحد مسکونی ۳ طبقه + همکف",
    numberOfFloor: 3,
    desNumberOfFloor: 3,
    projectCreatedType: 0,
    projectTypeRequest: 0,
    projectLevel: 0,
    buildingType: 1,
    electProjectStatus: 0,
    isOk: false,
    isStop: false,
    isDelete: false,
    expired: false,
    panelNeed: false,
    panelMakerSubmit: false,
    isEarthSystem: false,
    isErtTest: false,
    isBuildingInspection: true,
    isTestAndDelivery: false,
    needElectNetwork: false,
    isBigProject: false,
    hasRelatedPermit: false,
    hasSupervision: false,
    isNeedEb: false,
    isDefectEng: false,
    solvedDefectEng: false,
    solarCreated: "1403/01/12",
    createdAt: "2024-04-01T14:20:00Z",
  },
  {
    id: "proj-005",
    clientId: MOCK_CLIENT_ID,
    fileNumber: "1402/ک/0095",
    electRequestNumber: "REQ-1402-095",
    sectionId: 1004,
    cityId: 104,
    provinceId: 10,
    address: "بانه، خیابان ولیعصر، کارخانه تولیدی پلاک ۲",
    postalCode: "6691834566",
    lat: 36.0059,
    lng: 45.8844,
    landlordName: "برهان صالحی",
    landlordNaCode: "3820645899",
    landlordPhoneNumber: "09184449876",
    companyName: "کارخانه تولیدی پارسیان",
    licenseNumber: "IND-LIC-2022-0045",
    description: "سالن صنعتی ۱ طبقه با انبار",
    numberOfFloor: 1,
    desNumberOfFloor: 1,
    projectCreatedType: 0,
    projectTypeRequest: 2,
    projectLevel: 9,
    buildingType: 4,
    electProjectStatus: 2,
    isOk: true,
    isStop: false,
    isDelete: false,
    expired: false,
    panelNeed: true,
    panelMakerSubmit: true,
    isEarthSystem: true,
    isErtTest: true,
    isBuildingInspection: true,
    isTestAndDelivery: true,
    needElectNetwork: true,
    isBigProject: false,
    hasRelatedPermit: true,
    hasSupervision: true,
    isNeedEb: false,
    supervisorName: "مهندس آوات احمدی",
    supervisorPhoneNumber: "09183335566",
    panelSerialNumber: "SN-2023-98765",
    isDefectEng: false,
    solvedDefectEng: false,
    solarCreated: "1402/05/22",
    createdAt: "2023-08-13T10:00:00Z",
    updatedAt: "2024-02-20T16:30:00Z",
  },
];

// ---- Mock service ----
export const mockProjectsService: ProjectsService = {
  async getAll(filter?: ProjectFilter): Promise<ElectProject[]> {
    let result = store.filter((p) => !p.isDelete);

    if (filter?.search) {
      const s = filter.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.fileNumber?.toLowerCase().includes(s) ||
          p.landlordName.toLowerCase().includes(s) ||
          p.electRequestNumber?.toLowerCase().includes(s)
      );
    }
    if (filter?.status !== undefined) {
      result = result.filter((p) => p.electProjectStatus === filter.status);
    }
    if (filter?.level !== undefined) {
      result = result.filter((p) => p.projectLevel === filter.level);
    }
    if (filter?.sectionId !== undefined) {
      result = result.filter((p) => p.sectionId === filter.sectionId);
    }

    const page = filter?.page ?? 1;
    const pageSize = filter?.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    return result.slice(start, start + pageSize);
  },

  async getById(id: string): Promise<ElectProject | null> {
    return store.find((p) => p.id === id && !p.isDelete) ?? null;
  },

  async upsert(data: Partial<ElectProject>): Promise<ElectProject> {
    if (data.id) {
      const idx = store.findIndex((p) => p.id === data.id);
      if (idx !== -1) {
        store[idx] = { ...store[idx], ...data, updatedAt: new Date().toISOString() };
        return store[idx];
      }
    }
    const newProject: ElectProject = {
      clientId: MOCK_CLIENT_ID,
      landlordName: "",
      landlordNaCode: "",
      landlordPhoneNumber: "",
      numberOfFloor: 1,
      projectCreatedType: 0,
      projectTypeRequest: 0,
      projectLevel: 0,
      buildingType: 0,
      electProjectStatus: 0,
      isOk: false,
      isStop: false,
      isDelete: false,
      expired: false,
      panelNeed: false,
      panelMakerSubmit: false,
      isEarthSystem: false,
      isErtTest: false,
      isBuildingInspection: false,
      isTestAndDelivery: false,
      needElectNetwork: false,
      isBigProject: false,
      hasRelatedPermit: false,
      hasSupervision: false,
      isNeedEb: false,
      isDefectEng: false,
      solvedDefectEng: false,
      createdAt: new Date().toISOString(),
      ...data,
      id: `proj-${Date.now()}`,
    };
    store.push(newProject);
    return newProject;
  },

  async delete(id: string): Promise<{ ok: boolean }> {
    const idx = store.findIndex((p) => p.id === id);
    if (idx !== -1) {
      store[idx] = { ...store[idx], isDelete: true, updatedAt: new Date().toISOString() };
    }
    return { ok: true };
  },

  async submit(id: string): Promise<{ ok: boolean }> {
    const idx = store.findIndex((p) => p.id === id);
    if (idx !== -1) {
      store[idx] = {
        ...store[idx],
        projectLevel: 1,
        electProjectStatus: 1,
        updatedAt: new Date().toISOString(),
      };
    }
    return { ok: true };
  },

  async stop(id: string, reason: string): Promise<{ ok: boolean }> {
    const idx = store.findIndex((p) => p.id === id);
    if (idx !== -1) {
      store[idx] = {
        ...store[idx],
        isStop: true,
        stopDes: reason,
        updatedAt: new Date().toISOString(),
      };
    }
    return { ok: true };
  },
};

export default mockProjectsService;
