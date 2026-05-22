"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownUp,
  FileText,
  CreditCard,
  Users,
  Filter,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import type { Transaction, Invoice } from "@/services/mock/accounting";
import type { EngPaymentSummary, ProjectOption } from "./actions";
import { registerPayment, markEngineerPayment } from "./actions";

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabId = "transactions" | "register" | "invoices" | "engineers";

interface Props {
  activeTab: string;
  transactions: Transaction[];
  invoices: Invoice[];
  engSummaries: EngPaymentSummary[];
  projects: ProjectOption[];
  isAdmin: boolean;
  filterType?: number;
  dateFrom: string;
  dateTo: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const TRANSACTION_TYPE: Record<number, { label: string; cls: string }> = {
  0: { label: "پرداخت", cls: "bg-green-500/10 text-green-400" },
  1: { label: "کارمزد", cls: "bg-blue-500/10 text-blue-400" },
  2: { label: "استرداد", cls: "bg-amber-500/10 text-amber-400" },
  3: { label: "سایر", cls: "bg-gray-500/10 text-gray-400" },
};

const TRANSACTION_STATUS: Record<number, { label: string; cls: string }> = {
  0: { label: "در انتظار", cls: "bg-amber-500/10 text-amber-400" },
  1: { label: "ناموفق", cls: "bg-red-500/10 text-red-400" },
  2: { label: "موفق", cls: "bg-green-500/10 text-green-400" },
};

const INVOICE_STATUS: Record<number, { label: string; cls: string }> = {
  0: { label: "در انتظار پرداخت", cls: "bg-amber-500/10 text-amber-400" },
  1: { label: "پرداخت شده", cls: "bg-green-500/10 text-green-400" },
  2: { label: "لغو شده", cls: "bg-red-500/10 text-red-400" },
};

function formatRial(n: number): string {
  return n.toLocaleString("fa-IR") + " ریال";
}

function Badge({
  label,
  cls,
}: {
  label: string;
  cls: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AccountingTabs({
  activeTab: initialTab,
  transactions,
  invoices,
  engSummaries,
  projects,
  isAdmin,
  filterType: initialFilterType,
  dateFrom: initialDateFrom,
  dateTo: initialDateTo,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<TabId>(
    (initialTab as TabId) ?? "transactions"
  );

  // Payment form state
  const [payProjectId, setPayProjectId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payType, setPayType] = useState("payment");
  const [payDate, setPayDate] = useState("");
  const [payDesc, setPayDesc] = useState("");
  const [payReceipt, setPayReceipt] = useState("");
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");

  const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "transactions", label: "تراکنش‌ها", icon: ArrowDownUp },
    { id: "register", label: "ثبت پرداخت", icon: CreditCard },
    { id: "invoices", label: "صورت‌حساب‌ها", icon: FileText },
    { id: "engineers", label: "پرداخت مهندسان", icon: Users },
  ];

  function handleTabChange(tab: TabId) {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    router.replace(url.toString(), { scroll: false });
  }

  async function handleRegisterPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPayError("");
    setPaySuccess("");

    const fd = new FormData();
    fd.set("projectId", payProjectId);
    fd.set("amount", payAmount);
    fd.set("type", payType);
    fd.set("jalaliDate", payDate);
    fd.set("description", payDesc);
    fd.set("receiptNumber", payReceipt);

    startTransition(async () => {
      const res = await registerPayment(fd);
      if (res.ok) {
        setPaySuccess("تراکنش با موفقیت ثبت شد.");
        setPayAmount("");
        setPayDesc("");
        setPayReceipt("");
        router.refresh();
      } else {
        setPayError(res.error ?? "خطا در ثبت تراکنش");
      }
    });
  }

  async function handleMarkPaid(engineerId: string, amount: number) {
    startTransition(async () => {
      const res = await markEngineerPayment(engineerId, amount);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[var(--border-primary)] mb-6 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === id
                ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Transactions ─────────────────────────────────────────────── */}
      {activeTab === "transactions" && (
        <div>
          {transactions.length === 0 ? (
            <EmptyState icon={ArrowDownUp} message="تراکنشی ثبت نشده است" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-primary)]">
                    {["شماره پروژه", "مبلغ", "نوع", "وضعیت", "تاریخ", "توضیحات"].map(
                      (h) => (
                        <th
                          key={h}
                          className="py-3 px-4 text-right text-xs font-semibold text-[var(--text-muted)] whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const typeInfo =
                      TRANSACTION_TYPE[tx.transactionType] ??
                      TRANSACTION_TYPE[3];
                    const statusInfo =
                      TRANSACTION_STATUS[tx.status] ?? TRANSACTION_STATUS[0];
                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        <td className="py-3 px-4 text-[var(--text-muted)] text-xs">
                          {tx.electProjectId?.slice(0, 8) ?? "—"}
                        </td>
                        <td className="py-3 px-4 font-medium text-[var(--text-primary)] tabular-nums">
                          {formatRial(tx.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge {...typeInfo} />
                        </td>
                        <td className="py-3 px-4">
                          <Badge {...statusInfo} />
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)] text-xs">
                          {tx.solarCreated ?? new Date(tx.createdAt).toLocaleDateString("fa-IR")}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)] text-xs max-w-[200px] truncate">
                          {tx.description ?? "—"}
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

      {/* ── Tab: Register Payment ─────────────────────────────────────────── */}
      {activeTab === "register" && (
        <div className="max-w-xl">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-6">
            ثبت تراکنش جدید
          </h2>

          {payError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {payError}
            </div>
          )}
          {paySuccess && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {paySuccess}
            </div>
          )}

          <form onSubmit={handleRegisterPayment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Project */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">
                  پروژه مرتبط (اختیاری)
                </label>
                <div className="relative">
                  <select
                    value={payProjectId}
                    onChange={(e) => setPayProjectId(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                  >
                    <option value="">انتخاب پروژه…</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fileNumber} — {p.landlordName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                </div>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)]">
                  مبلغ (ریال) <span className="text-red-400 mr-1">*</span>
                </label>
                <input
                  type="text"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="مثال: ۵۰۰۰۰۰"
                  required
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                />
              </div>

              {/* Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)]">
                  نوع تراکنش <span className="text-red-400 mr-1">*</span>
                </label>
                <div className="relative">
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value)}
                    required
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                  >
                    <option value="payment">پرداخت</option>
                    <option value="fee">کارمزد</option>
                    <option value="refund">استرداد</option>
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                </div>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)]">
                  تاریخ (شمسی)
                </label>
                <input
                  type="text"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  placeholder="مثال: ۱۴۰۳/۰۳/۱۵"
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                />
              </div>

              {/* Receipt */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)]">
                  شماره رسید
                </label>
                <input
                  type="text"
                  value={payReceipt}
                  onChange={(e) => setPayReceipt(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">
                  توضیحات
                </label>
                <textarea
                  value={payDesc}
                  onChange={(e) => setPayDesc(e.target.value)}
                  rows={3}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 disabled:opacity-60 transition-colors"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {isPending ? "در حال ثبت…" : "ثبت تراکنش"}
            </button>
          </form>
        </div>
      )}

      {/* ── Tab: Invoices ─────────────────────────────────────────────────── */}
      {activeTab === "invoices" && (
        <div>
          {invoices.length === 0 ? (
            <EmptyState icon={FileText} message="صورت‌حسابی وجود ندارد" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-primary)]">
                    {["شناسه پروژه", "مبلغ کل", "مبلغ نظارت", "وضعیت", "نوع پرداخت", "تاریخ"].map(
                      (h) => (
                        <th
                          key={h}
                          className="py-3 px-4 text-right text-xs font-semibold text-[var(--text-muted)] whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const statusInfo =
                      INVOICE_STATUS[inv.invoiceStatus] ?? INVOICE_STATUS[0];
                    return (
                      <tr
                        key={inv.id}
                        className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        <td className="py-3 px-4 text-[var(--text-muted)] text-xs">
                          {inv.electProjectId?.slice(0, 8) ?? "—"}
                        </td>
                        <td className="py-3 px-4 font-medium text-[var(--text-primary)] tabular-nums">
                          {formatRial(inv.amount)}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)] tabular-nums">
                          {formatRial(inv.amountSupervision)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge {...statusInfo} />
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)] text-xs">
                          {inv.invoicePayType === 0 ? "آنلاین" : "کارتخوان"}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)] text-xs">
                          {inv.solarCreated ?? new Date(inv.createdAt).toLocaleDateString("fa-IR")}
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

      {/* ── Tab: Engineer Payments ────────────────────────────────────────── */}
      {activeTab === "engineers" && (
        <div>
          {engSummaries.length === 0 ? (
            <EmptyState
              icon={Users}
              message="اطلاعات پرداخت مهندسان یافت نشد"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-primary)]">
                    {[
                      "نام مهندس",
                      "تعداد پروژه",
                      "مبلغ بدهی",
                      "پرداخت شده",
                      "مانده",
                      ...(isAdmin ? ["عملیات"] : []),
                    ].map((h) => (
                      <th
                        key={h}
                        className="py-3 px-4 text-right text-xs font-semibold text-[var(--text-muted)] whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {engSummaries.map((eng) => (
                    <tr
                      key={eng.engineerId}
                      className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {eng.engineerName}
                          </p>
                          {eng.bankAccount && (
                            <p
                              className="text-xs text-[var(--text-muted)]"
                              dir="ltr"
                            >
                              {eng.bankAccount}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-[var(--text-secondary)]">
                        {eng.projectCount.toLocaleString("fa-IR")}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-primary)] tabular-nums">
                        {formatRial(eng.totalOwed)}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 tabular-nums">
                        {formatRial(eng.totalPaid)}
                      </td>
                      <td className="py-3 px-4 tabular-nums">
                        <span
                          className={
                            eng.balance > 0
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }
                        >
                          {formatRial(eng.balance)}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4">
                          {eng.balance > 0 ? (
                            <button
                              onClick={() =>
                                handleMarkPaid(eng.engineerId, eng.balance)
                              }
                              disabled={isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              ثبت پرداخت
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              تسویه شده
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ElementType;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[var(--text-muted)]" />
      </div>
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  );
}
