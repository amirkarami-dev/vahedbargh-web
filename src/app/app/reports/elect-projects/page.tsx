import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserRoles, hasRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { FileBarChart, FolderOpen, TrendingUp, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "گزارش پرونده‌ها" };

export default async function ReportElectProjectsPage() {
  const roles = await getUserRoles();
  if (!hasRole(roles, "Administrator")) redirect("/app");

  const supabase = await createClient();

  const [totalRes, pendingRes, completedRes, cancelledRes] = await Promise.all([
    supabase.from("elect_projects").select("id", { count: "exact", head: true }).eq("is_delete", false),
    supabase.from("elect_projects").select("id", { count: "exact", head: true }).eq("is_delete", false).eq("elect_project_status", 1),
    supabase.from("elect_projects").select("id", { count: "exact", head: true }).eq("is_delete", false).eq("elect_project_status", 2),
    supabase.from("elect_projects").select("id", { count: "exact", head: true }).eq("is_delete", false).eq("elect_project_status", 3),
  ]);

  const stats = [
    { label: "کل پرونده‌ها", value: totalRes.count ?? 0, icon: FolderOpen, color: "from-blue-500 to-cyan-500", textColor: "text-blue-400" },
    { label: "در جریان", value: pendingRes.count ?? 0, icon: Clock, color: "from-amber-500 to-orange-500", textColor: "text-amber-400" },
    { label: "تکمیل‌شده", value: completedRes.count ?? 0, icon: CheckCircle2, color: "from-green-500 to-emerald-500", textColor: "text-green-400" },
    { label: "لغو شده", value: cancelledRes.count ?? 0, icon: AlertTriangle, color: "from-red-500 to-rose-500", textColor: "text-red-400" },
  ];

  // Recent projects
  const { data: recentProjects } = await supabase
    .from("elect_projects")
    .select("id, title, owner_name, elect_project_status, created_at")
    .eq("is_delete", false)
    .order("created_at", { ascending: false })
    .limit(20);

  const STATUS_LABEL: Record<number, { label: string; cls: string }> = {
    0: { label: "جدید", cls: "bg-blue-500/10 text-blue-400" },
    1: { label: "در جریان", cls: "bg-amber-500/10 text-amber-400" },
    2: { label: "تکمیل‌شده", cls: "bg-green-500/10 text-green-400" },
    3: { label: "لغو شده", cls: "bg-red-500/10 text-red-400" },
  };

  return (
    <div className="p-6 md:p-8" dir="rtl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <FileBarChart className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">گزارش پرونده‌ها</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              آمار و گزارش کامل پرونده‌های برق ساختمانی
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className={`text-3xl font-bold tabular-nums mb-1 ${stat.textColor}`}>
                {stat.value.toLocaleString("fa-IR")}
              </p>
              <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent projects table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-primary)]">
          <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">آخرین پرونده‌های ثبت‌شده</h2>
        </div>
        {!recentProjects || recentProjects.length === 0 ? (
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
                    <th key={h} className="py-3 px-4 text-right text-xs font-medium text-[var(--text-muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((p, idx) => {
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
    </div>
  );
}
