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

const CLIENT_ID = "00000000-0000-0000-0000-000000000001";

const engineerStore: Engineer[] = [
  {
    id: "eng-001",
    clientId: CLIENT_ID,
    fullName: "سیروان احمدی",
    naCode: "2830145678",
    cellPhone: "09151234567",
    email: "sirwan.ahmadi@example.com",
    dadName: "کریم",
    tell: "08733456789",
    address: "سنندج، خیابان پاسداران، کوچه گلستان",
    sectionId: 1,
    fieldType: 0,
    educationType: 2,
    bankAccountNumber: "IR120570028080010731650001",
    defaultQuota: 10,
    certOfTest: true,
    certOfEarth: true,
    certOfFiber: false,
    certOfInspection: true,
    inactive: false,
    bankAccountBlocked: false,
    has1Percent: true,
    hasQuarterIncrease: false,
    sortIndex: 1,
    isDelete: false,
    solarBirthDate: "1365/04/12",
    solarMembershipDate: "1390/07/01",
    createdAt: "2024-01-10T08:00:00Z",
  },
  {
    id: "eng-002",
    clientId: CLIENT_ID,
    fullName: "ژیلا محمدی",
    naCode: "2841234567",
    cellPhone: "09182345678",
    email: "zhila.mohammadi@example.com",
    dadName: "عبدالله",
    tell: "08734567890",
    address: "سقز، خیابان امام خمینی، پلاک ۱۲",
    sectionId: 2,
    fieldType: 1,
    educationType: 3,
    bankAccountNumber: "IR250800005000115426978001",
    defaultQuota: 8,
    certOfTest: true,
    certOfEarth: false,
    certOfFiber: true,
    certOfInspection: false,
    inactive: false,
    bankAccountBlocked: false,
    has1Percent: false,
    hasQuarterIncrease: true,
    sortIndex: 2,
    isDelete: false,
    solarBirthDate: "1370/02/20",
    solarMembershipDate: "1394/03/15",
    createdAt: "2024-02-05T09:30:00Z",
  },
  {
    id: "eng-003",
    clientId: CLIENT_ID,
    fullName: "هیوا رضایی",
    naCode: "2852345678",
    cellPhone: "09173456789",
    email: "hiwa.rezaei@example.com",
    dadName: "محمد",
    tell: "08735678901",
    address: "مریوان، بلوار شهید مطهری",
    sectionId: 3,
    fieldType: 0,
    educationType: 2,
    bankAccountNumber: "IR340100004001056996978001",
    defaultQuota: 12,
    certOfTest: false,
    certOfEarth: true,
    certOfFiber: false,
    certOfInspection: true,
    inactive: false,
    bankAccountBlocked: false,
    has1Percent: true,
    hasQuarterIncrease: true,
    sortIndex: 3,
    isDelete: false,
    solarBirthDate: "1363/11/08",
    solarMembershipDate: "1389/01/20",
    createdAt: "2024-03-12T10:00:00Z",
  },
  {
    id: "eng-004",
    clientId: CLIENT_ID,
    fullName: "شیرزاد کریمی",
    naCode: "2863456789",
    cellPhone: "09164567890",
    email: "shirzad.karimi@example.com",
    dadName: "حسن",
    tell: "08736789012",
    address: "بانه، خیابان طالقانی، کوچه دوم",
    sectionId: 4,
    fieldType: 2,
    educationType: 1,
    bankAccountNumber: "IR720780000100075591009001",
    defaultQuota: 6,
    certOfTest: true,
    certOfEarth: true,
    certOfFiber: true,
    certOfInspection: false,
    inactive: true,
    bankAccountBlocked: true,
    has1Percent: false,
    hasQuarterIncrease: false,
    sortIndex: 4,
    isDelete: false,
    solarBirthDate: "1358/06/15",
    solarMembershipDate: "1385/09/10",
    createdAt: "2024-04-01T11:00:00Z",
  },
  {
    id: "eng-005",
    clientId: CLIENT_ID,
    fullName: "دیاکو علیپور",
    naCode: "2874567890",
    cellPhone: "09155678901",
    email: "dyako.alipour@example.com",
    dadName: "رضا",
    tell: "08737890123",
    address: "کامیاران، خیابان ولی‌عصر",
    sectionId: 1,
    fieldType: 1,
    educationType: 2,
    bankAccountNumber: "IR590560611828003471614001",
    defaultQuota: 9,
    certOfTest: false,
    certOfEarth: false,
    certOfFiber: true,
    certOfInspection: true,
    inactive: false,
    bankAccountBlocked: false,
    has1Percent: true,
    hasQuarterIncrease: false,
    sortIndex: 5,
    isDelete: false,
    solarBirthDate: "1367/09/25",
    solarMembershipDate: "1392/05/05",
    createdAt: "2024-05-20T07:30:00Z",
  },
];

const historyStore: EngineerHistory[] = [
  {
    id: "hist-001",
    engineerId: "eng-001",
    description: "مدارک به‌روزرسانی شد",
    createdAt: "2024-06-01T09:00:00Z",
  },
  {
    id: "hist-002",
    engineerId: "eng-001",
    description: "کوتا سه‌ماهه تایید شد",
    createdAt: "2024-08-15T11:30:00Z",
  },
  {
    id: "hist-003",
    engineerId: "eng-002",
    description: "گواهینامه فیبر نوری دریافت شد",
    createdAt: "2024-07-10T10:00:00Z",
  },
];

export const mockEngineersService: EngineerService = {
  async getAll(filter) {
    let results = engineerStore.filter((e) => !e.isDelete);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      results = results.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          (e.naCode ?? "").includes(q) ||
          (e.cellPhone ?? "").includes(q)
      );
    }
    if (filter?.sectionId !== undefined) {
      results = results.filter((e) => e.sectionId === filter.sectionId);
    }
    if (filter?.inactive !== undefined) {
      results = results.filter((e) => e.inactive === filter.inactive);
    }
    return [...results].sort((a, b) => a.sortIndex - b.sortIndex);
  },

  async getById(id) {
    return engineerStore.find((e) => e.id === id && !e.isDelete) ?? null;
  },

  async upsert(data) {
    const existingIdx = data.id
      ? engineerStore.findIndex((e) => e.id === data.id)
      : -1;

    if (existingIdx >= 0) {
      engineerStore[existingIdx] = {
        ...engineerStore[existingIdx],
        ...data,
      };
      return engineerStore[existingIdx];
    }

    const newEngineer: Engineer = {
      id: `eng-${Date.now()}`,
      clientId: data.clientId ?? CLIENT_ID,
      fullName: data.fullName ?? "",
      fieldType: data.fieldType ?? 0,
      educationType: data.educationType ?? 0,
      defaultQuota: data.defaultQuota ?? 0,
      certOfTest: data.certOfTest ?? false,
      certOfEarth: data.certOfEarth ?? false,
      certOfFiber: data.certOfFiber ?? false,
      certOfInspection: data.certOfInspection ?? false,
      inactive: data.inactive ?? false,
      bankAccountBlocked: data.bankAccountBlocked ?? false,
      has1Percent: data.has1Percent ?? false,
      hasQuarterIncrease: data.hasQuarterIncrease ?? false,
      sortIndex: data.sortIndex ?? engineerStore.length + 1,
      isDelete: false,
      createdAt: new Date().toISOString(),
      ...data,
    };
    engineerStore.push(newEngineer);
    return newEngineer;
  },

  async delete(id) {
    const idx = engineerStore.findIndex((e) => e.id === id);
    if (idx >= 0) {
      engineerStore[idx].isDelete = true;
    }
  },

  async getHistory(engineerId) {
    return historyStore
      .filter((h) => h.engineerId === engineerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async addHistory(engineerId, description) {
    historyStore.push({
      id: `hist-${Date.now()}`,
      engineerId,
      description,
      createdAt: new Date().toISOString(),
    });
  },
};

export default mockEngineersService;
