/**
 * roles.ts — Server-side role utilities for the /app portal.
 *
 * Uses the custom_access_token_hook JWT claim (`roles` array) injected by
 * Supabase, matching the schema defined in 00004_auth_profiles.sql.
 *
 * This module is server-only (imports next/headers).
 */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// ─── Types ─────────────────────────────────────────────────────────────────

/**
 * The seven roles used in the /app portal.
 * Matches the CHECK constraint on user_roles.role in 00004_auth_profiles.sql.
 */
export type AppRole =
  | "Administrator"
  | "Engineer"
  | "Employee"
  | "Accountant"
  | "PanelMaker"
  | "ElectAdmin"
  | "Section";

// ─── Constants ─────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<AppRole, string> = {
  Administrator: "مدیر کل",
  Engineer:      "مهندس ناظر",
  Employee:      "کارمند",
  Accountant:    "حسابدار",
  PanelMaker:    "تابلوساز",
  ElectAdmin:    "کارشناس برق",
  Section:       "ناظر بخش",
};

export const ROLE_COLORS: Record<AppRole, string> = {
  Administrator: "text-purple-400 bg-purple-400/10",
  Engineer:      "text-blue-400 bg-blue-400/10",
  Employee:      "text-green-400 bg-green-400/10",
  Accountant:    "text-yellow-400 bg-yellow-400/10",
  PanelMaker:    "text-orange-400 bg-orange-400/10",
  ElectAdmin:    "text-cyan-400 bg-cyan-400/10",
  Section:       "text-pink-400 bg-pink-400/10",
};

/**
 * Priority order used when a user has multiple roles — the first match wins.
 * Highest privilege first.
 */
export const ROLE_PRIORITY: AppRole[] = [
  "Administrator",
  "ElectAdmin",
  "Employee",
  "Accountant",
  "PanelMaker",
  "Section",
  "Engineer",
];

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Returns true if `userRole` is non-null and appears in the `allowed` list.
 */
export function hasRole(
  userRole: AppRole | null,
  allowed: AppRole[]
): boolean {
  return userRole !== null && allowed.includes(userRole);
}

/**
 * Given an array of roles (e.g. from the JWT), returns the single highest-
 * priority AppRole, or null if none of the user's roles map to an AppRole.
 */
export function resolvePrimaryRole(roles: string[]): AppRole | null {
  return ROLE_PRIORITY.find((r) => roles.includes(r)) ?? null;
}

// ─── Server-side fetchers ──────────────────────────────────────────────────

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Returns the currently authenticated user's primary AppRole by decoding the
 * `roles` array from the Supabase JWT (injected by custom_access_token_hook).
 *
 * Falls back to a DB lookup against `user_roles` when the JWT claim is absent
 * (e.g. during local development without the hook configured).
 *
 * Returns `null` when:
 *  - The user is not authenticated
 *  - No AppRole is found in the JWT or DB
 */
export async function getCurrentUserRole(): Promise<AppRole | null> {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Read-only context (Server Component) — ignore
          }
        },
      },
    });

    // First try the JWT claim (fast path — no extra DB round-trip)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      const jwtRole = extractRoleFromJwt(session.access_token);
      if (jwtRole !== null) return jwtRole;
    }

    // Fallback: look up user_roles in the DB
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: rows, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (error || !rows || rows.length === 0) return null;

    const dbRoles = rows.map((r: { role: string }) => r.role);
    return resolvePrimaryRole(dbRoles);
  } catch {
    return null;
  }
}

/**
 * Returns ALL AppRoles for the currently authenticated user (from the JWT,
 * falling back to the DB). Useful when you need to check multiple roles.
 */
export async function getCurrentUserRoles(): Promise<AppRole[]> {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Read-only context — ignore
          }
        },
      },
    });

    // JWT fast path
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      const jwtRoles = extractRolesFromJwt(session.access_token);
      if (jwtRoles.length > 0) return jwtRoles;
    }

    // DB fallback
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: rows, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (error || !rows) return [];

    return rows
      .map((r: { role: string }) => r.role)
      .filter((r): r is AppRole => ROLE_PRIORITY.includes(r as AppRole));
  } catch {
    return [];
  }
}

// ─── JWT helpers (private) ─────────────────────────────────────────────────

interface JwtPayload {
  roles?: unknown;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;
    const padding = "=".repeat((4 - (payloadB64.length % 4)) % 4);
    const json = atob(
      payloadB64.replace(/-/g, "+").replace(/_/g, "/") + padding
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function extractRolesFromJwt(token: string): AppRole[] {
  const payload = decodeJwtPayload(token);
  if (!payload || !Array.isArray(payload.roles)) return [];
  return payload.roles.filter(
    (r): r is AppRole =>
      typeof r === "string" && ROLE_PRIORITY.includes(r as AppRole)
  );
}

function extractRoleFromJwt(token: string): AppRole | null {
  const roles = extractRolesFromJwt(token);
  return resolvePrimaryRole(roles);
}
