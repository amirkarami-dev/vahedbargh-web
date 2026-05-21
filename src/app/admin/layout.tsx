import AdminSidebar from "@/components/admin/AdminSidebar";
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
  let profile: { first_name: string | null; last_name: string | null; avatar_url: string | null } | null = null;

  try {
    const { user, supabase } = await requireAuth();

    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("id", user.id)
      .single();

    profile = data ?? null;
  } catch {
    // requireAuth() calls redirect() internally when there is no session,
    // so this catch only fires for unexpected errors — redirect to login.
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
