import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getQuotas, approveQuota } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "سهمیه‌ها" };

function toPersianDigits(str: string): string {
  return str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function formatToman(rial: number): string {
  const toman = Math.round(rial / 10);
  return toPersianDigits(toman.toLocaleString("en-US")) + " تومان";
}

export default async function AdminQuotasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const isApproved = sp.status === "approved" ? true : sp.status === "pending" ? false : undefined;

  const quotas = await getQuotas({ isApproved });

  const pending = quotas.filter((q) => !q.isApproved).length;
  const approved = quotas.filter((q) => q.isApproved).length;

  return (
    <div className="p-8">
      <AdminPageHeader
        title="سهمیه‌های مهندسان"
        description="مدیریت و تأیید سهمیه فصلی مهندسان ناظر"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-5">
          <p className="text-xs text-[var(--text-muted)] mb-1">کل</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{toPersianDigits(String(quotas.length))}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-5">
          <p className="text-xs text-[var(--text-muted)] mb-1">در انتظار تأیید</p>
          <p className="text-2xl font-bold text-yellow-400">{toPersianDigits(String(pending))}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-5">
          <p className="text-xs text-[var(--text-muted)] mb-1">تأییدشده</p>
          <p className="text-2xl font-bold text-green-400">{toPersianDigits(String(approved))}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--border-primary)]">
        {(
          [
            ["", "همه"],
            ["pending", "در انتظار تأیید"],
            ["approved", "تأییدشده"],
          ] as const
        ).map(([val, label]) => {
          const active = (sp.status ?? "") === val;
          return (
            <a
              key={val}
              href={val ? `/admin/quotas?status=${val}` : "/admin/quotas"}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                active
                  ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {label}
            </a>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">مهندس</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">فصل</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">مانده مبلغ</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">مصرف مبلغ</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">مانده ERT</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">مصرف ERT</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">وضعیت</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {quotas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                    هیچ سهمیه‌ای یافت نشد
                  </td>
                </tr>
              ) : (
                quotas.map((quota) => (
                  <tr key={quota.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {quota.engineerName ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-muted)]">
                      {quota.quarterLabel ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-sm tabular-nums text-[var(--text-primary)]">
                      {formatToman(quota.amountRemaining)}
                    </td>
                    <td className="px-4 py-4 text-sm tabular-nums text-[var(--text-secondary)]">
                      {formatToman(quota.amountBurning)}
                    </td>
                    <td className="px-4 py-4 text-sm tabular-nums text-[var(--text-primary)]">
                      {toPersianDigits(String(quota.ertCountRemaining))}
                    </td>
                    <td className="px-4 py-4 text-sm tabular-nums text-[var(--text-secondary)]">
                      {toPersianDigits(String(quota.ertCountBurning))}
                    </td>
                    <td className="px-4 py-4">
                      {quota.isApproved ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-400">
                          تأییدشده
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/15 text-yellow-400">
                          در انتظار
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {!quota.isApproved && (
                        <form action={approveQuota.bind(null, quota.id)}>
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-colors"
                          >
                            تأیید
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
