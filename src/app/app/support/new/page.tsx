"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  SendHorizonal,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createTicket } from "../actions";
import type { TicketPriority } from "../actions";

const inputCls =
  "px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)] transition-colors w-full";

const CATEGORIES = [
  "عمومی",
  "فنی",
  "مالی",
  "پروژه",
  "مهندسان",
  "سیستم",
];

const PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: "low", label: "عادی" },
  { value: "normal", label: "متوسط" },
  { value: "high", label: "مهم" },
  { value: "urgent", label: "فوری" },
];

export default function NewSupportTicketPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createTicket(fd);
      if (result.ok && result.id) {
        router.push(`/app/support/${result.id}`);
      } else if (result.ok) {
        router.push("/app/support");
      } else {
        setError(result.error ?? "خطا در ارسال تیکت");
      }
    });
  }

  return (
    <div className="p-6 sm:p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/app/support"
          className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          بازگشت به پشتیبانی
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          ارسال تیکت جدید
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          درخواست پشتیبانی خود را شرح دهید
        </p>
      </div>

      <div className="max-w-2xl">
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              عنوان <span className="text-red-400 mr-1">*</span>
            </label>
            <input
              name="title"
              required
              placeholder="عنوان مختصر مشکل یا درخواست…"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                دسته‌بندی
              </label>
              <select name="category" className={inputCls}>
                <option value="">انتخاب کنید…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                اولویت
              </label>
              <select name="priority" defaultValue="normal" className={inputCls}>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              توضیحات <span className="text-red-400 mr-1">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={6}
              placeholder="مشکل یا درخواست خود را به‌طور کامل شرح دهید…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 disabled:opacity-60 transition-colors"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <SendHorizonal className="w-4 h-4" />
              )}
              {isPending ? "در حال ارسال…" : "ارسال تیکت"}
            </button>
            <Link
              href="/app/support"
              className="px-6 py-2.5 rounded-xl border border-[var(--border-primary)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              انصراف
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
