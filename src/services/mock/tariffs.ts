// ─── Inline Types ──────────────────────────────────────────────────────────

export interface QuarterTariff {
  id: string;
  clientId: string;
  quarterType: number;
  year: number;
  fee: number;
  ertFee: number;
  testAndDeliveryFee: number;
  countErt: number;
  countTestDelivery: number;
  isQuota: boolean;
  period?: string;
  percentIncrease: number;
  createdAt: string;
}

export interface BuildingTariff {
  id: string;
  clientId: string;
  buildingGroupType: number;
  buildingGroupParam: number;
  tariff: number;
  minTariff: number;
  factor: number;
  testDeliveryFactor: number;
  supervisionTariff: number;
  supervisionMinTariff: number;
  supervisionFactor: number;
  solarYear?: string;
  createdAt: string;
}

export const QuarterLabel: Record<number, string> = {
  1: "بهار",
  2: "تابستان",
  3: "پاییز",
  4: "زمستان",
};

export const BuildingGroupLabel: Record<number, string> = {
  0: "مسکونی",
  1: "تجاری",
  2: "اداری",
  3: "صنعتی",
  4: "عمومی",
};

// ─── Mock Data ─────────────────────────────────────────────────────────────

const CLIENT_ID = "00000000-0000-0000-0000-000000000001";

const quarterTariffs: QuarterTariff[] = [
  {
    id: "qt-001", clientId: CLIENT_ID, quarterType: 1, year: 1403,
    fee: 45000000, ertFee: 8000000, testAndDeliveryFee: 5000000,
    countErt: 10, countTestDelivery: 5, isQuota: true,
    period: "1403/01/01-1403/03/31", percentIncrease: 15,
    createdAt: "2024-03-20T08:00:00Z",
  },
  {
    id: "qt-002", clientId: CLIENT_ID, quarterType: 2, year: 1403,
    fee: 45000000, ertFee: 8000000, testAndDeliveryFee: 5000000,
    countErt: 10, countTestDelivery: 5, isQuota: true,
    period: "1403/04/01-1403/06/31", percentIncrease: 15,
    createdAt: "2024-06-21T08:00:00Z",
  },
  {
    id: "qt-003", clientId: CLIENT_ID, quarterType: 3, year: 1403,
    fee: 48000000, ertFee: 8500000, testAndDeliveryFee: 5500000,
    countErt: 12, countTestDelivery: 6, isQuota: false,
    period: "1403/07/01-1403/09/30", percentIncrease: 20,
    createdAt: "2024-09-22T08:00:00Z",
  },
  {
    id: "qt-004", clientId: CLIENT_ID, quarterType: 4, year: 1403,
    fee: 50000000, ertFee: 9000000, testAndDeliveryFee: 6000000,
    countErt: 12, countTestDelivery: 6, isQuota: false,
    period: "1403/10/01-1403/12/29", percentIncrease: 20,
    createdAt: "2024-12-21T08:00:00Z",
  },
];

const buildingTariffs: BuildingTariff[] = [
  {
    id: "bt-001", clientId: CLIENT_ID, buildingGroupType: 0, buildingGroupParam: 0,
    tariff: 12000000, minTariff: 8000000, factor: 1.0, testDeliveryFactor: 0.8,
    supervisionTariff: 1200000, supervisionMinTariff: 800000, supervisionFactor: 1.0,
    solarYear: "1403", createdAt: "2024-03-20T08:00:00Z",
  },
  {
    id: "bt-002", clientId: CLIENT_ID, buildingGroupType: 1, buildingGroupParam: 0,
    tariff: 18000000, minTariff: 12000000, factor: 1.3, testDeliveryFactor: 1.0,
    supervisionTariff: 1800000, supervisionMinTariff: 1200000, supervisionFactor: 1.3,
    solarYear: "1403", createdAt: "2024-03-20T08:00:00Z",
  },
  {
    id: "bt-003", clientId: CLIENT_ID, buildingGroupType: 2, buildingGroupParam: 0,
    tariff: 16000000, minTariff: 11000000, factor: 1.2, testDeliveryFactor: 0.9,
    supervisionTariff: 1600000, supervisionMinTariff: 1100000, supervisionFactor: 1.2,
    solarYear: "1403", createdAt: "2024-03-20T08:00:00Z",
  },
  {
    id: "bt-004", clientId: CLIENT_ID, buildingGroupType: 3, buildingGroupParam: 0,
    tariff: 22000000, minTariff: 15000000, factor: 1.5, testDeliveryFactor: 1.2,
    supervisionTariff: 2200000, supervisionMinTariff: 1500000, supervisionFactor: 1.5,
    solarYear: "1403", createdAt: "2024-03-20T08:00:00Z",
  },
  {
    id: "bt-005", clientId: CLIENT_ID, buildingGroupType: 4, buildingGroupParam: 0,
    tariff: 20000000, minTariff: 14000000, factor: 1.4, testDeliveryFactor: 1.1,
    supervisionTariff: 2000000, supervisionMinTariff: 1400000, supervisionFactor: 1.4,
    solarYear: "1403", createdAt: "2024-03-20T08:00:00Z",
  },
];

// ─── Service Interface ──────────────────────────────────────────────────────

export interface TariffService {
  getQuarterTariffs(): Promise<QuarterTariff[]>;
  getBuildingTariffs(): Promise<BuildingTariff[]>;
  upsertQuarterTariff(data: Omit<QuarterTariff, "id" | "createdAt"> & { id?: string }): Promise<QuarterTariff>;
  upsertBuildingTariff(data: Omit<BuildingTariff, "id" | "createdAt"> & { id?: string }): Promise<BuildingTariff>;
  deleteQuarterTariff(id: string): Promise<void>;
  deleteBuildingTariff(id: string): Promise<void>;
}

// ─── Mock Implementation ────────────────────────────────────────────────────

export const mockTariffService: TariffService = {
  async getQuarterTariffs() {
    return [...quarterTariffs].sort((a, b) => a.year - b.year || a.quarterType - b.quarterType);
  },

  async getBuildingTariffs() {
    return [...buildingTariffs].sort((a, b) => a.buildingGroupType - b.buildingGroupType);
  },

  async upsertQuarterTariff(data) {
    if (data.id) {
      const idx = quarterTariffs.findIndex((t) => t.id === data.id);
      if (idx !== -1) {
        quarterTariffs[idx] = { ...quarterTariffs[idx], ...data, id: data.id };
        return quarterTariffs[idx];
      }
    }
    const item: QuarterTariff = {
      ...data,
      id: `qt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    quarterTariffs.push(item);
    return item;
  },

  async upsertBuildingTariff(data) {
    if (data.id) {
      const idx = buildingTariffs.findIndex((t) => t.id === data.id);
      if (idx !== -1) {
        buildingTariffs[idx] = { ...buildingTariffs[idx], ...data, id: data.id };
        return buildingTariffs[idx];
      }
    }
    const item: BuildingTariff = {
      ...data,
      id: `bt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    buildingTariffs.push(item);
    return item;
  },

  async deleteQuarterTariff(id) {
    const idx = quarterTariffs.findIndex((t) => t.id === id);
    if (idx !== -1) quarterTariffs.splice(idx, 1);
  },

  async deleteBuildingTariff(id) {
    const idx = buildingTariffs.findIndex((t) => t.id === id);
    if (idx !== -1) buildingTariffs.splice(idx, 1);
  },
};

export default mockTariffService;
