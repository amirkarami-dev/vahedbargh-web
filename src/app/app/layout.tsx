import AppShell from "@/components/app/AppShell";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
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
    redirect("/app/login");
  }

  // Fetch user profile and role from DB
  let profileName: string | null = null;
  let role: Role | null = null;

  try {
    const [profileResult, roleResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single(),
    ]);

    profileName = profileResult.data?.first_name ?? null;
    role = (roleResult.data?.role as Role) ?? null;
  } catch {
    // Non-fatal: shell will render without profile name / role
  }

  return (
    <AppShell profileName={profileName} role={role}>
      {children}
    </AppShell>
  );
}
