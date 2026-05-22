"use client";

import { useTransition } from "react";
import { approveEngPaymentList } from "../actions";

export default function ApproveButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      await approveEngPaymentList(id);
    });
  }

  return (
    <button
      onClick={handleApprove}
      disabled={isPending}
      className="px-3 py-1.5 text-xs rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20 disabled:opacity-50 transition-colors"
    >
      {isPending ? "…" : "تأیید"}
    </button>
  );
}
