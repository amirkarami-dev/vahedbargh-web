import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { getUserRoles, hasRole } from "@/lib/auth";
import { getTicketById } from "../actions";
import ReplyForm from "./ReplyForm";
import TicketActions from "./TicketActions";
import type { Metadata } from "next";
import type { TicketStatus, TicketPriority } from "../actions";

export const dynamic = "force-dynamic";

// ─── Badge helpers ────────────────────────────────────────────────────────────

const STATUS_MAP: Record<TicketStatus, { label: string; cls: string }> = {
  open: { label: "باز", cls: "bg-blue-500/15 text-blue-400" },
  in_progress: { label: "در حال بررسی", cls: "bg-amber-500/15 text-amber-400" },
  resolved: { label: "حل شده", cls: "bg-green-500/15 text-green-400" },
  closed: { label: "بسته", cls: "bg-gray-500/15 text-gray-400" },
};

const PRIORITY_MAP: Record<TicketPriority, { label: string; cls: string }> = {
  low: { label: "عادی", cls: "bg-gray-500/10 text-gray-400" },
  normal: { label: "متوسط", cls: "bg-blue-500/10 text-blue-300" },
  high: { label: "مهم", cls: "bg-orange-500/15 text-orange-400" },
  urgent: { label: "فوری", cls: "bg-red-500/15 text-red-400" },
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { ticket } = await getTicketById(id);
  return { title: ticket ? `تیکت: ${ticket.title}` : "جزئیات تیکت" };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AppSupportDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const roles = await getUserRoles();
  const isAdmin = hasRole(
    roles,
    "Administrator",
    "SuperUser",
    "Employee",
    "ElectAdmin",
    "Section"
  );

  const { ticket, replies, error, currentUserId } = await getTicketById(id);

  // Table doesn't exist yet
  const tableUnavailable =
    error !== null &&
    (error.toLowerCase().includes("does not exist") ||
      error.toLowerCase().includes("relation") ||
      error.toLowerCase().includes("42p01"));

  if (tableUnavailable) {
    return (
      <div className="p-6 md:p-8 max-w-3xl" dir="rtl">
        <Link
          href="/app/support"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به لیست تیکت‌ها
        </Link>
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
              در حال توسعه
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              ماژول پشتیبانی در حال آماده‌سازی است.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    notFound();
  }

  const statusInfo = STATUS_MAP[ticket.status] ?? STATUS_MAP.open;
  const priorityInfo = PRIORITY_MAP[ticket.priority] ?? PRIORITY_MAP.normal;

  // Who can close / change status
  const isCreator = ticket.created_by === currentUserId;
  const canClose = isAdmin || isCreator;
  const canChangeStatus = isAdmin;
  const isClosed = ticket.status === "closed";

  return (
    <div className="p-6 md:p-8 max-w-3xl" dir="rtl">
      {/* Back */}
      <Link
        href="/app/support"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به لیست تیکت‌ها
      </Link>

      {/* Ticket header card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 mb-6">
        <div className="flex flex-col gap-4">
          {/* Top row: badges + actions */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.cls}`}
              >
                {statusInfo.label}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.cls}`}
              >
                {priorityInfo.label}
              </span>
              {ticket.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                  {ticket.category}
                </span>
              )}
            </div>

            <TicketActions
              ticketId={ticket.id}
              currentStatus={ticket.status}
              canClose={canClose}
              canChangeStatus={canChangeStatus}
            />
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {ticket.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
            <span>
              ثبت شده:{" "}
              {new Date(ticket.created_at).toLocaleDateString("fa-IR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {ticket.creator_name && (
              <span>توسط: {ticket.creator_name}</span>
            )}
            {ticket.updated_at && (
              <span>
                آخرین به‌روزرسانی:{" "}
                {new Date(ticket.updated_at).toLocaleDateString("fa-IR")}
              </span>
            )}
          </div>

          {/* Description */}
          {ticket.description && (
            <div className="pt-4 border-t border-[var(--border-primary)]">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation thread */}
      <div className="space-y-3 mb-6">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] px-1">
          پیام‌ها
        </h2>

        {replies.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl py-10 text-center text-sm text-[var(--text-muted)]">
            هنوز پیامی ارسال نشده است
          </div>
        ) : (
          replies.map((reply) => {
            const isMine = reply.created_by === currentUserId;
            return (
              <div
                key={reply.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-5 py-3 ${
                    isMine
                      ? "bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20"
                      : "bg-[var(--bg-card)] border border-[var(--border-primary)]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      {reply.author_name ?? (isMine ? "شما" : "کاربر")}
                    </span>
                    <span className="text-[var(--text-muted)] text-xs">·</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(reply.created_at).toLocaleTimeString("fa-IR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(reply.created_at).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                    {reply.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply form — hidden if ticket is closed */}
      {!isClosed ? (
        <ReplyForm ticketId={ticket.id} />
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-sm text-[var(--text-muted)] text-center">
          این تیکت بسته شده است و امکان ارسال پیام وجود ندارد
        </div>
      )}
    </div>
  );
}
