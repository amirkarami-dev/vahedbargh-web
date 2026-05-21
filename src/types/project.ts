import type {
  ProjectLevel,
  BuildingType,
  BranchingType,
  FazNumber,
  ElectProjectStatus,
  InspectionStatus,
  FileElectProjectType,
} from "./enums";

// ─── Elect Project ─────────────────────────────────────────────────────────────

export interface ElectProject {
  id: string;
  clientId: string;
  fileNumber: string | null;
  electRequestNumber: string | null;
  userId: string | null;
  sectionId: number | null;
  cityId: number | null;
  provinceId: number | null;
  address: string | null;
  postalCode: string | null;
  lat: number | null;
  lng: number | null;
  landlordName: string | null;
  landlordNaCode: string | null;
  landlordPhoneNumber: string | null;
  companyName: string | null;
  licenseNumber: string | null;
  description: string | null;
  numberOfFloor: number;
  desNumberOfFloor: number | null;
  projectCreatedType: number;
  projectTypeRequest: number;
  projectLevel: ProjectLevel;
  buildingType: BuildingType;
  electProjectStatus: ElectProjectStatus;
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
  amountPerArea: number | null;
  foundationElectrodeArea: number | null;
  isNeedEb: boolean;
  hasRelatedPermit: boolean;
  hasSupervision: boolean;
  areaAsBuilt: number | null;
  defectDes: string | null;
  isDefectEng: boolean;
  solvedDefectEng: boolean;
  supervisorName: string | null;
  supervisorPhoneNumber: string | null;
  panelSerialNumber: string | null;
  stopDes: string | null;
  parentProjectId: string | null;
  buildingTariffId: string | null;
  ertTariffId: string | null;
  panelMakerId: string | null;
  solarCreated: string | null;
  julianCreated: string | null;
  solarSubmitted: string | null;
  julianSubmitted: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ─── Elect Project Process (EPP) ───────────────────────────────────────────────

export interface ElectProjectProcess {
  id: string;
  clientId: string;
  electProjectId: string;
  engineerId: string | null;
  projectLevel: ProjectLevel;
  buildingTariffId: string | null;
  quarterTariffId: string | null;
  inspectionStatus: InspectionStatus;
  defect: string | null;
  fee: number;
  accepted: boolean;
  description: string | null;
  isMain: boolean;
  isDelete: boolean;
  solarAssigned: string | null;
  julianAssigned: string | null;
  solarAccepted: string | null;
  julianAccepted: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ─── Comment Eng Form ──────────────────────────────────────────────────────────

export interface CommentEngForm {
  id: string;
  clientId: string;
  eppId: string;
  electProjectId: string;
  branchingType: BranchingType;
  fazNumber: FazNumber;
  branchingCount: number | null;
  ampere: number | null;
  power: number | null;
  powerSum: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ─── Check List Form ───────────────────────────────────────────────────────────

export interface CheckListForm {
  id: string;
  clientId: string;
  eppId: string;
  electProjectId: string;
  solarChecked: string | null;
  inspectionDes: number;
  isComplete: boolean;
  resultDes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ─── ERT Form ──────────────────────────────────────────────────────────────────

export interface ErtForm {
  id: string;
  clientId: string;
  electProjectId: string;
  eppId: string | null;
  electrodeType: number | null;
  electrodeMaterial: string | null;
  electrodeLength: number | null;
  electrodeDiameter: number | null;
  electrodeDepth: number | null;
  utmX: number | null;
  utmY: number | null;
  resistanceValue: number | null;
  measurementConditions: string | null;
  testEquipment: string | null;
  testDate: string | null;
  inspectorName: string | null;
  additionalData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string | null;
}

// ─── Elect Project File ────────────────────────────────────────────────────────

export interface ElectProjectFile {
  id: string;
  clientId: string;
  electProjectId: string;
  name: string | null;
  description: string | null;
  fileType: FileElectProjectType;
  storagePath: string;
  userId: string | null;
  toUserId: string | null;
  createdAt: string;
}
