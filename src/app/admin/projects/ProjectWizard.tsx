"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProject } from "./actions";

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

const FAZ_NUMBERS = [
  { value: 0, label: "تک‌فاز" },
  { value: 1, label: "سه‌فاز" },
  { value: 2, label: "انشعاب دائم" },
  { value: 3, label: "انشعاب موقت" },
];

const STEPS = ["اطلاعات مالک", "اطلاعات ساختمان", "موقعیت", "اطلاعات برقی"];

interface FormState {
  // Step 1
  landlordName: string;
  landlordNaCode: string;
  landlordPhoneNumber: string;
  companyName: string;
  licenseNumber: string;
  // Step 2
  buildingType: number;
  numberOfFloor: string;
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
  // Step 3
  cityId: string;
  sectionId: string;
  address: string;
  postalCode: string;
  lat: string;
  lng: string;
  // Step 4
  projectTypeRequest: number;
  fazNumber: number;
  description: string;
}

const INITIAL_STATE: FormState = {
  landlordName: "",
  landlordNaCode: "",
  landlordPhoneNumber: "",
  companyName: "",
  licenseNumber: "",
  buildingType: 1,
  numberOfFloor: "1",
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
  cityId: "",
  sectionId: "",
  address: "",
  postalCode: "",
  lat: "",
  lng: "",
  projectTypeRequest: 0,
  fazNumber: 0,
  description: "",
};

function CheckboxField({
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

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--text-primary)]">
        {label}
        {required && <span className="text-red-400 mr-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] w-full";

export default function ProjectWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const filteredSections = KURDISTAN_SECTIONS.filter(
    (s) => form.cityId === "" || s.cityId === Number(form.cityId)
  );

  function validateStep(stepIndex: number): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (stepIndex === 0) {
      if (!form.landlordName.trim()) newErrors.landlordName = "نام مالک الزامی است";
      if (!form.landlordNaCode.trim()) newErrors.landlordNaCode = "کد ملی الزامی است";
      else if (!/^\d{10}$/.test(form.landlordNaCode))
        newErrors.landlordNaCode = "کد ملی باید ۱۰ رقم باشد";
      if (!form.landlordPhoneNumber.trim()) newErrors.landlordPhoneNumber = "شماره تماس الزامی است";
    }
    if (stepIndex === 1) {
      if (!form.numberOfFloor || Number(form.numberOfFloor) < 1)
        newErrors.numberOfFloor = "تعداد طبقات الزامی است";
    }
    if (stepIndex === 2) {
      if (!form.address.trim()) newErrors.address = "آدرس الزامی است";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handlePrev() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit() {
    if (!validateStep(step)) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("landlordName", form.landlordName);
      fd.append("landlordNaCode", form.landlordNaCode);
      fd.append("landlordPhoneNumber", form.landlordPhoneNumber);
      if (form.companyName) fd.append("companyName", form.companyName);
      if (form.licenseNumber) fd.append("licenseNumber", form.licenseNumber);
      fd.append("buildingType", String(form.buildingType));
      fd.append("numberOfFloor", String(form.numberOfFloor));
      fd.append("isEarthSystem", String(form.isEarthSystem));
      fd.append("panelNeed", String(form.panelNeed));
      fd.append("isErtTest", String(form.isErtTest));
      fd.append("isBuildingInspection", String(form.isBuildingInspection));
      fd.append("isTestAndDelivery", String(form.isTestAndDelivery));
      fd.append("isBigProject", String(form.isBigProject));
      fd.append("hasSupervision", String(form.hasSupervision));
      fd.append("hasRelatedPermit", String(form.hasRelatedPermit));
      fd.append("needElectNetwork", String(form.needElectNetwork));
      fd.append("isNeedEb", String(form.isNeedEb));
      fd.append("provinceId", "10");
      if (form.cityId) fd.append("cityId", form.cityId);
      if (form.sectionId) fd.append("sectionId", form.sectionId);
      fd.append("address", form.address);
      if (form.postalCode) fd.append("postalCode", form.postalCode);
      if (form.lat) fd.append("lat", form.lat);
      if (form.lng) fd.append("lng", form.lng);
      fd.append("projectTypeRequest", String(form.projectTypeRequest));
      if (form.description) fd.append("description", form.description);

      const result = await saveProject(fd);
      if (result.ok) {
        router.push("/admin/projects");
      } else {
        setServerError(result.error ?? "خطا در ذخیره‌سازی");
      }
    });
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">پروژه جدید</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">ثبت پروژه نظارت برق</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step
                    ? "bg-[var(--accent-primary)] text-white"
                    : i === step
                    ? "bg-[var(--accent-primary)] text-white ring-4 ring-[var(--accent-primary)]/20"
                    : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-primary)]"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs hidden sm:inline ${
                  i === step
                    ? "text-[var(--text-primary)] font-medium"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors ${
                    i < step ? "bg-[var(--accent-primary)]" : "bg-[var(--border-primary)]"
                  }`}
                  style={{ minWidth: "2rem" }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="w-full h-1 bg-[var(--border-primary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent-primary)] transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
          مرحله {step + 1}: {STEPS[step]}
        </h2>

        {/* Step 1: Owner Info */}
        {step === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="نام و نام خانوادگی مالک" required>
              <input
                type="text"
                className={inputClass}
                value={form.landlordName}
                onChange={(e) => setField("landlordName", e.target.value)}
                placeholder="مثال: علی احمدی"
              />
              {errors.landlordName && (
                <span className="text-xs text-red-400">{errors.landlordName}</span>
              )}
            </FormField>

            <FormField label="کد ملی" required>
              <input
                type="text"
                className={inputClass}
                value={form.landlordNaCode}
                onChange={(e) => setField("landlordNaCode", e.target.value)}
                placeholder="۱۰ رقم"
                maxLength={10}
                dir="ltr"
              />
              {errors.landlordNaCode && (
                <span className="text-xs text-red-400">{errors.landlordNaCode}</span>
              )}
            </FormField>

            <FormField label="شماره تماس" required>
              <input
                type="tel"
                className={inputClass}
                value={form.landlordPhoneNumber}
                onChange={(e) => setField("landlordPhoneNumber", e.target.value)}
                placeholder="09xxxxxxxxx"
                dir="ltr"
              />
              {errors.landlordPhoneNumber && (
                <span className="text-xs text-red-400">{errors.landlordPhoneNumber}</span>
              )}
            </FormField>

            <FormField label="نام شرکت">
              <input
                type="text"
                className={inputClass}
                value={form.companyName}
                onChange={(e) => setField("companyName", e.target.value)}
                placeholder="اختیاری"
              />
            </FormField>

            <FormField label="شماره پروانه">
              <input
                type="text"
                className={inputClass}
                value={form.licenseNumber}
                onChange={(e) => setField("licenseNumber", e.target.value)}
                placeholder="اختیاری"
                dir="ltr"
              />
            </FormField>
          </div>
        )}

        {/* Step 2: Building Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="نوع ساختمان">
                <select
                  className={inputClass}
                  value={form.buildingType}
                  onChange={(e) => setField("buildingType", Number(e.target.value))}
                >
                  {BUILDING_TYPES.map((bt) => (
                    <option key={bt.value} value={bt.value}>
                      {bt.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="تعداد طبقات" required>
                <input
                  type="number"
                  className={inputClass}
                  value={form.numberOfFloor}
                  onChange={(e) => setField("numberOfFloor", e.target.value)}
                  min={1}
                  placeholder="1"
                  dir="ltr"
                />
                {errors.numberOfFloor && (
                  <span className="text-xs text-red-400">{errors.numberOfFloor}</span>
                )}
              </FormField>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-3">مشخصات فنی</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CheckboxField
                  id="isEarthSystem"
                  label="سیستم ارت"
                  checked={form.isEarthSystem}
                  onChange={(v) => setField("isEarthSystem", v)}
                />
                <CheckboxField
                  id="panelNeed"
                  label="نیاز به تابلو"
                  checked={form.panelNeed}
                  onChange={(v) => setField("panelNeed", v)}
                />
                <CheckboxField
                  id="isErtTest"
                  label="آزمون ارت"
                  checked={form.isErtTest}
                  onChange={(v) => setField("isErtTest", v)}
                />
                <CheckboxField
                  id="isBuildingInspection"
                  label="بازرسی ساختمان"
                  checked={form.isBuildingInspection}
                  onChange={(v) => setField("isBuildingInspection", v)}
                />
                <CheckboxField
                  id="isTestAndDelivery"
                  label="تست و تحویل"
                  checked={form.isTestAndDelivery}
                  onChange={(v) => setField("isTestAndDelivery", v)}
                />
                <CheckboxField
                  id="isBigProject"
                  label="پروژه بزرگ"
                  checked={form.isBigProject}
                  onChange={(v) => setField("isBigProject", v)}
                />
                <CheckboxField
                  id="hasSupervision"
                  label="دارای ناظر"
                  checked={form.hasSupervision}
                  onChange={(v) => setField("hasSupervision", v)}
                />
                <CheckboxField
                  id="hasRelatedPermit"
                  label="دارای مجوز مرتبط"
                  checked={form.hasRelatedPermit}
                  onChange={(v) => setField("hasRelatedPermit", v)}
                />
                <CheckboxField
                  id="needElectNetwork"
                  label="نیاز به شبکه برق"
                  checked={form.needElectNetwork}
                  onChange={(v) => setField("needElectNetwork", v)}
                />
                <CheckboxField
                  id="isNeedEb"
                  label="نیاز به EB"
                  checked={form.isNeedEb}
                  onChange={(v) => setField("isNeedEb", v)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="استان">
              <input
                type="text"
                className={`${inputClass} bg-[var(--bg-secondary)] opacity-60`}
                value="کردستان"
                readOnly
              />
            </FormField>

            <FormField label="شهر">
              <select
                className={inputClass}
                value={form.cityId}
                onChange={(e) => {
                  setField("cityId", e.target.value);
                  setField("sectionId", "");
                }}
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
                className={inputClass}
                value={form.sectionId}
                onChange={(e) => setField("sectionId", e.target.value)}
                disabled={!form.cityId}
              >
                <option value="">انتخاب ناحیه</option>
                {filteredSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="آدرس" required>
                <input
                  type="text"
                  className={inputClass}
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder="آدرس کامل ملک"
                />
                {errors.address && (
                  <span className="text-xs text-red-400">{errors.address}</span>
                )}
              </FormField>
            </div>

            <FormField label="کد پستی">
              <input
                type="text"
                className={inputClass}
                value={form.postalCode}
                onChange={(e) => setField("postalCode", e.target.value)}
                placeholder="۱۰ رقم"
                maxLength={10}
                dir="ltr"
              />
            </FormField>

            <FormField label="عرض جغرافیایی (lat)">
              <input
                type="text"
                className={inputClass}
                value={form.lat}
                onChange={(e) => setField("lat", e.target.value)}
                placeholder="مثال: 35.3219"
                dir="ltr"
              />
            </FormField>

            <FormField label="طول جغرافیایی (lng)">
              <input
                type="text"
                className={inputClass}
                value={form.lng}
                onChange={(e) => setField("lng", e.target.value)}
                placeholder="مثال: 46.9987"
                dir="ltr"
              />
            </FormField>
          </div>
        )}

        {/* Step 4: Electrical Info */}
        {step === 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="نوع انشعاب">
              <select
                className={inputClass}
                value={form.projectTypeRequest}
                onChange={(e) => setField("projectTypeRequest", Number(e.target.value))}
              >
                {BRANCHING_TYPES.map((bt) => (
                  <option key={bt.value} value={bt.value}>
                    {bt.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="فاز">
              <select
                className={inputClass}
                value={form.fazNumber}
                onChange={(e) => setField("fazNumber", Number(e.target.value))}
              >
                {FAZ_NUMBERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="توضیحات">
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={4}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="توضیحات اضافی درباره پروژه..."
                />
              </FormField>
            </div>

            <div className="sm:col-span-2 p-4 rounded-xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">آپلود اسناد</p>
              <p className="text-xs text-[var(--text-muted)]">
                پس از ذخیره پروژه، می‌توانید اسناد مرتبط (کارت ملی، نقشه برق، مجوزها) را از صفحه
                جزئیات پروژه آپلود نمایید.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {serverError && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={() =>
            step === 0 ? router.push("/admin/projects") : handlePrev()
          }
          className="px-5 py-2.5 rounded-xl border border-[var(--border-primary)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
        >
          {step === 0 ? "انصراف" : "قبلی"}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 transition-colors"
          >
            بعدی
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 transition-colors disabled:opacity-60"
          >
            {isPending ? "در حال ذخیره..." : "ذخیره پروژه"}
          </button>
        )}
      </div>
    </div>
  );
}
