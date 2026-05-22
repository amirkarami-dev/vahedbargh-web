"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "./actions";

// ---- Static data ----
const KURDISTAN_CITIES = [
  { id: 101, name: "سنندج" },
  { id: 102, name: "مریوان" },
  { id: 103, name: "سقز" },
  { id: 104, name: "بانه" },
  { id: 105, name: "کامیاران" },
  { id: 106, name: "قروه" },
  { id: 107, name: "بیجار" },
  { id: 108, name: "دیواندره" },
];

const KURDISTAN_SECTIONS = [
  { id: 1001, name: "ناحیه ۱", cityId: 101 },
  { id: 1002, name: "ناحیه ۲", cityId: 101 },
  { id: 1003, name: "ناحیه ۳", cityId: 101 },
  { id: 1011, name: "ناحیه ۱", cityId: 102 },
  { id: 1012, name: "ناحیه ۲", cityId: 102 },
  { id: 1021, name: "ناحیه ۱", cityId: 103 },
  { id: 1031, name: "ناحیه ۱", cityId: 104 },
  { id: 1041, name: "ناحیه ۱", cityId: 105 },
  { id: 1051, name: "ناحیه ۱", cityId: 106 },
  { id: 1061, name: "ناحیه ۱", cityId: 107 },
  { id: 1071, name: "ناحیه ۱", cityId: 108 },
];

const BUILDING_TYPES = [
  { value: 1, label: "مسکونی" },
  { value: 2, label: "تجاری" },
  { value: 3, label: "اداری" },
  { value: 4, label: "صنعتی" },
  { value: 5, label: "عمومی" },
];

const BRANCHING_TYPES = [
  { value: 0, label: "خانگی" },
  { value: 1, label: "عمومی" },
  { value: 2, label: "صنعتی" },
  { value: 3, label: "سایر" },
  { value: 4, label: "انشعاب موجود" },
];

// ---- Shared styles ----
const inputClass =
  "px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] w-full";

// ---- Sub-components ----
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-[var(--text-primary)] pb-4 mb-5 border-b border-[var(--border-primary)]">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--text-secondary)]">
        {label}
        {required && <span className="text-red-400 mr-1">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

function CheckField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)] select-none"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-[var(--border-primary)] accent-[var(--accent-primary)]"
      />
      {label}
    </label>
  );
}

// ---- Boolean flags state type ----
interface BooleanFlags {
  isEarthSystem: boolean;
  panelNeed: boolean;
  isErtTest: boolean;
  isBuildingInspection: boolean;
  isTestAndDelivery: boolean;
  isBigProject: boolean;
  hasSupervision: boolean;
  hasRelatedPermit: boolean;
  needElectNetwork: boolean;
  isNeedEb: boolean;
}

const INITIAL_FLAGS: BooleanFlags = {
  isEarthSystem: false,
  panelNeed: false,
  isErtTest: false,
  isBuildingInspection: false,
  isTestAndDelivery: false,
  isBigProject: false,
  hasSupervision: false,
  hasRelatedPermit: false,
  needElectNetwork: false,
  isNeedEb: false,
};

// ---- Main form ----
export default function NewProjectForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const [cityId, setCityId] = useState("");
  const [flags, setFlags] = useState<BooleanFlags>(INITIAL_FLAGS);

  const filteredSections = cityId
    ? KURDISTAN_SECTIONS.filter((s) => s.cityId === Number(cityId))
    : [];

  function setFlag(key: keyof BooleanFlags, value: boolean) {
    setFlags((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const fd = new FormData(e.currentTarget);
    // Override boolean fields with explicit "true"/"false" strings
    (Object.entries(flags) as [keyof BooleanFlags, boolean][]).forEach(([k, v]) =>
      fd.set(k, String(v))
    );

    startTransition(async () => {
      const result = await createProject(fd);
      if (result.ok) {
        router.push("/app/projects");
      } else {
        setServerError(result.error ?? "خطا در ذخیره‌سازی");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl" dir="rtl">
      {serverError && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* ── Section 1: Owner ── */}
      <Section title="اطلاعات مالک">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="نام و نام خانوادگی مالک" required>
            <input
              name="landlordName"
              className={inputClass}
              placeholder="مثال: علی احمدی"
              required
            />
          </FormField>

          <FormField label="کد ملی" required>
            <input
              name="landlordNaCode"
              className={inputClass}
              placeholder="۱۰ رقم"
              maxLength={10}
              dir="ltr"
              pattern="\d{10}"
              title="کد ملی باید ۱۰ رقم عددی باشد"
              required
            />
          </FormField>

          <FormField label="شماره تماس" required>
            <input
              name="landlordPhoneNumber"
              type="tel"
              className={inputClass}
              placeholder="09xxxxxxxxx"
              dir="ltr"
              required
            />
          </FormField>

          <FormField label="نام شرکت">
            <input
              name="companyName"
              className={inputClass}
              placeholder="اختیاری"
            />
          </FormField>

          <FormField label="شماره پروانه">
            <input
              name="licenseNumber"
              className={inputClass}
              placeholder="اختیاری"
              dir="ltr"
            />
          </FormField>
        </div>
      </Section>

      {/* ── Section 2: Building ── */}
      <Section title="اطلاعات ساختمان">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <FormField label="نوع ساختمان" required>
            <select name="buildingType" defaultValue={1} className={inputClass}>
              {BUILDING_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>
                  {bt.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="تعداد طبقات" required>
            <input
              name="numberOfFloor"
              type="number"
              min={1}
              defaultValue={1}
              className={inputClass}
              dir="ltr"
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[var(--border-primary)]">
          {(
            [
              ["isEarthSystem", "سیستم ارت"],
              ["panelNeed", "نیاز به تابلو"],
              ["isErtTest", "آزمون ارت"],
              ["isBuildingInspection", "بازرسی ساختمان"],
              ["isTestAndDelivery", "تست و تحویل"],
              ["isBigProject", "پروژه بزرگ"],
              ["hasSupervision", "دارای ناظر"],
              ["hasRelatedPermit", "مجوز مرتبط"],
              ["needElectNetwork", "شبکه برق"],
              ["isNeedEb", "نیاز به EB"],
            ] as [keyof BooleanFlags, string][]
          ).map(([key, label]) => (
            <CheckField
              key={key}
              id={key}
              label={label}
              checked={flags[key]}
              onChange={(v) => setFlag(key, v)}
            />
          ))}
        </div>
      </Section>

      {/* ── Section 3: Location ── */}
      <Section title="موقعیت">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="استان">
            <input
              type="text"
              className={`${inputClass} opacity-60 cursor-not-allowed`}
              value="کردستان"
              readOnly
            />
          </FormField>

          <FormField label="شهر">
            <select
              name="cityId"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className={inputClass}
            >
              <option value="">انتخاب شهر</option>
              {KURDISTAN_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="ناحیه / بخش">
            <select
              name="sectionId"
              className={inputClass}
              disabled={!cityId}
            >
              <option value="">انتخاب ناحیه</option>
              {filteredSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="sm:col-span-1">
            <FormField label="آدرس" required>
              <input
                name="address"
                className={inputClass}
                placeholder="آدرس کامل ملک"
                required
              />
            </FormField>
          </div>

          <FormField label="کد پستی">
            <input
              name="postalCode"
              className={inputClass}
              placeholder="۱۰ رقم"
              maxLength={10}
              dir="ltr"
            />
          </FormField>

          <FormField label="عرض جغرافیایی (lat)">
            <input
              name="lat"
              type="number"
              step="any"
              className={inputClass}
              placeholder="مثال: 35.3219"
              dir="ltr"
            />
          </FormField>

          <FormField label="طول جغرافیایی (lng)">
            <input
              name="lng"
              type="number"
              step="any"
              className={inputClass}
              placeholder="مثال: 46.9987"
              dir="ltr"
            />
          </FormField>
        </div>
        <input type="hidden" name="provinceId" value="10" />
      </Section>

      {/* ── Section 4: Electrical / Description ── */}
      <Section title="اطلاعات تکمیلی">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="نوع انشعاب">
            <select name="projectTypeRequest" defaultValue={0} className={inputClass}>
              {BRANCHING_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>
                  {bt.label}
                </option>
              ))}
            </select>
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="توضیحات">
              <textarea
                name="description"
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder="توضیحات اضافی درباره پروژه..."
              />
            </FormField>
          </div>
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 disabled:opacity-60 transition-colors"
        >
          {isPending ? "در حال ذخیره…" : "ثبت پروژه"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/app/projects")}
          className="px-6 py-2.5 rounded-xl border border-[var(--border-primary)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}
