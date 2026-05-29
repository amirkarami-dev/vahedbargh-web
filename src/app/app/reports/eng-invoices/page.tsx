import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserRoles, hasRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { FileText, Receipt, TrendingUp, Clock, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "فاکتور مهندسین" };

function formatRial(n: number): string {
  return n.toLocaleString("fa-IR") + " ریال";
}

export default async function ReportEngInvoicesPage() {
  const roles = await getUserRoles();
  if (!hasRole(roles, "Accountant")) redirect("/app");

  const supabase = await createClient();

  const [pendingRes, paidRes, totalRes] = await Promise.all([
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", 0),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", 2),
    supabase.from("invoices").select("id, amount, status"),
  ]);

  const invoices = totalRes.data ?? [];
  const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === 2)
    .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  const stats = [
    { label: "کل فاکتورها", value: invoices.length.toLocaleString("fa-IR"), icon: Receipt, color: "from-blue-500 to-cyan-500", textColor: "text-blue-400" },
    { label: "در انتظار پرداخت", value: (pendingRes.count ?? 0).toLocaleString("fa-IR"), icon: Clock, color: "from-amber-500 to-orange-500", textColor: "text-amber-400" },
    { label: "پرداخت‌شده", value: (paidRes.count ?? 0).toLocaleString("fa-IR"), icon: TrendingUp, color: "from-green-500 to-emerald-500", textColor: "text-green-400" },
    { label: "مجموع مبالغ", value: formatRial(totalAmount), icon: FileText, color: "from-violet-500 to-purple-500", textColor: "text-violet-400" },
  ];

  // Recent invoices
  const { data: recentInvoices } = await supabase
    .from("invoices")
    .select("id, amount, status, created_at, profiles(first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(20);

  const STATUS_LABEL: Record<number, { label: string; cls: string }> = {
    0: { label: "در انتظار", cls: "bg-amber-500/10 text-amber-400" },
    1: { label: "در پردازش", cls: "bg-blue-500/10 text-blue-400" },
    2: { label: "پرداخت‌شده", cls: "bg-green-500/10 text-green-400" },
    3: { label: "رد شده", cls: "bg-red-500/10 text-red-400" },
  };

  return (
    <div className="p-6 md:p-8" dir="rtl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">فاکتور مهندسین</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              گزارش فاکتورها و پرداخت‌های مهندسین
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
              <p className={`text-2xl font-bold tabular-nums mb-1 ${stat.textColor}`}>{stat.value}</p>
              <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-primary)]">
          <Receipt className="w-4 h-4 text-[var(--accent-primary)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">آخرین فاکتورها</h2>
        </div>
        {!recentInvoices || recentInvoices.length === 0 ? (
          <div className="p-10 text-center">
            <AlertTriangle className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-30" />
            <p className="text-sm text-[var(--text-muted)]">فاکتوری یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                  {["ردیف", "مهندس", "مبلغ", "وضعیت", "تاریخ"].map((h) => (
                    <th key={h} className="py-3 px-4 text-right text-xs font-medium text-[var(--text-muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv, idx) => {
                  const prof = inv.profiles as { first_name?: string; last_name?: string } | null;
                  const name = [prof?.first_name, prof?.last_name].filter(Boolean).join(" ") || "—";
                  const st = STATUS_LABEL[inv.status as number] ?? STATUS_LABEL[0];
                  return (
                    <tr key={inv.id as string} className="border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className="py-3 px-4 text-xs text-[var(--text-muted)]">{(idx + 1).toLocaleString("fa-IR")}</td>
                      <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{name}</td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]" dir="ltr">{formatRial(Number(inv.amount) || 0)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-[var(--text-muted)]" dir="ltr">
                        {inv.created_at ? new Date(inv.created_at as string).toLocaleDateString("fa-IR") : "—"}
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
