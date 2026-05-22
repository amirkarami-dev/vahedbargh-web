import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserRoles, hasRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import {
  Database,
  MapPin,
  Users,
  Settings2,
  Wrench,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "اطلاعات پایه" };

// ─── City / Section data (static) ────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface Engineer {
  id: string;
  fullName: string;
  cellPhone?: string | null;
  licenseNumber?: string | null;
  fieldType: number;
  isActive: boolean;
}

const FIELD_TYPE_LABEL: Record<number, string> = {
  0: "برق قدرت",
  1: "برق الکترونیک",
  2: "الکترومکانیک",
};

// ─── Section Card ─────────────────────────────────────────────────────────────

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[var(--border-primary)]">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-[var(--accent-primary)]" />
        </div>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BaseInfoPage() {
  const roles = await getUserRoles();
  if (!hasRole(roles, "Administrator", "Employee")) {
    redirect("/app");
  }

  const isAdmin = hasRole(roles, "Administrator");

  // Fetch engineers from DB (graceful fallback)
  let engineers: Engineer[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("engineers")
      .select(
        "id, full_name, cell_phone, license_number, field_type, is_active"
      )
      .order("full_name");

    engineers = (data ?? []).map((r) => ({
      id: r.id as string,
      fullName: (r.full_name as string) ?? "—",
      cellPhone: r.cell_phone as string | null,
      licenseNumber: r.license_number as string | null,
      fieldType: Number(r.field_type ?? 0),
      isActive: (r.is_active as boolean) ?? true,
    }));
  } catch {
    // Engineers table might not exist yet — show empty state
  }

  const activeEngineers = engineers.filter((e) => e.isActive);

  return (
    <div className="p-6 sm:p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              اطلاعات پایه
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              مهندسان، شهرها، بخش‌ها و تنظیمات پایه سامانه
            </p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "مهندسان فعال", value: activeEngineers.length, color: "text-blue-400" },
          { label: "کل مهندسان", value: engineers.length, color: "text-[var(--text-primary)]" },
          { label: "شهرهای استان", value: KURDISTAN_CITIES.length, color: "text-emerald-400" },
          { label: "بخش‌ها", value: KURDISTAN_SECTIONS.length, color: "text-purple-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-4 text-center"
          >
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>
              {s.value.toLocaleString("fa-IR")}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Engineers */}
        <Card title="فهرست مهندسان ناظر" icon={Users}>
          {engineers.length === 0 ? (
            <div className="text-center py-10">
              <Wrench className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-30" />
              <p className="text-sm text-[var(--text-muted)]">
                اطلاعات مهندسان بارگذاری نشده است
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-primary)]">
                    {["نام", "تخصص", "شماره تماس", "وضعیت"].map((h) => (
                      <th
                        key={h}
                        className="py-2 px-3 text-right text-xs font-medium text-[var(--text-muted)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {engineers.map((eng) => (
                    <tr
                      key={eng.id}
                      className="border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-[var(--text-primary)]">
                          {eng.fullName}
                        </p>
                        {eng.licenseNumber && (
                          <p className="text-xs text-[var(--text-muted)]">
                            پروانه: {eng.licenseNumber}
                          </p>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-[var(--text-secondary)]">
                        {FIELD_TYPE_LABEL[eng.fieldType] ?? "—"}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-[var(--text-muted)]" dir="ltr">
                        {eng.cellPhone ?? "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                            eng.isActive
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {eng.isActive ? "فعال" : "غیرفعال"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Cities & Sections */}
        <Card title="شهرها و بخش‌های استان کردستان" icon={MapPin}>
          <div className="space-y-4">
            {KURDISTAN_CITIES.map((city) => {
              const sections = KURDISTAN_SECTIONS.filter(
                (s) => s.cityId === city.id
              );
              return (
                <div key={city.id}>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                    {city.name}
                  </p>
                  <div className="flex flex-wrap gap-2 pr-3">
                    {sections.map((s) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)] border border-[var(--border-primary)]"
                      >
                        {s.name}
                      </span>
                    ))}
                    {sections.length === 0 && (
                      <span className="text-xs text-[var(--text-muted)]">
                        —
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* System settings (admin only) */}
        {isAdmin && (
          <Card title="تنظیمات پایه سامانه" icon={Settings2}>
            <div className="space-y-3">
              {[
                ["استان", "کردستان"],
                ["شماره استان", "10"],
                ["ارز", "ریال ایران"],
                ["تقویم", "شمسی (جلالی)"],
                ["زبان رابط", "فارسی (RTL)"],
                ["نسخه سامانه", "0.1.0"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2 border-b border-[var(--border-primary)] last:border-0"
                >
                  <span className="text-sm text-[var(--text-muted)]">{label}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
