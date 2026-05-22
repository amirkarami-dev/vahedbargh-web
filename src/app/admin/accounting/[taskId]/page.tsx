import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getEngPaymentLists, getEngPaymentTasks, approveEngPaymentList } from "../actions";
import ApproveButton from "./ApproveButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "جزئیات پرداخت مهندسان" };

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

export default async function EngPaymentDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;

  const [tasks, lists] = await Promise.all([
    getEngPaymentTasks(),
    getEngPaymentLists(taskId),
  ]);

  const task = tasks.find((t) => t.id === taskId);

  return (
    <div className="p-8">
      <AdminPageHeader
        title={task?.description ?? "جزئیات دسته پرداخت"}
        description={task ? `ایجادشده در ${formatDate(task.createdAt)}` : undefined}
        backHref="/admin/accounting?tab=engineers"
        backLabel="بازگشت به پرداخت مهندسان"
      />

      {/* Header row with approve-all action */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[var(--text-muted)]">
          {toPersianDigits(String(lists.length))} رکورد پرداخت
        </p>
        {task && !task.isApproved && lists.length > 0 && (
          <form
            action={async () => {
              "use server";
              await Promise.all(lists.map((l) => approveEngPaymentList(l.id)));
            }}
          >
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              تأیید همه
            </button>
          </form>
        )}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">مهندس</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">مبلغ ناخالص</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">بیمه (۵٪)</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">صندوق (۱٪)</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">واحد برق (۷٪)</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">ارزش افزوده (۱۰٪)</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">خالص پرداختی</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">وضعیت</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {lists.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-[var(--text-muted)]">
                    {item.engineerId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-4 tabular-nums text-[var(--text-primary)]">
                    {formatToman(item.amountSystem)}
                  </td>
                  <td className="px-4 py-4 tabular-nums text-red-400">
                    {formatToman(item.deduction1)}
                  </td>
                  <td className="px-4 py-4 tabular-nums text-red-400">
                    {formatToman(item.deduction2)}
                  </td>
                  <td className="px-4 py-4 tabular-nums text-red-400">
                    {formatToman(item.deduction3)}
                  </td>
                  <td className="px-4 py-4 tabular-nums text-red-400">
                    {formatToman(item.deduction4)}
                  </td>
                  <td className="px-4 py-4 tabular-nums font-bold text-green-400">
                    {formatToman(item.sumAmountSystem)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.isApproved
                          ? "bg-green-500/15 text-green-400"
                          : "bg-yellow-500/15 text-yellow-400"
                      }`}
                    >
                      {item.isApproved ? "تأییدشده" : "در انتظار"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {!item.isApproved && <ApproveButton id={item.id} />}
                  </td>
                </tr>
              ))}
              {lists.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                    هیچ رکوردی یافت نشد
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
