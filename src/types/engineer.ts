// ─── Engineer ──────────────────────────────────────────────────────────────────

export interface Engineer {
  id: string;
  clientId: string;
  userId: string | null;
  fullName: string;
  naCode: string | null;
  cellPhone: string | null;
  email: string | null;
  dadName: string | null;
  tell: string | null;
  address: string | null;
  sectionId: number | null;
  fieldType: number;
  educationType: number;
  maritalStatusType: number;
  relatedType: number;
  bankAccountNumber: string | null;
  defaultQuota: number;
  certOfTest: boolean;
  certOfEarth: boolean;
  certOfFiber: boolean;
  certOfInspection: boolean;
  inactive: boolean;
  isDelete: boolean;
  sortIndex: number;
  bankAccountBlocked: boolean;
  has1Percent: boolean;
  hasQuarterIncrease: boolean;
  solarBirthDate: string | null;
  solarMembershipDate: string | null;
  julianBirthDate: string | null;
  julianMembershipDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ─── Engineer History ──────────────────────────────────────────────────────────

export interface EngineerHistory {
  id: string;
  engineerId: string;
  clientId: string;
  description: string | null;
  createdAt: string;
}

// ─── Executor ──────────────────────────────────────────────────────────────────

export interface Executor {
  id: string;
  clientId: string;
  userId: string | null;
  ownershipType: number;
  executorType: number;
  executorGradType: number;
  companyName: string | null;
  fullName: string;
  tel: string | null;
  naCode: string | null;
  cellPhone: string | null;
  license: string | null;
  licenseNumber: string | null;
  sectionId: number | null;
  address: string | null;
  moreInfo: string | null;
  signatureFileName: string | null;
  licenseFileName: string | null;
  solarLicenseExpire: string | null;
  inactive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

// ─── Panel Maker ───────────────────────────────────────────────────────────────

export interface PanelMaker {
  id: string;
  clientId: string;
  userId: string | null;
  naCode: string | null;
  fullName: string;
  mobileNumber: string | null;
  tel: string | null;
  isActive: boolean;
  companyName: string | null;
  companyCode: string | null;
  licenseNumber: string | null;
  signatureFileName: string | null;
  provinceName: string | null;
  cityName: string | null;
  address: string | null;
  sectionId: number | null;
  moreInfo: string | null;
  createdAt: string;
  updatedAt: string | null;
}
