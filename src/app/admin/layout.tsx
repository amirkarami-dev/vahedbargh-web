import AdminShell from "@/components/admin/AdminShell";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "پنل مدیریت | KURDNEZAM" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already redirects unauthenticated users, but we add a
  // server-component guard here as a defence-in-depth fallback.
  let profileName: string | null = null;

  try {
    const { user, supabase } = await requireAuth();

    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("id", user.id)
      .single();

    profileName = data?.first_name ?? null;
  } catch {
    // requireAuth() calls redirect() internally when there is no session,
    // so this catch only fires for unexpected errors — redirect to login.
    redirect("/admin/login");
  }

  return <AdminShell profileName={profileName}>{children}</AdminShell>;
}
