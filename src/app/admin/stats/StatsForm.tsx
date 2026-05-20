"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { StatItem } from "@/types";

const AVAILABLE_ICONS = [
  { value: "FileCheck", label: "سند / پروانه" },
  { value: "Users", label: "کارشناس / کاربران" },
  { value: "Activity", label: "پروژه / فعالیت" },
  { value: "ShieldCheck", label: "بازرسی / ایمنی" },
  { value: "TrendingUp", label: "رشد / آمار" },
  { value: "Award", label: "جایزه / افتخار" },
  { value: "Building2", label: "ساختمان / سازمان" },
  { value: "ClipboardCheck", label: "گزارش / چک‌لیست" },
];

interface StatsFormProps {
  initial?: Partial<StatItem>;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}

export default function StatsForm({ initial, action, submitLabel = "ذخیره" }: StatsFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(formData);
      router.push("/admin/stats");
    });
  }

  const fieldCls =
    "w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-primary)] pb-4">
          مشخصات آمار
        </h2>

        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            عنوان <span className="text-red-400">*</span>
          </label>
          <input
            name="label"
            defaultValue={initial?.label}
            required
            placeholder="مثال: پروانه صادرشده"
            className={fieldCls}
          />
        </div>

        {/* Value + Suffix */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              مقدار عددی <span className="text-red-400">*</span>
            </label>
            <input
              name="value"
              type="number"
              defaultValue={initial?.value}
              required
              min={0}
              placeholder="مثال: 12480"
              dir="ltr"
              className={fieldCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              پسوند <span className="text-xs text-[var(--text-muted)]">(اختیاری، مثلاً +)</span>
            </label>
            <input
              name="suffix"
              defaultValue={initial?.suffix ?? ""}
              placeholder="مثال: +"
              dir="ltr"
              className={fieldCls}
            />
          </div>
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">آیکون</label>
          <select name="iconName" defaultValue={initial?.iconName ?? "FileCheck"} className={fieldCls}>
            {AVAILABLE_ICONS.map((icon) => (
              <option key={icon.value} value={icon.value}>
                {icon.label} ({icon.value})
              </option>
            ))}
          </select>
        </div>

        {/* Sort order */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            ترتیب نمایش <span className="text-xs text-[var(--text-muted)]">(عدد کمتر = اول)</span>
          </label>
          <input
            name="sortOrder"
            type="number"
            defaultValue={initial?.sortOrder ?? 0}
            min={0}
            dir="ltr"
            className={fieldCls}
          />
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
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-medium transition-all"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}
