"use client";

import { useState } from "react";
import type {
  EngWorkRow,
  QuotaRow,
  AdminStats,
  EngineerStats,
} from "./page";

// ─── Helpers ────────────────────────────────────────────────────────────────

function toPersian(n: number | string): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function formatToman(rial: number): string {
  return toPersian(Math.round(rial / 10).toLocaleString("en-US")) + " تومان";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number | string;
  colorClass: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-5 flex flex-col gap-2">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${colorClass}`}>
        {toPersian(value)}
      </p>
    </div>
  );
}

function WorkTable({ rows }: { rows: EngWorkRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = rows.filter((r) =>
    r.engineerName.includes(search)
  );

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی نام مهندس..."
          className="w-full max-w-xs px-4 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
        />
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">
                  نام مهندس
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  تعداد پروژه
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  تکمیل‌شده
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  در حال اجرا
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  درصد تکمیل
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {filtered.map((row) => {
                const completionPct =
                  row.total > 0
                    ? Math.round((row.completed / row.total) * 100)
                    : 0;
                return (
                  <tr
                    key={row.engineerId}
                    className="hover:bg-[var(--bg-secondary)]/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                      {row.engineerName}
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)] tabular-nums">
                      {toPersian(row.total)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400">
                        {toPersian(row.completed)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400">
                        {toPersian(row.inProgress)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[100px] bg-[var(--bg-secondary)] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-[var(--accent-primary)] rounded-full transition-all"
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--text-muted)] tabular-nums">
                          {toPersian(completionPct)}٪
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-[var(--text-muted)]"
                  >
                    {search ? "نتیجه‌ای یافت نشد" : "داده‌ای موجود نیست"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QuotaTable({ rows }: { rows: QuotaRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        {/* Table skeleton to show structure */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">
                  نام مهندس
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  دوره
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  سهمیه باقی‌مانده
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  مصرف‌شده
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  سهمیه ارت باقی‌مانده
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  ارت مصرف‌شده
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  وضعیت
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 text-[var(--text-muted)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                      در حال توسعه
                    </p>
                    <p className="text-xs text-[var(--text-muted)] max-w-xs text-center">
                      مدیریت سوخت سهمیه‌های مهندسین در حال توسعه است. ساختار جدول
                      آماده شده و به‌زودی داده‌های واقعی نمایش داده می‌شوند.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">
                نام مهندس
              </th>
              <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                دوره
              </th>
              <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                سهمیه باقی‌مانده
              </th>
              <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                مصرف‌شده
              </th>
              <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                سهمیه ارت باقی‌مانده
              </th>
              <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                ارت مصرف‌شده
              </th>
              <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                وضعیت
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-primary)]">
            {rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-[var(--bg-secondary)]/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                  {row.engineerName}
                </td>
                <td className="px-4 py-4 text-sm text-[var(--text-muted)]">
                  {row.quarterLabel}
                </td>
                <td className="px-4 py-4 text-sm text-[var(--accent-primary)] tabular-nums">
                  {formatToman(row.amountRemaining)}
                </td>
                <td className="px-4 py-4 text-sm text-red-400 tabular-nums">
                  {formatToman(row.amountBurning)}
                </td>
                <td className="px-4 py-4 text-sm text-[var(--text-secondary)] tabular-nums">
                  {toPersian(row.ertCountRemaining)}
                </td>
                <td className="px-4 py-4 text-sm text-[var(--text-muted)] tabular-nums">
                  {toPersian(row.ertCountBurning)}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      row.isApproved
                        ? "bg-green-500/15 text-green-400"
                        : "bg-yellow-500/15 text-yellow-400"
                    }`}
                  >
                    {row.isApproved ? "تأییدشده" : "در انتظار تأیید"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Tabs Component ─────────────────────────────────────────────────────

interface EngWorkTabsProps {
  isAdmin: boolean;
  workRows: EngWorkRow[];
  quotaRows: QuotaRow[];
  adminStats: AdminStats | null;
  engineerStats: EngineerStats | null;
}

export default function EngWorkTabs({
  isAdmin,
  workRows,
  quotaRows,
  adminStats,
  engineerStats,
}: EngWorkTabsProps) {
  const [activeTab, setActiveTab] = useState<"work" | "quota">("work");

  const tabs = [
    { key: "work" as const, label: "کارکرد مهندسین" },
    ...(isAdmin ? [{ key: "quota" as const, label: "مدیریت سهمیه‌ها" }] : []),
  ];

  return (
    <div>
      {/* Stats cards */}
      {isAdmin && adminStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="تعداد مهندسین فعال"
            value={adminStats.totalEngineers}
            colorClass="text-[var(--accent-primary)]"
          />
          <StatCard
            label="مجموع پروژه‌ها"
            value={adminStats.totalProjects}
            colorClass="text-[var(--text-primary)]"
          />
          <StatCard
            label="پروژه‌های تکمیل‌شده"
            value={adminStats.completedProjects}
            colorClass="text-green-400"
          />
        </div>
      )}

      {!isAdmin && engineerStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="پروژه‌های من"
            value={engineerStats.myTotal}
            colorClass="text-[var(--accent-primary)]"
          />
          <StatCard
            label="تکمیل‌شده"
            value={engineerStats.myCompleted}
            colorClass="text-green-400"
          />
          <StatCard
            label="در حال اجرا"
            value={engineerStats.myInProgress}
            colorClass="text-blue-400"
          />
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-[var(--border-primary)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-xl transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "text-[var(--accent-primary)] border-[var(--accent-primary)] bg-[var(--accent-primary)]/5"
                : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)] hover:border-[var(--border-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "work" && <WorkTable rows={workRows} />}
      {activeTab === "quota" && isAdmin && <QuotaTable rows={quotaRows} />}
    </div>
  );
}
