import type {
  GatewayType,
  TransactionType,
  TransactionStatus,
  InvoiceStatus,
} from "./enums";

// ─── Transaction ───────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  clientId: string;
  userId: string | null;
  electProjectId: string | null;
  amount: number;
  gatewayType: GatewayType;
  transactionType: TransactionType;
  status: TransactionStatus;
  bankTransactionId: string | null;
  description: string | null;
  solarCreated: string | null;
  julianCreated: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ─── Bank Transaction ──────────────────────────────────────────────────────────

export interface BankTransaction {
  id: string;
  clientId: string;
  gatewayType: GatewayType;
  token: string | null;
  paymentId: string | null;
  requestId: string | null;
  amount: number | null;
  acceptorId: string | null;
  retrievalReferenceNumber: string | null;
  systemTraceAuditNumber: string | null;
  maskedPan: string | null;
  sha256OfPan: string | null;
  confirmed: boolean;
  createdAt: string;
}

// ─── Invoice ───────────────────────────────────────────────────────────────────

export interface Invoice {
  id: string;
  clientId: string;
  electProjectId: string | null;
  eppId: string | null;
  transactionId: string | null;
  amount: number;
  amountSupervision: number;
  invoiceStatus: InvoiceStatus;
  invoicePayType: number;
  solarCreated: string | null;
  julianCreated: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ─── Eng Payment Task ──────────────────────────────────────────────────────────

export interface EngPaymentTask {
  id: string;
  clientId: string;
  description: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string | null;
}

// ─── Eng Payment List ──────────────────────────────────────────────────────────

export interface EngPaymentList {
  id: string;
  clientId: string;
  engineerId: string;
  engPaymentTaskId: string | null;
  transactionId: string | null;
  amountSystem: number;
  deduction1: number;
  deduction2: number;
  deduction3: number;
  deduction4: number;
  addition1: number;
  addition2: number;
  sumAmountSystem: number;
  sumAmountWithFish: number;
  bankAccountNumber: string | null;
  payByBankReceipt: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string | null;
}

// ─── Eng Quota Burn ────────────────────────────────────────────────────────────

export interface EngQuotaBurn {
  id: string;
  clientId: string;
  engineerId: string;
  quarterTariffId: string | null;
  amountRemaining: number;
  amountBurning: number;
  ertCountRemaining: number;
  ertCountBurning: number;
  inspectionDelayFactor: number;
  ertDelayFactor: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string | null;
}

// ─── Quarter Tariff ────────────────────────────────────────────────────────────

export interface QuarterTariff {
  id: string;
  clientId: string;
  quarterType: number;
  year: number;
  allotmentRoundType: number;
  fee: number;
  ertFee: number;
  testAndDeliveryFee: number;
  countErt: number;
  countTestDelivery: number;
  isQuota: boolean;
  period: string | null;
  percentIncrease: number;
  ertApprovedFee: number;
  addDifDays: number;
  createdAt: string;
  updatedAt: string | null;
}

// ─── Building Tariff ───────────────────────────────────────────────────────────

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
  solarYear: string | null;
  solarDate: string | null;
  effectiveAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ─── ERT Tariff ────────────────────────────────────────────────────────────────

export interface ErtTariff {
  id: string;
  clientId: string;
  ertSystemType: number;
  tariff: number;
  factor: number;
  solarDate: string | null;
  effectiveAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}
