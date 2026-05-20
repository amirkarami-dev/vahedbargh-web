"use client";

import { useTransition, useState } from "react";
import { Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { saveSettingsAction } from "./actions";

const SETTINGS_SECTIONS = [
  {
    title: "اطلاعات سازمان",
    fields: [
      { key: "org_name",       label: "نام سازمان",     type: "text" },
      { key: "org_address",    label: "آدرس",            type: "text" },
      { key: "phone",          label: "تلفن تماس",       type: "text", dir: "ltr" },
      { key: "email",          label: "ایمیل",           type: "email", dir: "ltr" },
      { key: "working_hours",  label: "ساعات کاری",      type: "text" },
    ],
  },
  {
    title: "تنظیمات سایت",
    fields: [
      { key: "site_title",       label: "عنوان سایت",    type: "text" },
      { key: "site_description", label: "توضیح سایت",   type: "textarea" },
      { key: "footer_text",      label: "متن فوتر",      type: "textarea" },
    ],
  },
];

const fieldCls =
  "w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-none";

export default function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setStatus("idle");
    startTransition(async () => {
      const result = await saveSettingsAction(formData);
      if (result.ok) {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
        setErrorMsg(result.error ?? "خطای ناشناخته");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {SETTINGS_SECTIONS.map((section) => (
        <div
          key={section.title}
          className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-5"
        >
          <h2 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-primary)] pb-4">
            {section.title}
          </h2>

          {section.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  name={field.key}
                  rows={3}
                  defaultValue={initial[field.key] ?? ""}
                  className={fieldCls}
                />
              ) : (
                <input
                  name={field.key}
                  type={field.type}
                  dir={(field as { dir?: string }).dir as "ltr" | "rtl" | undefined}
                  defaultValue={initial[field.key] ?? ""}
                  className={fieldCls}
                />
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          ذخیره تنظیمات
        </button>

        {status === "saved" && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            تنظیمات با موفقیت ذخیره شد
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errorMsg}
          </div>
        )}
      </div>
    </form>
  );
}
