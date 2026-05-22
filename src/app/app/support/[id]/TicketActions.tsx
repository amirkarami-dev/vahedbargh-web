"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, RefreshCw } from "lucide-react";
import { closeTicket, updateTicketStatus } from "../actions";
import type { TicketStatus } from "../actions";

interface TicketActionsProps {
  ticketId: string;
  currentStatus: TicketStatus;
  canClose: boolean;
  canChangeStatus: boolean;
}

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "باز" },
  { value: "in_progress", label: "در حال بررسی" },
  { value: "resolved", label: "حل شده" },
  { value: "closed", label: "بسته" },
];

export default function TicketActions({
  ticketId,
  currentStatus,
  canClose,
  canChangeStatus,
}: TicketActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (!confirm("آیا از بستن این تیکت اطمینان دارید؟")) return;
    setError(null);
    startTransition(async () => {
      const res = await closeTicket(ticketId);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error ?? "خطا در بستن تیکت");
      }
    });
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as TicketStatus;
    setError(null);
    startTransition(async () => {
      const res = await updateTicketStatus(ticketId, status);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error ?? "خطا در تغییر وضعیت");
      }
    });
  }

  if (!canClose && !canChangeStatus) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canChangeStatus && (
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
          <select
            value={currentStatus}
            onChange={handleStatusChange}
            disabled={pending}
            className="px-3 py-1.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] disabled:opacity-60"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {canClose && currentStatus !== "closed" && (
        <button
          onClick={handleClose}
          disabled={pending}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors disabled:opacity-60"
        >
          <Lock className="w-4 h-4" />
          بستن تیکت
        </button>
      )}

      {error && (
        <p className="text-xs text-red-400 w-full mt-1">{error}</p>
      )}
    </div>
  );
}
