import Link from "next/link";
import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getEngineers } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "مهندسان" };

const SECTION_NAMES: Record<number, string> = {
  1: "سنندج",
  2: "سقز",
  3: "مریوان",
  4: "بانه",
  5: "کامیاران",
  6: "دیواندره",
  7: "قروه",
};

interface PageProps {
  searchParams: Promise<{ search?: string; sectionId?: string }>;
}

export default async function EngineersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const sectionId = params.sectionId ? Number(params.sectionId) : undefined;

  const engineers = await getEngineers({ search: search || undefined, sectionId });

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title="مهندسان"
        description={`${engineers.length} مهندس ثبت‌شده`}
        newHref="/admin/engineers/new"
        newLabel="مهندس جدید"
      />

      {/* Search */}
      <form method="GET" className="flex gap-3">
        <input
          name="search"
          defaultValue={search}
          placeholder="جستجو بر اساس نام، کد ملی یا تلفن..."
          className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          جستجو
        </button>
        {search && (
          <Link
            href="/admin/engineers"
            className="px-6 py-3 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-medium transition-all"
          >
            پاک کردن
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-5 py-4">ردیف</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-5 py-4">نام و نام خانوادگی</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">کد ملی</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">تلفن</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">بخش</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">وضعیت</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {engineers.map((eng, idx) => (
                <tr key={eng.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="px-5 py-4 text-sm text-[var(--text-muted)]">{idx + 1}</td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/engineers/${eng.id}`}
                      className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      {eng.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-muted)] tabular-nums dir-ltr">
                    {eng.naCode ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-muted)] tabular-nums dir-ltr">
                    {eng.cellPhone ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-muted)]">
                    {eng.sectionId ? (SECTION_NAMES[eng.sectionId] ?? `بخش ${eng.sectionId}`) : "—"}
                  </td>
                  <td className="px-4 py-4">
                    {eng.inactive ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/15 text-gray-400">
                        غیرفعال
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-400">
                        فعال
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/engineers/${eng.id}`}
                        className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                      >
                        مشاهده
                      </Link>
                      <Link
                        href={`/admin/engineers/${eng.id}?edit=1`}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20 transition-all"
                      >
                        ویرایش
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {engineers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-sm text-[var(--text-muted)]">
                      {search ? `نتیجه‌ای برای "${search}" یافت نشد` : "هیچ مهندسی ثبت نشده است"}
                    </p>
                    {!search && (
                      <Link
                        href="/admin/engineers/new"
                        className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        افزودن اولین مهندس
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
