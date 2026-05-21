"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { saveEngineer } from "./actions";

interface Engineer {
  id: string;
  clientId: string;
  userId?: string;
  fullName: string;
  naCode?: string;
  cellPhone?: string;
  email?: string;
  dadName?: string;
  tell?: string;
  address?: string;
  sectionId?: number;
  fieldType: number;
  educationType: number;
  bankAccountNumber?: string;
  defaultQuota: number;
  certOfTest: boolean;
  certOfEarth: boolean;
  certOfFiber: boolean;
  certOfInspection: boolean;
  inactive: boolean;
  bankAccountBlocked: boolean;
  has1Percent: boolean;
  hasQuarterIncrease: boolean;
  sortIndex: number;
  isDelete: boolean;
  solarBirthDate?: string;
  solarMembershipDate?: string;
  createdAt: string;
}

interface EngineerFormProps {
  initial?: Partial<Engineer>;
}

const SECTIONS = [
  { id: 1, name: "سنندج" },
  { id: 2, name: "سقز" },
  { id: 3, name: "مریوان" },
  { id: 4, name: "بانه" },
  { id: 5, name: "کامیاران" },
  { id: 6, name: "دیواندره" },
  { id: 7, name: "قروه" },
];

const FIELD_TYPES = [
  { value: 0, label: "برق" },
  { value: 1, label: "مکانیک" },
  { value: 2, label: "عمران" },
  { value: 3, label: "معماری" },
];

const EDUCATION_TYPES = [
  { value: 0, label: "دیپلم" },
  { value: 1, label: "فوق دیپلم" },
  { value: 2, label: "کارشناسی" },
  { value: 3, label: "کارشناسی ارشد" },
  { value: 4, label: "دکتری" },
];

export default function EngineerForm({ initial }: EngineerFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const fieldCls =
    "w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors";
  const labelCls = "block text-sm font-medium text-[var(--text-secondary)] mb-2";
  const cardCls = "bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-5";
  const sectionTitleCls =
    "text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-primary)] pb-4 mb-5";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    // Basic validation
    const fullName = (form.elements.namedItem("fullName") as HTMLInputElement).value.trim();
    if (!fullName) {
      window.alert("نام و نام خانوادگی الزامی است");
      return;
    }

    const naCode = (form.elements.namedItem("naCode") as HTMLInputElement).value.trim();
    if (naCode && !/^\d{10}$/.test(naCode)) {
      window.alert("کد ملی باید ۱۰ رقم باشد");
      return;
    }

    const formData = new FormData(form);
    startTransition(async () => {
      const result = await saveEngineer(formData);
      if (result.ok) {
        window.alert("اطلاعات با موفقیت ذخیره شد");
        router.push("/admin/engineers");
        router.refresh();
      } else {
        window.alert(result.error ?? "خطا در ذخیره اطلاعات");
      }
    });
  }

  const isEdit = Boolean(initial?.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      {/* Section 1: اطلاعات شخصی */}
      <div className={cardCls}>
        <h2 className={sectionTitleCls}>اطلاعات شخصی</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>
              نام و نام خانوادگی <span className="text-red-400">*</span>
            </label>
            <input
              name="fullName"
              defaultValue={initial?.fullName}
              required
              placeholder="مثال: سیروان احمدی"
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls}>کد ملی</label>
            <input
              name="naCode"
              defaultValue={initial?.naCode}
              placeholder="۱۰ رقم"
              dir="ltr"
              maxLength={10}
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls}>تلفن همراه</label>
            <input
              name="cellPhone"
              defaultValue={initial?.cellPhone}
              placeholder="09xxxxxxxxx"
              dir="ltr"
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls}>ایمیل</label>
            <input
              name="email"
              type="email"
              defaultValue={initial?.email}
              placeholder="example@email.com"
              dir="ltr"
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls}>نام پدر</label>
            <input
              name="dadName"
              defaultValue={initial?.dadName}
              placeholder="نام پدر"
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls}>تلفن ثابت</label>
            <input
              name="tell"
              defaultValue={initial?.tell}
              placeholder="087xxxxxxxx"
              dir="ltr"
              className={fieldCls}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>آدرس</label>
            <input
              name="address"
              defaultValue={initial?.address}
              placeholder="آدرس کامل"
              className={fieldCls}
            />
          </div>
        </div>
      </div>

      {/* Section 2: اطلاعات سازمانی */}
      <div className={cardCls}>
        <h2 className={sectionTitleCls}>اطلاعات سازمانی</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>بخش / ناحیه</label>
            <select
              name="sectionId"
              defaultValue={initial?.sectionId ?? ""}
              className={fieldCls}
            >
              <option value="">انتخاب کنید...</option>
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>رشته تخصصی</label>
            <select
              name="fieldType"
              defaultValue={initial?.fieldType ?? 0}
              className={fieldCls}
            >
              {FIELD_TYPES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>مدرک تحصیلی</label>
            <select
              name="educationType"
              defaultValue={initial?.educationType ?? 0}
              className={fieldCls}
            >
              {EDUCATION_TYPES.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>شماره حساب بانکی (شبا)</label>
            <input
              name="bankAccountNumber"
              defaultValue={initial?.bankAccountNumber}
              placeholder="IR..."
              dir="ltr"
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls}>کوتا پایه</label>
            <input
              name="defaultQuota"
              type="number"
              min={0}
              step="0.01"
              defaultValue={initial?.defaultQuota ?? 0}
              dir="ltr"
              className={fieldCls}
            />
          </div>
        </div>
      </div>

      {/* Section 3: تاریخ‌ها */}
      <div className={cardCls}>
        <h2 className={sectionTitleCls}>تاریخ‌ها</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>تاریخ تولد (شمسی)</label>
            <input
              name="solarBirthDate"
              defaultValue={initial?.solarBirthDate}
              placeholder="۱۳۶۵/۰۴/۱۲"
              dir="ltr"
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls}>تاریخ عضویت (شمسی)</label>
            <input
              name="solarMembershipDate"
              defaultValue={initial?.solarMembershipDate}
              placeholder="۱۳۹۰/۰۷/۰۱"
              dir="ltr"
              className={fieldCls}
            />
          </div>
        </div>
      </div>

      {/* Section 4: گواهینامه‌ها */}
      <div className={cardCls}>
        <h2 className={sectionTitleCls}>گواهینامه‌ها</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="certOfTest"
              defaultChecked={initial?.certOfTest}
              className="w-4 h-4 rounded accent-[var(--accent-primary)]"
            />
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              مدرک تست و تحویل
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="certOfEarth"
              defaultChecked={initial?.certOfEarth}
              className="w-4 h-4 rounded accent-[var(--accent-primary)]"
            />
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              مدرک ارت
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="certOfFiber"
              defaultChecked={initial?.certOfFiber}
              className="w-4 h-4 rounded accent-[var(--accent-primary)]"
            />
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              مدرک فیبر نوری
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="certOfInspection"
              defaultChecked={initial?.certOfInspection}
              className="w-4 h-4 rounded accent-[var(--accent-primary)]"
            />
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              گواهی بازرسی
            </span>
          </label>
        </div>
      </div>

      {/* Section 5: وضعیت */}
      <div className={cardCls}>
        <h2 className={sectionTitleCls}>وضعیت</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="inactive"
              defaultChecked={initial?.inactive}
              className="w-4 h-4 rounded accent-[var(--accent-primary)]"
            />
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              غیرفعال
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="bankAccountBlocked"
              defaultChecked={initial?.bankAccountBlocked}
              className="w-4 h-4 rounded accent-[var(--accent-primary)]"
            />
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              حساب بانکی مسدود
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="has1Percent"
              defaultChecked={initial?.has1Percent}
              className="w-4 h-4 rounded accent-[var(--accent-primary)]"
            />
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              کسر ۱٪ صندوق
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="hasQuarterIncrease"
              defaultChecked={initial?.hasQuarterIncrease}
              className="w-4 h-4 rounded accent-[var(--accent-primary)]"
            />
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              افزایش فصلی کوتا
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "ذخیره تغییرات" : "ثبت مهندس"}
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
