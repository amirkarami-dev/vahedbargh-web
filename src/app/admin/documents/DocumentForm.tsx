"use client";

import { useRef, useState, useTransition } from "react";
import type { Document } from "@/types";
import { Loader2 } from "lucide-react";

const CATEGORIES = [
  "نظام‌نامه",
  "دستورالعمل",
  "تعرفه",
  "فرم اجرایی",
  "بخشنامه",
  "چک‌لیست",
  "مقررات ملی ساختمان",
] as const;

interface DocumentFormProps {
  initial?: Partial<Document>;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}

export default function DocumentForm({ initial, action, submitLabel = "ذخیره" }: DocumentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    formData.set("featured", String(featured));
    startTransition(() => action(formData));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-primary)] pb-4">
          اطلاعات سند
        </h2>

        <Field label="عنوان سند" name="title" defaultValue={initial?.title} required />

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">دسته‌بندی</label>
            <select
              name="category"
              defaultValue={initial?.category ?? "فرم اجرایی"}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <Field label="نسخه (مثال: 1.0)" name="version" defaultValue={initial?.version ?? "1.0"} dir="ltr" />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Field label="تاریخ جلالی" name="jalaliDate" defaultValue={initial?.jalaliDate} dir="ltr" placeholder="1405/02/01" />
          <Field label="حجم فایل (مثال: ۲.۴ مگابایت)" name="fileSize" defaultValue={initial?.fileSize} />
        </div>

        <Field label="توضیحات" name="description" defaultValue={initial?.description} multiline />
        <Field
          label="لینک فایل"
          name="fileUrl"
          defaultValue={initial?.fileUrl}
          dir="ltr"
          placeholder="https://..."
        />
        <Field
          label="تگ‌ها (با کاما جدا کنید)"
          name="tags"
          defaultValue={initial?.tags?.join(", ")}
          placeholder="برق، ایمنی، نصب"
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFeatured((v) => !v)}
            className={`relative w-10 h-6 rounded-full transition-colors ${featured ? "bg-[var(--accent-primary)]" : "bg-[var(--border-primary)]"}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${featured ? "right-1" : "right-5"}`} />
          </button>
          <label className="text-sm text-[var(--text-secondary)]">نمایش به عنوان سند برجسته</label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label, name, defaultValue, required, dir, placeholder, multiline, rows = 3,
}: {
  label: string; name: string; defaultValue?: string; required?: boolean;
  dir?: "ltr" | "rtl"; placeholder?: string; multiline?: boolean; rows?: number;
}) {
  const cls = "w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-none";
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
        {label}{required && <span className="text-red-400 mr-1">*</span>}
      </label>
      {multiline
        ? <textarea name={name} defaultValue={defaultValue} rows={rows} dir={dir} placeholder={placeholder} className={cls} />
        : <input name={name} defaultValue={defaultValue} required={required} dir={dir} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}
