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

const store: EngQuotaBurn[] = [
  {
    id: "quota-001",
    clientId: "client-001",
    engineerId: "eng-001",
    quarterTariffId: "qt-001",
    amountRemaining: 8500000,
    amountBurning: 1500000,
    ertCountRemaining: 12,
    ertCountBurning: 3,
    inspectionDelayFactor: 1.0,
    ertDelayFactor: 1.0,
    isApproved: true,
    createdAt: "2024-04-01T00:00:00Z",
    engineerName: "سیامک جلیلی",
    quarterLabel: "فصل اول ۱۴۰۳",
  },
  {
    id: "quota-002",
    clientId: "client-001",
    engineerId: "eng-002",
    quarterTariffId: "qt-001",
    amountRemaining: 12000000,
    amountBurning: 3000000,
    ertCountRemaining: 18,
    ertCountBurning: 7,
    inspectionDelayFactor: 0.9,
    ertDelayFactor: 1.0,
    isApproved: true,
    createdAt: "2024-04-01T00:00:00Z",
    engineerName: "نازنین رشیدی",
    quarterLabel: "فصل اول ۱۴۰۳",
  },
  {
    id: "quota-003",
    clientId: "client-001",
    engineerId: "eng-003",
    quarterTariffId: "qt-002",
    amountRemaining: 6000000,
    amountBurning: 0,
    ertCountRemaining: 10,
    ertCountBurning: 0,
    inspectionDelayFactor: 1.0,
    ertDelayFactor: 1.0,
    isApproved: false,
    createdAt: "2024-07-01T00:00:00Z",
    engineerName: "برهان احمدی",
    quarterLabel: "فصل دوم ۱۴۰۳",
  },
  {
    id: "quota-004",
    clientId: "client-001",
    engineerId: "eng-004",
    quarterTariffId: "qt-002",
    amountRemaining: 9500000,
    amountBurning: 500000,
    ertCountRemaining: 15,
    ertCountBurning: 2,
    inspectionDelayFactor: 1.1,
    ertDelayFactor: 1.0,
    isApproved: false,
    createdAt: "2024-07-01T00:00:00Z",
    engineerName: "شوخان محمودی",
    quarterLabel: "فصل دوم ۱۴۰۳",
  },
  {
    id: "quota-005",
    clientId: "client-001",
    engineerId: "eng-005",
    quarterTariffId: "qt-001",
    amountRemaining: 15000000,
    amountBurning: 5000000,
    ertCountRemaining: 20,
    ertCountBurning: 10,
    inspectionDelayFactor: 0.85,
    ertDelayFactor: 0.9,
    isApproved: true,
    createdAt: "2024-04-01T00:00:00Z",
    engineerName: "هاوری کریمی",
    quarterLabel: "فصل اول ۱۴۰۳",
  },
];

export const mockQuotaService: QuotaService = {
  async getAll(filter?: QuotaFilter): Promise<EngQuotaBurn[]> {
    let result = [...store];
    if (filter?.isApproved !== undefined) {
      result = result.filter((q) => q.isApproved === filter.isApproved);
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async approve(id: string): Promise<void> {
    const quota = store.find((q) => q.id === id);
    if (quota) quota.isApproved = true;
  },

  async updateQuota(id: string, data: Partial<EngQuotaBurn>): Promise<EngQuotaBurn> {
    const idx = store.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error("Quota not found");
    store[idx] = { ...store[idx], ...data };
    return store[idx];
  },
};

export default mockQuotaService;
