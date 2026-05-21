// ─── Project Level ────────────────────────────────────────────────────────────

export const ProjectLevel = {
  Registered: 0,
  PendingReview: 1,
  Expert: 2,
  Drawing: 3,
  Testing: 4,
  ERT: 5,
  Panel: 6,
  Inspection: 7,
  Delivery: 8,
  Completed: 9,
} as const;
export type ProjectLevel = (typeof ProjectLevel)[keyof typeof ProjectLevel];

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

// ─── Building Type ─────────────────────────────────────────────────────────────

export const BuildingType = {
  None: 0,
  Residential: 1,
  Commercial: 2,
  Official: 3,
  Industrial: 4,
  General: 5,
} as const;
export type BuildingType = (typeof BuildingType)[keyof typeof BuildingType];

export const BuildingTypeLabel: Record<number, string> = {
  0: "نامشخص",
  1: "مسکونی",
  2: "تجاری",
  3: "اداری",
  4: "صنعتی",
  5: "عمومی",
};

// ─── Branching Type ────────────────────────────────────────────────────────────

export const BranchingType = {
  Domestic: 0,
  Public: 1,
  Industrial: 2,
  Other: 3,
  Existing: 4,
} as const;
export type BranchingType = (typeof BranchingType)[keyof typeof BranchingType];

// ─── Faz Number ────────────────────────────────────────────────────────────────

export const FazNumber = {
  OneFaz: 0,
  ThreeFaz: 1,
  PermanentBranch: 2,
  TemporaryBranch: 3,
} as const;
export type FazNumber = (typeof FazNumber)[keyof typeof FazNumber];

// ─── Elect Project Status ──────────────────────────────────────────────────────

export const ElectProjectStatus = {
  Active: 0,
  Pending: 1,
  Completed: 2,
  Stopped: 3,
  Deleted: 4,
} as const;
export type ElectProjectStatus =
  (typeof ElectProjectStatus)[keyof typeof ElectProjectStatus];

// ─── Inspection Status ─────────────────────────────────────────────────────────

export const InspectionStatus = {
  Pending: 0,
  InProgress: 1,
  Approved: 2,
  Rejected: 3,
  Cancelled: 99,
} as const;
export type InspectionStatus =
  (typeof InspectionStatus)[keyof typeof InspectionStatus];

// ─── Transaction Type ──────────────────────────────────────────────────────────

export const TransactionType = {
  Payment: 0,
  Refund: 1,
  Manual: 2,
} as const;
export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

// ─── Transaction Status ────────────────────────────────────────────────────────

export const TransactionStatus = {
  Pending: 0,
  Processing: 1,
  Confirmed: 2,
  Failed: 3,
} as const;
export type TransactionStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

// ─── Gateway Type ──────────────────────────────────────────────────────────────

export const GatewayType = {
  IranKish: 1,
  Manual: 2,
} as const;
export type GatewayType = (typeof GatewayType)[keyof typeof GatewayType];

// ─── Invoice Status ────────────────────────────────────────────────────────────

export const InvoiceStatus = {
  Pending: 0,
  Paid: 1,
  Cancelled: 2,
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

// ─── File Elect Project Type ───────────────────────────────────────────────────

export const FileElectProjectType = {
  None: 0,
  IdCard: 1,
  ElectPlan: 2,
  RelatedPermit: 3,
  ErtMap: 4,
  CheckListBoard: 5,
  Crooky: 6,
  ElectNetwork: 7,
  TestAndDelivery: 8,
  CrookyOfElectrode: 9,
  SupervisorApproveForm: 10,
  ExpertDocument: 11,
  ErtDocument: 12,
  TestAndDeliveryDocument: 13,
  SupervisionDocument: 14,
  AzbuiltMap: 15,
} as const;
export type FileElectProjectType =
  (typeof FileElectProjectType)[keyof typeof FileElectProjectType];

export const FileElectProjectTypeLabel: Record<number, string> = {
  0: "سایر",
  1: "کارت ملی",
  2: "نقشه برق",
  3: "پروانه مرتبط",
  4: "نقشه ارت",
  5: "چک‌لیست تابلو",
  6: "کروکی",
  7: "شبکه برق",
  8: "تست و تحویل",
  9: "کروکی الکترود",
  10: "فرم تایید ناظر",
  11: "مدرک کارشناسی",
  12: "مدرک ارت",
  13: "مدرک تست",
  14: "مدرک نظارت",
  15: "نقشه آزبیلت",
};

// ─── User File Type ────────────────────────────────────────────────────────────

export const UserFileType = {
  IdCard: 0,
  SealSignature: 1,
  License: 2,
  TestCert: 3,
  EarthCert: 4,
  FiberCert: 5,
  InspectionCert: 6,
  Photo: 7,
  Letter: 8,
} as const;
export type UserFileType = (typeof UserFileType)[keyof typeof UserFileType];

// ─── Role ──────────────────────────────────────────────────────────────────────

export const Role = {
  Administrator: "Administrator",
  SuperUser: "SuperUser",
  Executor: "Executor",
  Engineer: "Engineer",
  Accountant: "Accountant",
  Employee: "Employee",
  PanelMaker: "PanelMaker",
  ElectAdmin: "ElectAdmin",
  Section: "Section",
  Analyzer: "Analyzer",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

// ─── Inspection Description ────────────────────────────────────────────────────

export const InspectionDesLabel: Record<number, string> = {
  0: "وجود نقشه‌های تأیید شده",
  1: "وجود اشتراک برق",
  2: "تأیید تابلو اصلی",
  3: "تأیید کابل‌کشی",
  4: "تأیید سیستم ارتینگ",
  5: "تأیید حفاظت جان",
  6: "تأیید کلیدهای اتوماتیک",
  7: "تأیید پریزها",
  8: "تأیید روشنایی",
  9: "تأیید سیستم ضد حریق",
  10: "تأیید سیستم صاعقه‌گیر",
  11: "تأیید کانال‌کشی",
  12: "تأیید لوله‌کشی",
  13: "تأیید اتصالات",
  14: "تأیید تجهیزات اندازه‌گیری",
  15: "تأیید سیستم تهویه",
  16: "تأیید سیستم روشنایی اضطراری",
  17: "تأیید سیستم هشدار دهنده",
  18: "تأیید سیستم ارتباطی",
  19: "تأیید سیستم کنترل",
  20: "تأیید سیستم اتوماسیون",
  21: "تأیید سیستم برق اضطراری",
  22: "تأیید سیستم UPS",
  23: "تأیید سیستم سرمایش و گرمایش",
  24: "تأیید سیستم جوش‌کاری",
  25: "تأیید سایر تجهیزات",
};
