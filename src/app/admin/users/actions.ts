"use server";

import { createAdminClient, createClient } from "@/lib/supabase-server";
import { getUserRoles, hasRole } from "@/lib/auth";

/** Verify the calling user holds AdminPanel or Administrator role. */
async function assertAdminPanel(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("احراز هویت نشده");

  const roles = await getUserRoles();
  if (!hasRole(roles, "AdminPanel", "Administrator"))
    throw new Error("دسترسی غیر مجاز");
}

export interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export async function getUsers(): Promise<UserRecord[]> {
  try {
    await assertAdminPanel();
    const supabase = await createAdminClient();
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, is_active");

    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("user_id, role");

    return (users ?? []).map((u) => {
      const profile = profiles?.find((p) => p.id === u.id);
      const roleRow = userRoles?.find((r) => r.user_id === u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        firstName: profile?.first_name ?? (u.user_metadata?.first_name as string | undefined) ?? "",
        lastName: profile?.last_name ?? (u.user_metadata?.last_name as string | undefined) ?? "",
        role: roleRow?.role ?? "Employee",
        isActive: profile?.is_active ?? true,
        createdAt: u.created_at,
      };
    });
  } catch {
    // Return mock data if Supabase is not configured
    return mockUsers;
  }
}

export async function inviteUser(
  email: string,
  role: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdminPanel();
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateUserRole(
  userId: string,
  role: string
): Promise<{ ok: boolean }> {
  try {
    await assertAdminPanel();
    const supabase = await createAdminClient();
    // Upsert role (delete old, insert new)
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) throw error;
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function deactivateUser(userId: string): Promise<{ ok: boolean }> {
  try {
    await assertAdminPanel();
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: false })
      .eq("id", userId);
    if (error) throw error;
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// Mock data fallback
const mockUsers: UserRecord[] = [
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
    role: "Executor",
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
