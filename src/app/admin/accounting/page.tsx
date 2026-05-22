import type { Metadata } from "next";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getTransactions, getInvoices, getEngPaymentTasks } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "حسابداری" };

// ─── Persian helpers ────────────────────────────────────────────────────────

function toPersianDigits(str: string): string {
  return str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function formatToman(rial: number): string {
  const toman = Math.round(rial / 10);
  return toPersianDigits(toman.toLocaleString("en-US")) + " تومان";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fa-IR");
}

// ─── Label maps ────────────────────────────────────────────────────────────

const TX_STATUS: Record<number, { label: string; cls: string }> = {
  0: { label: "در انتظار",   cls: "bg-yellow-500/15 text-yellow-400" },
  1: { label: "در حال پردازش", cls: "bg-blue-500/15 text-blue-400" },
  2: { label: "تأییدشده",    cls: "bg-green-500/15 text-green-400" },
  3: { label: "ناموفق",      cls: "bg-red-500/15 text-red-400" },
};

const TX_TYPE: Record<number, string> = {
  0: "آنلاین",
  1: "دستی",
  2: "مستقیم",
};

const INV_STATUS: Record<number, { label: string; cls: string }> = {
  0: { label: "در انتظار",  cls: "bg-yellow-500/15 text-yellow-400" },
  1: { label: "صادرشده",   cls: "bg-blue-500/15 text-blue-400" },
  2: { label: "پرداخت‌شده", cls: "bg-green-500/15 text-green-400" },
  3: { label: "لغوشده",    cls: "bg-red-500/15 text-red-400" },
};

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function AccountingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "transactions" } = await searchParams;

  const [transactions, invoices, engTasks] = await Promise.all([
    getTransactions(),
    getInvoices(),
    getEngPaymentTasks(),
  ]);

  const confirmedTotal = transactions
    .filter((t) => t.status === 2)
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingInvoices = invoices.filter((i) => i.invoiceStatus === 0).length;

  const tabs = [
    { key: "transactions", label: "تراکنش‌ها" },
    { key: "invoices",     label: "فاکتورها" },
    { key: "engineers",    label: "پرداخت مهندسان" },
  ];

  return (
    <div className="p-8">
      <AdminPageHeader title="حسابداری" description="مدیریت تراکنش‌ها، فاکتورها و پرداخت مهندسان" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-5">
          <p className="text-xs text-[var(--text-muted)] mb-1">مجموع تراکنش‌های تأیید‌شده</p>
          <p className="text-xl font-bold text-green-400">{formatToman(confirmedTotal)}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-5">
          <p className="text-xs text-[var(--text-muted)] mb-1">فاکتورهای در انتظار</p>
          <p className="text-xl font-bold text-yellow-400">
            {toPersianDigits(String(pendingInvoices))} فاکتور
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 mb-6 border-b border-[var(--border-primary)] pb-0">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/accounting?tab=${t.key}`}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-xl transition-colors border-b-2 ${
              tab === t.key
                ? "text-[var(--accent-primary)] border-[var(--accent-primary)] bg-[var(--accent-primary)]/5"
                : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Transactions tab */}
      {tab === "transactions" && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                  <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">شناسه</th>
                  <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">مبلغ</th>
                  <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">نوع</th>
                  <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">وضعیت</th>
                  <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">تاریخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {transactions.map((tx) => {
                  const statusInfo = TX_STATUS[tx.status] ?? { label: "نامشخص", cls: "bg-gray-500/15 text-gray-400" };
                  return (
                    <tr key={tx.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-[var(--text-muted)]">
                        {tx.id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-[var(--accent-primary)] tabular-nums">
                        {formatToman(tx.amount)}
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                        {TX_TYPE[tx.transactionType] ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--text-muted)]">
                        {tx.solarCreated ?? formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                      هیچ تراکنشی یافت نشد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices tab */}
      {tab === "invoices" && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                  <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">پروژه</th>
                  <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">مبلغ</th>
                  <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">مبلغ نظارت</th>
                  <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">وضعیت</th>
                  <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">تاریخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {invoices.map((inv) => {
                  const statusInfo = INV_STATUS[inv.invoiceStatus] ?? { label: "نامشخص", cls: "bg-gray-500/15 text-gray-400" };
                  return (
                    <tr key={inv.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)] font-mono">
                        {inv.electProjectId?.slice(0, 8) ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-[var(--accent-primary)] tabular-nums">
                        {formatToman(inv.amount)}
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--text-secondary)] tabular-nums">
                        {formatToman(inv.amountSupervision)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--text-muted)]">
                        {inv.solarCreated ?? formatDate(inv.createdAt)}
                      </td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                      هیچ فاکتوری یافت نشد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Engineers tab */}
      {tab === "engineers" && (
        <div className="space-y-4">
          {engTasks.map((task) => (
            <div
              key={task.id}
              className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {task.description ?? "دسته پرداخت بدون توضیح"}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {formatDate(task.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    task.isApproved
                      ? "bg-green-500/15 text-green-400"
                      : "bg-yellow-500/15 text-yellow-400"
                  }`}
                >
                  {task.isApproved ? "تأییدشده" : "در انتظار تأیید"}
                </span>
                <Link
                  href={`/admin/accounting/${task.id}`}
                  className="px-4 py-2 text-sm rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20 transition-colors"
                >
                  مشاهده جزئیات
                </Link>
              </div>
            </div>
          ))}
          {engTasks.length === 0 && (
            <div className="text-center py-12 text-sm text-[var(--text-muted)]">
              هیچ دسته پرداختی یافت نشد
            </div>
          )}
        </div>
      )}
    </div>
  );
}
