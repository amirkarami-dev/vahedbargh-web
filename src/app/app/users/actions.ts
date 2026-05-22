"use server";

import { createAdminClient, createClient } from "@/lib/supabase-server";
import { getUserRoles, hasRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppUserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Permission guard ─────────────────────────────────────────────────────────

async function requireAdmin(): Promise<{ ok: false; error: string } | { ok: true }> {
  try {
    const roles = await getUserRoles();
    if (!hasRole(roles, "Administrator")) {
      return { ok: false, error: "دسترسی غیر مجاز" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "خطا در بررسی دسترسی" };
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getAppUsers(): Promise<AppUserRecord[]> {
  try {
    const supabase = await createAdminClient();

    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers();

    if (error) throw error;

    const [profilesRes, rolesRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, first_name, last_name, is_active"),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    const profiles = profilesRes.data ?? [];
    const userRoles = rolesRes.data ?? [];

    return (users ?? []).map((u) => {
      const profile = profiles.find((p) => p.id === u.id);
      const roleRow = userRoles.find((r) => r.user_id === u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        firstName:
          (profile?.first_name as string | null | undefined) ??
          (u.user_metadata?.first_name as string | undefined) ??
          "",
        lastName:
          (profile?.last_name as string | null | undefined) ??
          (u.user_metadata?.last_name as string | undefined) ??
          "",
        role: (roleRow?.role as string | undefined) ?? "Employee",
        isActive: (profile?.is_active as boolean | null | undefined) ?? true,
        createdAt: u.created_at,
      };
    });
  } catch {
    return MOCK_USERS;
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function updateUserRole(
  userId: string,
  role: string
): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role }, { onConflict: "user_id" });

    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function inviteUser(
  email: string,
  role: string
): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role },
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath("/app/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deactivateAppUser(
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  try {
    const supabase = await createAdminClient();

    // Try profiles table first
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      // Fallback: ban the user via auth admin API
      const { error: banError } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: "876600h", // ~100 years
      });
      if (banError) return { ok: false, error: banError.message };
    }

    revalidatePath("/app/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ─── Mock fallback ────────────────────────────────────────────────────────────

const MOCK_USERS: AppUserRecord[] = [
  {
    id: "usr-001",
    email: "admin@kurdnezam.ir",
    firstName: "احمد",
    lastName: "محمدی",
    role: "Administrator",
    isActive: true,
    createdAt: "2024-01-10T08:00:00Z",
  },
  {
    id: "usr-002",
    email: "sirwan@kurdnezam.ir",
    firstName: "سیروان",
    lastName: "احمدی",
    role: "Engineer",
    isActive: true,
    createdAt: "2024-02-05T09:30:00Z",
  },
  {
    id: "usr-003",
    email: "zhila@kurdnezam.ir",
    firstName: "ژیلا",
    lastName: "رضایی",
    role: "Accountant",
    isActive: true,
    createdAt: "2024-03-12T10:00:00Z",
  },
  {
    id: "usr-004",
    email: "hiwa@kurdnezam.ir",
    firstName: "هیوا",
    lastName: "کریمی",
    role: "Employee",
    isActive: false,
    createdAt: "2024-04-01T11:00:00Z",
  },
  {
    id: "usr-005",
    email: "dyako@kurdnezam.ir",
    firstName: "دیاکو",
    lastName: "علیپور",
    role: "Section",
    isActive: true,
    createdAt: "2024-05-20T07:30:00Z",
  },
];
