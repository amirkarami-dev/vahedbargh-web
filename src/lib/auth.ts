import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { User, SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Role type — mirrors the roles injected by the custom_access_token_hook
// ---------------------------------------------------------------------------
export type Role =
  | "Administrator"
  | "SuperUser"
  | "Executor"
  | "Engineer"
  | "Accountant"
  | "Employee"
  | "PanelMaker"
  | "ElectAdmin"
  | "Section"
  | "Analyzer";

// ---------------------------------------------------------------------------
// requireAuth — use in Server Components / Server Actions that need a user.
// Redirects to /admin/login if no session is found.
// ---------------------------------------------------------------------------
export async function requireAuth(): Promise<{
  user: User;
  supabase: SupabaseClient;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  return { user, supabase };
}

// ---------------------------------------------------------------------------
// getCurrentUser — non-throwing variant for optional auth checks.
// Returns null instead of redirecting when there is no session.
// ---------------------------------------------------------------------------
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// getUserRoles — reads the `roles` array injected into the JWT by the
// custom_access_token_hook on the Supabase project.
// ---------------------------------------------------------------------------
export async function getUserRoles(): Promise<Role[]> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return [];

    // Decode the JWT payload (second segment, base64url-encoded JSON)
    const [, payloadB64] = session.access_token.split(".");
    if (!payloadB64) return [];

    const padding = "=".repeat((4 - (payloadB64.length % 4)) % 4);
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/") + padding);
    const payload = JSON.parse(json) as { roles?: unknown };

    if (!Array.isArray(payload.roles)) return [];

    return payload.roles.filter(
      (r): r is Role => typeof r === "string"
    ) as Role[];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// hasRole — convenience helper for checking whether a role list includes at
// least one of the required roles.
// ---------------------------------------------------------------------------
export function hasRole(roles: Role[], ...required: Role[]): boolean {
  return required.some((r) => roles.includes(r));
}
