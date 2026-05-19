"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Save, CheckCircle } from "lucide-react";

const SETTINGS_SECTIONS = [
  {
    title: "اطلاعات سازمان",
    fields: [
      { key: "org_name", label: "نام سازمان", defaultValue: "سازمان نظام مهندسی ساختمان استان کردستان", type: "text" },
      { key: "org_address", label: "آدرس", defaultValue: "سنندج، میدان کوهنورد، ساختمان نظام مهندسی", type: "text" },
      { key: "phone", label: "تلفن تماس", defaultValue: "۰۸۷-۳۳۱۲۳۴۵۶", type: "text", dir: "ltr" },
      { key: "email", label: "ایمیل", defaultValue: "info@sebnb.ir", type: "email", dir: "ltr" },
      { key: "working_hours", label: "ساعات کاری", defaultValue: "شنبه تا چهارشنبه ۸ صبح تا ۴ بعد از ظهر", type: "text" },
    ],
  },
  {
    title: "تنظیمات سایت",
    fields: [
      { key: "site_title", label: "عنوان سایت", defaultValue: "SEBNB | سامانه یکپارچه دفتر اجرایی نظارت برق", type: "text" },
      { key: "site_description", label: "توضیح سایت", defaultValue: "سامانه مدیریت نظارت برق ساختمان استان کردستان", type: "textarea" },
      { key: "footer_text", label: "متن فوتر", defaultValue: "کلیه حقوق این سایت متعلق به سازمان نظام مهندسی ساختمان استان کردستان می‌باشد.", type: "textarea" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    SETTINGS_SECTIONS.forEach((s) => s.fields.forEach((f) => { init[f.key] = f.defaultValue; }));
    return init;
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="p-8">
      <AdminPageHeader title="تنظیمات سایت" description="مدیریت اطلاعات و تنظیمات کلی سامانه" />

      <div className="space-y-6 max-w-3xl">
        {SETTINGS_SECTIONS.map((section) => (
          <div key={section.title} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-primary)] pb-4">
              {section.title}
            </h2>
            {section.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={values[field.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-none"
                  />
                ) : (
                  <input
                    type={field.type}
                    dir={(field as { dir?: string }).dir as "ltr" | "rtl" | undefined}
                    value={values[field.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
            ذخیره تنظیمات
          </button>
          {saved && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              تغییرات ذخیره شد
            </div>
          )}
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-400">
          <strong>توجه:</strong> این تنظیمات در نسخه فعلی به صورت محلی ذخیره می‌شوند. برای اتصال به جدول <code className="text-amber-300 bg-amber-500/20 px-1 rounded">site_settings</code> در Supabase، لطفاً جدول را ایجاد کرده و سرویس متناظر را وصل کنید.
        </div>
      </div>
    </div>
  );
}
