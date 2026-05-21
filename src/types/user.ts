import type { Role } from "./enums";

// ─── Profile ───────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  clientId: string | null;
  firstName: string | null;
  lastName: string | null;
  nationalCode: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  sectionId: number | null;
  cityId: number | null;
  userType: number;
  isActive: boolean;
  expiryDate: string | null;
  score: number;
  baleId: string | null;
  integrateId: string | null;
  nickName: string | null;
  themeColor: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ─── User Role ─────────────────────────────────────────────────────────────────

export interface UserRole {
  userId: string;
  role: Role;
  clientId: string;
}

// ─── User File ─────────────────────────────────────────────────────────────────

export interface UserFile {
  id: string;
  clientId: string;
  userId: string;
  name: string | null;
  fileType: number;
  storagePath: string;
  createdAt: string;
}

// ─── Full User ─────────────────────────────────────────────────────────────────

export type FullUser = Profile & {
  roles: UserRole[];
};
