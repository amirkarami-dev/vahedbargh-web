import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserRoles, hasRole } from "@/lib/auth";
import {
  fetchSummaryStats,
  fetchTransactions,
  fetchInvoices,
  fetchEngPaymentSummaries,
  fetchProjectOptions,
} from "./actions";
import AccountingTabs from "./AccountingTabs";
import { Receipt, TrendingUp, Clock, Users } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "حسابداری" };

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatRial(amount: number): string {
  return amount.toLocaleString("fa-IR") + " ریال";
}

function toPersianDigits(str: string): string {
  return str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function AppAccountingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; type?: string; dateFrom?: string; dateTo?: string }>;
}) {
  // Role guard
  const roles = await getUserRoles();
  if (!hasRole(roles, "Administrator", "Engineer", "Accountant", "Section")) {
    redirect("/app");
  }

  const isAdmin = hasRole(roles, "Administrator");

  const params = await searchParams;
  const activeTab = params.tab ?? "transactions";
  const filterType =
    params.type !== undefined && params.type !== ""
      ? parseInt(params.type, 10)
      : undefined;
  const dateFrom = params.dateFrom ?? "";
  const dateTo = params.dateTo ?? "";

  // Parallel data fetch
  const [stats, transactions, invoices, engSummaries, projects] =
    await Promise.all([
      fetchSummaryStats(),
      fetchTransactions({
        transactionType: filterType,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
      fetchInvoices(),
      fetchEngPaymentSummaries(),
      fetchProjectOptions(),
    ]);

  const statCards = [
    {
      label: "مجموع تراکنش‌های تأیید‌شده",
      value: formatRial(stats.monthlyTransactionTotal),
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400",
    },
    {
      label: "فاکتورهای در انتظار",
      value: toPersianDigits(String(stats.pendingPaymentsCount)) + " فاکتور",
      icon: Clock,
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-400",
    },
    {
      label: "مجموع صورت‌حساب‌ها",
      value: formatRial(stats.totalInvoiced),
      icon: Receipt,
      color: "from-blue-500 to-cyan-500",
      textColor: "text-blue-400",
    },
    {
      label: "تعداد مهندسان",
      value: toPersianDigits(String(engSummaries.length)) + " نفر",
      icon: Users,
      color: "from-violet-500 to-purple-500",
      textColor: "text-violet-400",
    },
  ];

  return (
    <div className="p-6 md:p-8" dir="rtl">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              حسابداری
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              مدیریت تراکنش‌ها، پرداخت‌ها، صورت‌حساب‌ها و پرداخت مهندسان
            </p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className={`text-lg font-bold ${card.textColor} tabular-nums mb-1`}>
                {card.value}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Client-side tabs component */}
      <AccountingTabs
        activeTab={activeTab}
        transactions={transactions}
        invoices={invoices}
        engSummaries={engSummaries}
        projects={projects}
        isAdmin={isAdmin}
        filterType={filterType}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </div>
  );
}
