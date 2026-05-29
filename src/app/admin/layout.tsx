import AdminShell from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase-server";
import { getUserRoles, hasRole } from "@/lib/auth";

export const metadata = { title: "پنل مدیریت | KURDNEZAM" };

/**
 * Admin layout — decides whether to wrap with AdminShell.
 *
 * Route guarding is handled by the middleware (proxy.ts):
 *  • Unauthenticated users → redirected to /admin/login
 *  • Users without AdminPanel role → redirected to /admin/login?error=forbidden
 *
 * The layout itself does NOT redirect — it just renders the right container:
 *  • Authenticated + AdminPanel role → AdminShell (sidebar, header) + children
 *  • Anything else (login page, or edge-case miss) → bare children, no shell
 *
 * This prevents the redirect-loop that would occur if requireAdminPanelRole()
 * were called while rendering /admin/login itself.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Not authenticated — middleware should have redirected, but if we reach
    // here it's the login page; render bare children (the login form).
    if (!user) {
      return <>{children}</>;
    }

    // Check AdminPanel role
    const roles = await getUserRoles();
    if (!hasRole(roles, "AdminPanel", "Administrator")) {
      // No permission — render bare children (login page with ?error=forbidden)
      return <>{children}</>;
    }

    // Authorised — fetch display name and render the full admin shell
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle();

    return (
      <AdminShell profileName={profile?.first_name ?? null}>
        {children}
      </AdminShell>
    );
  } catch {
    // Unexpected error — render bare children (safe fallback)
    return <>{children}</>;
  }
}
