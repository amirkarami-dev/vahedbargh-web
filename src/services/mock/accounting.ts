// ─── Inline Types ──────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  clientId: string;
  userId?: string;
  electProjectId?: string;
  amount: number;
  gatewayType: number;
  transactionType: number;
  status: number;
  bankTransactionId?: string;
  description?: string;
  solarCreated?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  electProjectId?: string;
  eppId?: string;
  transactionId?: string;
  amount: number;
  amountSupervision: number;
  invoiceStatus: number;
  invoicePayType: number;
  solarCreated?: string;
  createdAt: string;
}

export interface EngPaymentTask {
  id: string;
  clientId: string;
  description?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface EngPaymentList {
  id: string;
  clientId: string;
  engineerId: string;
  engPaymentTaskId?: string;
  transactionId?: string;
  amountSystem: number;
  deduction1: number;
  deduction2: number;
  deduction3: number;
  deduction4: number;
  addition1: number;
  addition2: number;
  sumAmountSystem: number;
  sumAmountWithFish: number;
  bankAccountNumber?: string;
  payByBankReceipt?: string;
  isApproved: boolean;
  createdAt: string;
}

export function calculateDeductions(gross: number) {
  const d1 = gross * 0.05;
  const d2 = gross * 0.01;
  const d3 = gross * 0.07;
  const d4 = gross * 0.10;
  return {
    amountSystem: gross,
    deduction1: d1,
    deduction2: d2,
    deduction3: d3,
    deduction4: d4,
    sumAmountSystem: gross - d1 - d2 - d3 - d4,
    sumAmountWithFish: gross,
  };
}

// ─── Mock Data ─────────────────────────────────────────────────────────────

const CLIENT_ID = "00000000-0000-0000-0000-000000000001";

const transactions: Transaction[] = [
  {
    id: "tx-001", clientId: CLIENT_ID, userId: "user-1",
    electProjectId: "proj-001", amount: 12500000, gatewayType: 1,
    transactionType: 0, status: 2, bankTransactionId: "bank-001",
    description: "پرداخت آنلاین نظارت پروژه", solarCreated: "1403/01/15",
    createdAt: "2024-04-04T08:00:00Z",
  },
  {
    id: "tx-002", clientId: CLIENT_ID, userId: "user-2",
    electProjectId: "proj-002", amount: 8750000, gatewayType: 1,
    transactionType: 0, status: 0, bankTransactionId: undefined,
    description: "پرداخت در انتظار تأیید", solarCreated: "1403/02/01",
    createdAt: "2024-04-21T10:30:00Z",
  },
  {
    id: "tx-003", clientId: CLIENT_ID, userId: "user-1",
    electProjectId: "proj-003", amount: 22000000, gatewayType: 0,
    transactionType: 1, status: 2, bankTransactionId: "bank-003",
    description: "پرداخت دستی حق‌الزحمه مهندس", solarCreated: "1403/02/10",
    createdAt: "2024-04-30T14:00:00Z",
  },
  {
    id: "tx-004", clientId: CLIENT_ID,
    amount: 5000000, gatewayType: 0,
    transactionType: 2, status: 1,
    description: "واریز مستقیم به حساب", solarCreated: "1403/03/05",
    createdAt: "2024-05-25T09:00:00Z",
  },
  {
    id: "tx-005", clientId: CLIENT_ID, userId: "user-3",
    electProjectId: "proj-001", amount: 18300000, gatewayType: 1,
    transactionType: 0, status: 2, bankTransactionId: "bank-005",
    description: "تکمیل پرداخت پروژه", solarCreated: "1403/03/20",
    createdAt: "2024-06-09T11:15:00Z",
  },
];

const invoices: Invoice[] = [
  {
    id: "inv-001", clientId: CLIENT_ID, electProjectId: "proj-001",
    transactionId: "tx-001", amount: 12500000, amountSupervision: 1250000,
    invoiceStatus: 2, invoicePayType: 1, solarCreated: "1403/01/15",
    createdAt: "2024-04-04T08:05:00Z",
  },
  {
    id: "inv-002", clientId: CLIENT_ID, electProjectId: "proj-002",
    transactionId: "tx-002", amount: 8750000, amountSupervision: 875000,
    invoiceStatus: 0, invoicePayType: 1, solarCreated: "1403/02/01",
    createdAt: "2024-04-21T10:35:00Z",
  },
  {
    id: "inv-003", clientId: CLIENT_ID, electProjectId: "proj-003",
    transactionId: "tx-005", amount: 18300000, amountSupervision: 1830000,
    invoiceStatus: 2, invoicePayType: 0, solarCreated: "1403/03/20",
    createdAt: "2024-06-09T11:20:00Z",
  },
];

const engPaymentTasks: EngPaymentTask[] = [
  {
    id: "ept-001", clientId: CLIENT_ID,
    description: "پرداخت فصل بهار ۱۴۰۳", isApproved: true,
    createdAt: "2024-04-15T08:00:00Z",
  },
  {
    id: "ept-002", clientId: CLIENT_ID,
    description: "پرداخت فصل تابستان ۱۴۰۳", isApproved: false,
    createdAt: "2024-07-01T08:00:00Z",
  },
];

function makeEngPaymentList(
  id: string, taskId: string, engineerId: string, gross: number
): EngPaymentList {
  const d = calculateDeductions(gross);
  return {
    id, clientId: CLIENT_ID, engineerId, engPaymentTaskId: taskId,
    ...d, addition1: 0, addition2: 0,
    bankAccountNumber: "IR12345678901234567890",
    isApproved: false,
    createdAt: "2024-07-01T08:00:00Z",
  };
}

const engPaymentLists: EngPaymentList[] = [
  makeEngPaymentList("epl-001", "ept-001", "eng-001", 15000000),
  makeEngPaymentList("epl-002", "ept-001", "eng-002", 12000000),
  makeEngPaymentList("epl-003", "ept-002", "eng-001", 18000000),
  makeEngPaymentList("epl-004", "ept-002", "eng-003", 9500000),
];

// ─── Service Interface ──────────────────────────────────────────────────────

export interface AccountingFilter {
  status?: number;
  transactionType?: number;
  electProjectId?: string;
}

export interface AccountingService {
  getTransactions(filter?: AccountingFilter): Promise<Transaction[]>;
  getInvoices(filter?: AccountingFilter): Promise<Invoice[]>;
  getEngPaymentTasks(): Promise<EngPaymentTask[]>;
  getEngPaymentLists(taskId: string): Promise<EngPaymentList[]>;
  addTransaction(data: Omit<Transaction, "id" | "createdAt">): Promise<Transaction>;
  approveEngPayment(id: string): Promise<void>;
}

// ─── Mock Implementation ────────────────────────────────────────────────────

export const mockAccountingService: AccountingService = {
  async getTransactions(filter) {
    let result = [...transactions];
    if (filter?.status !== undefined) result = result.filter((t) => t.status === filter.status);
    if (filter?.transactionType !== undefined) result = result.filter((t) => t.transactionType === filter.transactionType);
    if (filter?.electProjectId) result = result.filter((t) => t.electProjectId === filter.electProjectId);
    return result;
  },

  async getInvoices(filter) {
    let result = [...invoices];
    if (filter?.status !== undefined) result = result.filter((i) => i.invoiceStatus === filter.status);
    if (filter?.electProjectId) result = result.filter((i) => i.electProjectId === filter.electProjectId);
    return result;
  },

  async getEngPaymentTasks() {
    return [...engPaymentTasks];
  },

  async getEngPaymentLists(taskId) {
    return engPaymentLists.filter((l) => l.engPaymentTaskId === taskId);
  },

  async addTransaction(data) {
    const item: Transaction = {
      ...data,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    transactions.push(item);
    return item;
  },

  async approveEngPayment(id) {
    const item = engPaymentLists.find((l) => l.id === id);
    if (item) item.isApproved = true;
  },
};

export default mockAccountingService;
