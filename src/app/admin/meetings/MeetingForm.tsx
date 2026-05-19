"use client";

import { useRef, useState, useTransition } from "react";
import type { Meeting, Resolution } from "@/types";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface MeetingFormProps {
  initial?: Partial<Meeting>;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}

export default function MeetingForm({ initial, action, submitLabel = "ذخیره" }: MeetingFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [resolutions, setResolutions] = useState<Resolution[]>(
    initial?.resolutions ?? []
  );

  function addResolution() {
    setResolutions((prev) => [
      ...prev,
      { id: Date.now().toString(), text: "", status: "در انتظار" as Resolution["status"] },
    ]);
  }

  function updateResolution(idx: number, field: keyof Resolution, value: string) {
    setResolutions((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }

  function removeResolution(idx: number) {
    setResolutions((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    formData.set("resolutions", JSON.stringify(resolutions));
    startTransition(() => action(formData));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-primary)] pb-4">
          اطلاعات جلسه
        </h2>

        <div className="grid grid-cols-2 gap-5">
          <Field label="شماره جلسه" name="sessionNumber" defaultValue={String(initial?.sessionNumber ?? "")} type="number" />
          <Field label="تاریخ جلالی" name="jalaliDate" defaultValue={initial?.jalaliDate} dir="ltr" placeholder="1405/02/01" />
        </div>

        <Field label="موضوع جلسه" name="subject" defaultValue={initial?.subject} required />

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">نوع جلسه</label>
            <select
              name="type"
              defaultValue={initial?.type ?? "هیئت رئیسه"}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            >
              <option value="هیئت رئیسه">هیئت رئیسه</option>
              <option value="کمیته فنی">کمیته فنی</option>
              <option value="جلسه مشترک">جلسه مشترک</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">وضعیت</label>
            <select
              name="status"
              defaultValue={initial?.status ?? "برگزار شده"}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            >
              <option value="برگزار شده">برگزار شده</option>
              <option value="در دستور کار">در دستور کار</option>
              <option value="مصوبه صادر شد">مصوبه صادر شد</option>
              <option value="در حال پیگیری">در حال پیگیری</option>
            </select>
          </div>
        </div>

        <Field label="لینک PDF صورتجلسه" name="pdfUrl" defaultValue={initial?.pdfUrl} dir="ltr" placeholder="https://..." />

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            اعضای حاضر (هر نفر در یک خط)
          </label>
          <textarea
            name="attendees"
            defaultValue={initial?.attendees?.join("\n")}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-none"
          />
        </div>

        <Field label="یادداشت‌ها" name="notes" defaultValue={initial?.notes} multiline />
      </div>

      {/* Resolutions */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">مصوبات ({resolutions.length})</h2>
          <button
            type="button"
            onClick={addResolution}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-xs font-medium hover:bg-[var(--accent-primary)]/25 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            افزودن مصوبه
          </button>
        </div>

        {resolutions.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">مصوبه‌ای اضافه نشده</p>
        )}

        <div className="space-y-4">
          {resolutions.map((r, idx) => (
            <div key={r.id} className="bg-[var(--bg-secondary)] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-muted)]">مصوبه {idx + 1}</span>
                <button type="button" onClick={() => removeResolution(idx)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                value={r.text}
                onChange={(e) => updateResolution(idx, "text", e.target.value)}
                rows={2}
                placeholder="متن مصوبه..."
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-none"
              />
              <select
                value={r.status}
                onChange={(e) => updateResolution(idx, "status", e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
              >
                <option value="در انتظار">در انتظار</option>
                <option value="در دست اقدام">در دست اقدام</option>
                <option value="اجرا شده">اجرا شده</option>
              </select>
            </div>
          ))}
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
  label, name, defaultValue, required, dir, placeholder, multiline, rows = 3, type,
}: {
  label: string; name: string; defaultValue?: string; required?: boolean;
  dir?: "ltr" | "rtl"; placeholder?: string; multiline?: boolean; rows?: number; type?: string;
}) {
  const cls = "w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-none";
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
        {label}{required && <span className="text-red-400 mr-1">*</span>}
      </label>
      {multiline
        ? <textarea name={name} defaultValue={defaultValue} rows={rows} dir={dir} placeholder={placeholder} className={cls} />
        : <input type={type ?? "text"} name={name} defaultValue={defaultValue} required={required} dir={dir} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}
