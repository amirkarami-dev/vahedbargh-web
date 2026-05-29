import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserRoles, hasRole, getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { BookOpen, Briefcase, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "گزارش من" };

export default async function ReportEngReportsPage() {
  const [user, roles] = await Promise.all([getCurrentUser(), getUserRoles()]);
  if (!user) redirect("/login");
  if (!hasRole(roles, "Engineer")) redirect("/app");

  const supabase = await createClient();

  // Resolve auth user → engineer record
  const { data: engRecord } = await supabase
    .from("engineers")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_delete", false)
    .maybeSingle();

  const engId = engRecord?.id ?? null;

  const [totalRes, completedRes, pendingRes, invoiceRes] = await Promise.all([
    engId
      ? supabase.from("elect_project_processes").select("id", { count: "exact", head: true }).eq("engineer_id", engId).eq("is_delete", false)
      : Promise.resolve({ count: 0 }),
    engId
      ? supabase.from("elect_project_processes").select("id", { count: "exact", head: true }).eq("engineer_id", engId).eq("inspection_status", 2).eq("is_delete", false)
      : Promise.resolve({ count: 0 }),
    engId
      ? supabase.from("elect_project_processes").select("id", { count: "exact", head: true }).eq("engineer_id", engId).eq("is_delete", false).neq("inspection_status", 2).neq("inspection_status", 99)
      : Promise.resolve({ count: 0 }),
    supabase.from("invoices").select("id, amount, status").eq("user_id", user.id),
  ]);

  const invoices = invoiceRes.data ?? [];
  const totalInvoiced = invoices.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const paidInvoiced = invoices.filter((i) => i.status === 2).reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const stats = [
    { label: "کل فرآیندها", value: (totalRes.count ?? 0).toLocaleString("fa-IR"), icon: Briefcase, color: "from-blue-500 to-cyan-500" },
    { label: "تکمیل‌شده", value: (completedRes.count ?? 0).toLocaleString("fa-IR"), icon: CheckCircle2, color: "from-green-500 to-emerald-500" },
    { label: "فعال", value: (pendingRes.count ?? 0).toLocaleString("fa-IR"), icon: Clock, color: "from-amber-500 to-orange-500" },
    { label: "مبلغ دریافتی", value: paidInvoiced.toLocaleString("fa-IR") + " ریال", icon: BookOpen, color: "from-violet-500 to-purple-500" },
  ];

  // Recent processes
  const { data: processes } = engId
    ? await supabase
        .from("elect_project_processes")
        .select("id, inspection_status, accepted, created_at, elect_projects(title, owner_name)")
        .eq("engineer_id", engId)
        .eq("is_delete", false)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const STATUS_LABEL: Record<number, { label: string; cls: string }> = {
    0: { label: "جدید", cls: "bg-blue-500/10 text-blue-400" },
    1: { label: "در جریان", cls: "bg-amber-500/10 text-amber-400" },
    2: { label: "تأیید شده", cls: "bg-green-500/10 text-green-400" },
    99: { label: "لغو شده", cls: "bg-red-500/10 text-red-400" },
  };

  return (
    <div className="p-6 md:p-8" dir="rtl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">گزارش من</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              خلاصه کارکرد و عملکرد شما
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
              <div className="mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums mb-1">{stat.value}</p>
              <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-primary)]">
          <BookOpen className="w-4 h-4 text-[var(--accent-primary)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">فرآیندهای اخیر</h2>
        </div>
        {!processes || processes.length === 0 ? (
          <div className="p-10 text-center">
            <AlertTriangle className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-30" />
            <p className="text-sm text-[var(--text-muted)]">فرآیندی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                  {["ردیف", "عنوان پرونده", "مالک", "وضعیت", "تاریخ"].map((h) => (
                    <th key={h} className="py-3 px-4 text-right text-xs font-medium text-[var(--text-muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processes.map((proc, idx) => {
                  const proj = proc.elect_projects as { title?: string; owner_name?: string } | null;
                  const st = STATUS_LABEL[proc.inspection_status as number] ?? STATUS_LABEL[0];
                  return (
                    <tr key={proc.id as string} className="border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className="py-3 px-4 text-xs text-[var(--text-muted)]">{(idx + 1).toLocaleString("fa-IR")}</td>
                      <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{proj?.title || "—"}</td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{proj?.owner_name || "—"}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-[var(--text-muted)]" dir="ltr">
                        {proc.created_at ? new Date(proc.created_at as string).toLocaleDateString("fa-IR") : "—"}
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
