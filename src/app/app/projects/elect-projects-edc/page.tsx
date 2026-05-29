import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserRoles, hasRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { Zap, FolderOpen, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "پرونده‌های EDC" };

const STATUS_LABEL: Record<number, { label: string; cls: string }> = {
  0: { label: "جدید", cls: "bg-blue-500/10 text-blue-400" },
  1: { label: "در جریان", cls: "bg-amber-500/10 text-amber-400" },
  2: { label: "تکمیل‌شده", cls: "bg-green-500/10 text-green-400" },
  3: { label: "لغو شده", cls: "bg-red-500/10 text-red-400" },
};

export default async function ElectProjectsEdcPage() {
  const roles = await getUserRoles();
  if (!hasRole(roles, "ElectAdmin")) {
    redirect("/app");
  }

  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from("elect_projects")
    .select("id, title, owner_name, elect_project_status, created_at")
    .eq("is_delete", false)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="p-6 md:p-8" dir="rtl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">پرونده‌های EDC</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              مدیریت پرونده‌های توزیع برق (شرکت برق)
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-10 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3 opacity-60" />
          <p className="text-sm text-[var(--text-muted)]">بارگذاری اطلاعات ممکن نشد</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
          {!projects || projects.length === 0 ? (
            <div className="p-10 text-center">
              <FolderOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-30" />
              <p className="text-sm text-[var(--text-muted)]">پرونده‌ای یافت نشد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                    {["ردیف", "عنوان پرونده", "مالک", "وضعیت", "تاریخ ثبت"].map((h) => (
                      <th key={h} className="py-3 px-4 text-right text-xs font-medium text-[var(--text-muted)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, idx) => {
                    const st = STATUS_LABEL[p.elect_project_status as number] ?? STATUS_LABEL[0];
                    return (
                      <tr key={p.id as string} className="border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                        <td className="py-3 px-4 text-xs text-[var(--text-muted)]">{(idx + 1).toLocaleString("fa-IR")}</td>
                        <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{(p.title as string) || "—"}</td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{(p.owner_name as string) || "—"}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${st.cls}`}>{st.label}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-[var(--text-muted)]" dir="ltr">
                          {p.created_at ? new Date(p.created_at as string).toLocaleDateString("fa-IR") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
