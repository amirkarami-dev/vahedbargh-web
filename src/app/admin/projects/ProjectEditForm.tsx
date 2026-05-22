"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProject } from "./actions";
import type { ElectProject } from "@/services/mock/projects";

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
  { value: 0, label: "نامشخص" },
  { value: 1, label: "مسکونی" },
  { value: 2, label: "تجاری" },
  { value: 3, label: "اداری" },
  { value: 4, label: "صنعتی" },
  { value: 5, label: "عمومی" },
];

const input =
  "px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] w-full";

const select =
  "px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] w-full";

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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--text-secondary)]">
        {label}
        {required && <span className="text-red-400 mr-1">*</span>}
      </label>
      {children}
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

interface Props {
  project: ElectProject;
}

export default function ProjectEditForm({ project }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Local field state pre-populated from the project
  const [cityId, setCityId] = useState(String(project.cityId ?? ""));
  const [booleans, setBooleans] = useState({
    isEarthSystem: project.isEarthSystem,
    panelNeed: project.panelNeed,
    isErtTest: project.isErtTest,
    isBuildingInspection: project.isBuildingInspection,
    isTestAndDelivery: project.isTestAndDelivery,
    isBigProject: project.isBigProject,
    hasSupervision: project.hasSupervision,
    hasRelatedPermit: project.hasRelatedPermit,
    needElectNetwork: project.needElectNetwork,
    isNeedEb: project.isNeedEb,
  });

  const filteredSections = cityId
    ? KURDISTAN_SECTIONS.filter((s) => s.cityId === Number(cityId))
    : KURDISTAN_SECTIONS;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Append id so saveProject knows it's an update
    fd.set("id", project.id);

    // Overwrite boolean fields (checkboxes use "on"/"" by default)
    Object.entries(booleans).forEach(([k, v]) => fd.set(k, String(v)));

    startTransition(async () => {
      const result = await saveProject(fd);
      if (result.ok) {
        router.push(`/admin/projects/${project.id}`);
      } else {
        setError(result.error ?? "خطا در ذخیره‌سازی");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ── Section 1: Owner ── */}
      <Section title="اطلاعات مالک">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="نام مالک" required>
            <input
              name="landlordName"
              defaultValue={project.landlordName}
              className={input}
              required
            />
          </Field>
          <Field label="کد ملی" required>
            <input
              name="landlordNaCode"
              defaultValue={project.landlordNaCode}
              className={input}
              pattern="\d{10}"
              title="کد ملی باید ۱۰ رقم باشد"
              required
            />
          </Field>
          <Field label="شماره تماس" required>
            <input
              name="landlordPhoneNumber"
              defaultValue={project.landlordPhoneNumber}
              className={input}
              required
            />
          </Field>
          <Field label="نام شرکت">
            <input
              name="companyName"
              defaultValue={project.companyName ?? ""}
              className={input}
            />
          </Field>
          <Field label="شماره پروانه">
            <input
              name="licenseNumber"
              defaultValue={project.licenseNumber ?? ""}
              className={input}
            />
          </Field>
        </div>
      </Section>

      {/* ── Section 2: Building ── */}
      <Section title="اطلاعات ساختمان">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="نوع ساختمان" required>
            <select name="buildingType" defaultValue={project.buildingType} className={select}>
              {BUILDING_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>
                  {bt.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="تعداد طبقات" required>
            <input
              name="numberOfFloor"
              type="number"
              min={1}
              defaultValue={project.numberOfFloor}
              className={input}
              required
            />
          </Field>
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
            ] as [keyof typeof booleans, string][]
          ).map(([key, label]) => (
            <CheckField
              key={key}
              id={key}
              label={label}
              checked={booleans[key]}
              onChange={(v) => setBooleans((prev) => ({ ...prev, [key]: v }))}
            />
          ))}
        </div>
      </Section>

      {/* ── Section 3: Location ── */}
      <Section title="موقعیت">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="شهر">
            <select
              name="cityId"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className={select}
            >
              <option value="">انتخاب شهر</option>
              {KURDISTAN_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="بخش">
            <select
              name="sectionId"
              defaultValue={project.sectionId ?? ""}
              className={select}
            >
              <option value="">انتخاب بخش</option>
              {filteredSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="آدرس" required>
            <input
              name="address"
              defaultValue={project.address ?? ""}
              className={input}
              required
            />
          </Field>
          <Field label="کد پستی">
            <input
              name="postalCode"
              defaultValue={project.postalCode ?? ""}
              className={input}
            />
          </Field>
          <Field label="عرض جغرافیایی">
            <input
              name="lat"
              type="number"
              step="any"
              defaultValue={project.lat ?? ""}
              className={input}
            />
          </Field>
          <Field label="طول جغرافیایی">
            <input
              name="lng"
              type="number"
              step="any"
              defaultValue={project.lng ?? ""}
              className={input}
            />
          </Field>
        </div>
        {/* Province is always Kurdistan (10) */}
        <input type="hidden" name="provinceId" value="10" />
      </Section>

      {/* ── Section 4: Description ── */}
      <Section title="توضیحات">
        <Field label="توضیحات تکمیلی">
          <textarea
            name="description"
            defaultValue={project.description ?? ""}
            rows={4}
            className={`${input} resize-none`}
          />
        </Field>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 disabled:opacity-60 transition-colors"
        >
          {isPending ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl border border-[var(--border-primary)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}
