"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
  label?: string;
}

export default function DeleteButton({ onDelete, label = "حذف" }: DeleteButtonProps) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--text-muted)]">مطمئن هستید؟</span>
        <button
          onClick={() => startTransition(async () => { await onDelete(); })}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "بله، حذف"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-muted)] text-xs hover:text-[var(--text-primary)] transition-colors"
        >
          انصراف
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 text-xs transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
