"use client";

import { useRef, useState, useTransition } from "react";
import type { Announcement } from "@/types";
import { Loader2 } from "lucide-react";

interface AnnouncementFormProps {
  initial?: Partial<Announcement>;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}

export default function AnnouncementForm({ initial, action, submitLabel = "ذخیره" }: AnnouncementFormProps) {
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
          اطلاعات اطلاعیه
        </h2>

        <Field label="عنوان" name="title" defaultValue={initial?.title} required />
        <Field label="اسلاگ (Slug)" name="slug" defaultValue={initial?.slug} dir="ltr" placeholder="persian-announcement-slug" />

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">اولویت</label>
            <select
              name="priority"
              defaultValue={initial?.priority ?? "info"}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            >
              <option value="urgent">فوری</option>
              <option value="important">مهم</option>
              <option value="info">اطلاعاتی</option>
            </select>
          </div>
          <Field label="دسته‌بندی" name="category" defaultValue={initial?.category ?? "عمومی"} />
        </div>

        <Field label="تاریخ جلالی (مثال: 1405/02/01)" name="jalaliDate" defaultValue={initial?.jalaliDate} dir="ltr" placeholder="1405/02/01" />
        <Field label="خلاصه" name="excerpt" defaultValue={initial?.excerpt} multiline />
        <Field label="متن کامل" name="content" defaultValue={initial?.content} multiline rows={10} />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFeatured((v) => !v)}
            className={`relative w-10 h-6 rounded-full transition-colors ${featured ? "bg-[var(--accent-primary)]" : "bg-[var(--border-primary)]"}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${featured ? "right-1" : "right-5"}`} />
          </button>
          <label className="text-sm text-[var(--text-secondary)]">نمایش به عنوان اطلاعیه برجسته</label>
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
  label,
  name,
  defaultValue,
  required,
  dir,
  placeholder,
  multiline,
  rows = 4,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  dir?: "ltr" | "rtl";
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const cls = "w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-none";
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
        {label}{required && <span className="text-red-400 mr-1">*</span>}
      </label>
      {multiline ? (
        <textarea name={name} defaultValue={defaultValue} rows={rows} dir={dir} placeholder={placeholder} className={cls} />
      ) : (
        <input name={name} defaultValue={defaultValue} required={required} dir={dir} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}
