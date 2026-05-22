import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Inbox, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { getUserRoles, hasRole } from "@/lib/auth";
import { getTickets } from "./actions";
import type { Metadata } from "next";
import type { TicketStatus, TicketPriority } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "پشتیبانی" };

// ─── Badge helpers ────────────────────────────────────────────────────────────

const STATUS_MAP: Record<
  TicketStatus,
  { label: string; cls: string }
> = {
  open: {
    label: "باز",
    cls: "bg-blue-500/15 text-blue-400",
  },
  in_progress: {
    label: "در حال بررسی",
    cls: "bg-amber-500/15 text-amber-400",
  },
  resolved: {
    label: "حل شده",
    cls: "bg-green-500/15 text-green-400",
  },
  closed: {
    label: "بسته",
    cls: "bg-gray-500/15 text-gray-400",
  },
};

const PRIORITY_MAP: Record<
  TicketPriority,
  { label: string; cls: string }
> = {
  low: {
    label: "عادی",
    cls: "bg-gray-500/10 text-gray-400",
  },
  normal: {
    label: "متوسط",
    cls: "bg-blue-500/10 text-blue-300",
  },
  high: {
    label: "مهم",
    cls: "bg-orange-500/15 text-orange-400",
  },
  urgent: {
    label: "فوری",
    cls: "bg-red-500/15 text-red-400",
  },
};

function StatusBadge({ status }: { status: TicketStatus }) {
  const { label, cls } = STATUS_MAP[status] ?? STATUS_MAP.open;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const { label, cls } = PRIORITY_MAP[priority] ?? PRIORITY_MAP.normal;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { key: "all", label: "همه" },
  { key: "open", label: "باز" },
  { key: "in_progress", label: "در حال بررسی" },
  { key: "resolved", label: "حل شده" },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AppSupportPage({ searchParams }: PageProps) {
  // Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const roles = await getUserRoles();
  const isAdmin = hasRole(roles, "Administrator", "SuperUser", "Employee", "ElectAdmin", "Section");
  const isEngineer = hasRole(roles, "Engineer");

  const params = await searchParams;
  const activeStatus = params.status ?? "all";

  // Engineers only see their own tickets
  const { tickets, error } = await getTickets({
    status: activeStatus === "all" ? undefined : activeStatus,
    onlyMine: isEngineer && !isAdmin,
  });

  const tableUnavailable =
    error !== null &&
    (error.toLowerCase().includes("does not exist") ||
      error.toLowerCase().includes("relation") ||
      error.toLowerCase().includes("42p01"));

  return (
    <div className="p-6 md:p-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <Inbox className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              پشتیبانی و تیکت‌ها
            </h1>
            {!tableUnavailable && (
              <p className="text-sm text-[var(--text-muted)]">
                {tickets.length} تیکت
              </p>
            )}
          </div>
        </div>
        <Link
          href="/app/support/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          ارسال تیکت جدید
        </Link>
      </div>

      {/* Dev placeholder when table doesn't exist */}
      {tableUnavailable ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
              در حال توسعه
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-sm">
              ماژول پشتیبانی در حال آماده‌سازی است. به زودی فعال خواهد شد.
            </p>
          </div>
          <Link
            href="/app/support/new"
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            ارسال تیکت جدید
          </Link>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-[var(--border-primary)] overflow-x-auto">
            {TABS.map((tab) => (
              <Link
                key={tab.key}
                href={`/app/support?status=${tab.key}`}
                className={`px-5 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                  activeStatus === tab.key
                    ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Table */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">
                      عنوان
                    </th>
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                      دسته‌بندی
                    </th>
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                      وضعیت
                    </th>
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                      اولویت
                    </th>
                    {isAdmin && (
                      <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                        ثبت‌کننده
                      </th>
                    )}
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                      تاریخ
                    </th>
                    <th className="px-4 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-primary)]">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-[var(--bg-secondary)]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/app/support/${ticket.id}`}
                          className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                        >
                          {ticket.title}
                        </Link>
                        {ticket.description && (
                          <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">
                            {ticket.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                        {ticket.category ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-4 py-4">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-4 text-sm text-[var(--text-muted)]">
                          {ticket.creator_name ?? "—"}
                        </td>
                      )}
                      <td className="px-4 py-4 text-sm text-[var(--text-muted)]">
                        {new Date(ticket.created_at).toLocaleDateString(
                          "fa-IR"
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/app/support/${ticket.id}`}
                          className="text-xs text-[var(--accent-primary)] hover:underline whitespace-nowrap"
                        >
                          مشاهده
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {tickets.length === 0 && (
                    <tr>
                      <td
                        colSpan={isAdmin ? 7 : 6}
                        className="px-6 py-12 text-center text-sm text-[var(--text-muted)]"
                      >
                        تیکتی یافت نشد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
