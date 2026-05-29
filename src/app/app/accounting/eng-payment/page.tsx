import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserRoles, hasRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { CreditCard, Users, TrendingUp, Clock, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "پرداخت مهندسین" };

function formatRial(n: number): string {
  return n.toLocaleString("fa-IR") + " ریال";
}

export default async function EngPaymentPage() {
  const roles = await getUserRoles();
  if (!hasRole(roles, "Accountant")) redirect("/app");

  const supabase = await createClient();

  // Fetch invoices grouped by engineer (via profiles)
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, amount, status, created_at, user_id, profiles(first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  const safeInvoices = invoices ?? [];

  // Group by engineer
  const engineerMap = new Map<string, {
    name: string;
    total: number;
    paid: number;
    pending: number;
    count: number;
  }>();

  for (const inv of safeInvoices) {
    const prof = inv.profiles as { first_name?: string; last_name?: string } | null;
    const name = [prof?.first_name, prof?.last_name].filter(Boolean).join(" ") || "ناشناس";
    const uid = inv.user_id as string;
    const existing = engineerMap.get(uid) ?? { name, total: 0, paid: 0, pending: 0, count: 0 };
    existing.count += 1;
    existing.total += Number(inv.amount) || 0;
    if (inv.status === 2) existing.paid += Number(inv.amount) || 0;
    else if (inv.status === 0) existing.pending += Number(inv.amount) || 0;
    engineerMap.set(uid, existing);
  }

  const engineerRows = Array.from(engineerMap.values()).sort((a, b) => b.total - a.total);

  const totalAll = engineerRows.reduce((s, r) => s + r.total, 0);
  const totalPaid = engineerRows.reduce((s, r) => s + r.paid, 0);
  const totalPending = engineerRows.reduce((s, r) => s + r.pending, 0);

  return (
    <div className="p-6 md:p-8" dir="rtl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">پرداخت مهندسین</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              مدیریت و پیگیری پرداخت حق‌الزحمه مهندسین
            </p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: "جمع کل", value: formatRial(totalAll), icon: TrendingUp, color: "from-blue-500 to-cyan-500" },
          { label: "پرداخت‌شده", value: formatRial(totalPaid), icon: CreditCard, color: "from-green-500 to-emerald-500" },
          { label: "در انتظار", value: formatRial(totalPending), icon: Clock, color: "from-amber-500 to-orange-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
              <div className="mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums mb-1">{stat.value}</p>
              <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Engineers payment table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-primary)]">
          <Users className="w-4 h-4 text-[var(--accent-primary)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">خلاصه پرداخت به مهندسین</h2>
        </div>
        {error || engineerRows.length === 0 ? (
          <div className="p-10 text-center">
            <AlertTriangle className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-30" />
            <p className="text-sm text-[var(--text-muted)]">اطلاعاتی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                  {["نام مهندس", "تعداد فاکتور", "جمع کل", "پرداخت‌شده", "در انتظار"].map((h) => (
                    <th key={h} className="py-3 px-4 text-right text-xs font-medium text-[var(--text-muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {engineerRows.map((eng) => (
                  <tr key={eng.name} className="border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{eng.name}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{eng.count.toLocaleString("fa-IR")}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]" dir="ltr">{formatRial(eng.total)}</td>
                    <td className="py-3 px-4 text-green-400" dir="ltr">{formatRial(eng.paid)}</td>
                    <td className="py-3 px-4 text-amber-400" dir="ltr">{formatRial(eng.pending)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
