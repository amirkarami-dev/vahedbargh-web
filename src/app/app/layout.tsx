import AppShell from "@/components/app/AppShell";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { getUserRoles } from "@/lib/auth";
import type { Role } from "@/lib/auth";

export const metadata = { title: "سامانه کاربری | KURDNEZAM" };

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // ── Resolve display name ──────────────────────────────────────────────────
  let profileName: string | null = null;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();
    profileName = profile?.first_name ?? null;
  } catch {
    // non-fatal
  }

  // ── Resolve role ──────────────────────────────────────────────────────────
  // Primary: read roles array from JWT claims (injected by custom_access_token_hook)
  // Fallback: query user_roles table directly (works after migration 00018 adds
  //           the non-recursive self-read policy)
  let role: Role | null = null;
  try {
    const rolesFromJwt = await getUserRoles();
    if (rolesFromJwt.length > 0) {
      role = rolesFromJwt[0];
    } else {
      // JWT doesn't have roles claim yet (stale session or hook not fired).
      // Fall back to direct DB read — migration 00018 adds a self-read policy
      // so any authenticated user can read their own rows.
      const { data: rows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .limit(1);
      if (rows && rows.length > 0) {
        role = rows[0].role as Role;
      }
    }
  } catch {
    // non-fatal — sidebar will be empty, user can still log out
  }

  return (
    <AppShell profileName={profileName} role={role}>
      {children}
    </AppShell>
  );
}
