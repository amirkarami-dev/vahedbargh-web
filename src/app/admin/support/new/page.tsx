"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createSupport } from "../actions";
import type { Metadata } from "next";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]";

export default function NewSupportPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string).trim();
    const description = (fd.get("description") as string).trim();
    const fileNumber = (fd.get("fileNumber") as string).trim() || undefined;

    if (!title || !description) {
      setError("عنوان و توضیحات اجباری است");
      return;
    }

    startTransition(async () => {
      const res = await createSupport(title, description, fileNumber);
      if (res.ok && res.id) {
        router.push(`/admin/support/${res.id}`);
      } else {
        setError("خطا در ایجاد تیکت. دوباره تلاش کنید.");
      }
    });
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href="/admin/support"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به لیست تیکت‌ها
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">تیکت جدید</h1>
        <p className="text-[var(--text-muted)] mt-1 text-sm">ارسال درخواست پشتیبانی جدید</p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              عنوان تیکت <span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              type="text"
              placeholder="مختصر و واضح بنویسید"
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              شماره پرونده (اختیاری)
            </label>
            <input
              name="fileNumber"
              type="text"
              placeholder="مثال: ۱۴۰۳-۰۰۱۲۳"
              className={inputCls}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              اگر تیکت مربوط به پروژه خاصی است، شماره پرونده را وارد کنید
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              توضیحات <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              rows={6}
              placeholder="مشکل یا درخواست خود را به طور کامل توضیح دهید…"
              className={`${inputCls} resize-none`}
              required
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-3 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 disabled:opacity-60 transition-colors"
            >
              {pending ? "در حال ارسال…" : "ارسال تیکت"}
            </button>
            <Link
              href="/admin/support"
              className="px-6 py-3 rounded-xl border border-[var(--border-primary)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors text-center"
            >
              انصراف
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
