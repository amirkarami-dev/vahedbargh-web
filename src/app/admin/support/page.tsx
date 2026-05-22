import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getSupports } from "./actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "پشتیبانی و تیکت‌ها" };

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function AdminSupportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status ?? "open";
  const search = params.search;

  const closed = status === "closed";
  const tickets = await getSupports({ closed, search });

  return (
    <div className="p-8">
      <AdminPageHeader
        title="پشتیبانی و تیکت‌ها"
        description={`${tickets.length} تیکت`}
        newHref="/admin/support/new"
        newLabel="تیکت جدید"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--border-primary)]">
        <Link
          href="/admin/support?status=open"
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            !closed
              ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          تیکت‌های باز
        </Link>
        <Link
          href="/admin/support?status=closed"
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            closed
              ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          تیکت‌های بسته
        </Link>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">شماره</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">عنوان</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">وضعیت</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">تعداد پیام</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">تاریخ</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)] tabular-nums">
                    {ticket.ticketNumber ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/support/${ticket.id}`}
                      className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      {ticket.title}
                    </Link>
                    {ticket.fileNumber && (
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        پرونده: {ticket.fileNumber}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {ticket.closed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/15 text-gray-400">
                        بسته
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400">
                        باز
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-muted)] tabular-nums">
                    {ticket.messageCount ?? 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-muted)]">
                    {ticket.solarCreated ?? new Date(ticket.createdAt).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/support/${ticket.id}`}
                      className="text-xs text-[var(--accent-primary)] hover:underline"
                    >
                      مشاهده
                    </Link>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                    {closed ? "تیکت بسته‌ای وجود ندارد" : "تیکت بازی وجود ندارد"}
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
