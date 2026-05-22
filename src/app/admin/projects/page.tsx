import Link from "next/link";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getProjects } from "./actions";
import {
  ProjectLevelLabel,
  PROJECT_LEVEL_COLORS,
  BuildingTypeLabel,
} from "@/services/mock/projects";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "پروژه‌ها" };

const PROJECT_STATUS_LABEL: Record<number, string> = {
  0: "ثبت اولیه",
  1: "فعال",
  2: "تکمیل شده",
  3: "متوقف",
};

function formatISODate(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("fa-IR");
  } catch {
    return isoStr;
  }
}

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    level?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function AdminProjectsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status !== undefined ? Number(sp.status) : undefined;
  const level = sp.level !== undefined ? Number(sp.level) : undefined;
  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 20);

  const projects = await getProjects({ search, status, level, page, pageSize });

  const buildFilterUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const base: Record<string, string | undefined> = {
      search,
      status: sp.status,
      level: sp.level,
      page: String(page),
      ...overrides,
    };
    for (const [k, v] of Object.entries(base)) {
      if (v !== undefined && v !== "") params.set(k, v);
    }
    return `/admin/projects?${params.toString()}`;
  };

  return (
    <div className="p-8">
      <AdminPageHeader
        title="پروژه‌ها"
        description="مدیریت پروژه‌های نظارت برق"
        newHref="/admin/projects/new"
        newLabel="پروژه جدید"
      />

      {/* Filter bar */}
      <form method="GET" action="/admin/projects" className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="جستجو (شماره پرونده، نام مالک...)"
          className="px-4 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] min-w-[220px]"
        />
        <select
          name="status"
          defaultValue={sp.status ?? ""}
          className="px-4 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="0">ثبت اولیه</option>
          <option value="1">فعال</option>
          <option value="2">تکمیل شده</option>
          <option value="3">متوقف</option>
        </select>
        <select
          name="level"
          defaultValue={sp.level ?? ""}
          className="px-4 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
        >
          <option value="">همه مراحل</option>
          {Object.entries(ProjectLevelLabel).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 transition-colors"
        >
          جستجو
        </button>
        {(search || sp.status || sp.level) && (
          <Link
            href="/admin/projects"
            className="px-4 py-2 rounded-xl border border-[var(--border-primary)] text-[var(--text-muted)] text-sm hover:text-[var(--text-primary)] transition-colors"
          >
            پاک کردن فیلتر
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">
                  شماره پرونده
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  نام مالک
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  نوع ساختمان
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  تعداد طبقات
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  مرحله
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  وضعیت
                </th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">
                  تاریخ ثبت
                </th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {projects.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-[var(--bg-secondary)]/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="text-sm font-medium text-[var(--accent-primary)] hover:underline"
                    >
                      {p.fileNumber ?? p.electRequestNumber ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-primary)]">
                    {p.landlordName}
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-muted)]">
                    {BuildingTypeLabel[p.buildingType] ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-muted)] tabular-nums">
                    {p.numberOfFloor}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${PROJECT_LEVEL_COLORS[p.projectLevel] ?? "bg-gray-500"}`}
                    >
                      {ProjectLevelLabel[p.projectLevel] ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {p.isStop ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                        متوقف
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                        {PROJECT_STATUS_LABEL[p.electProjectStatus] ?? "—"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-muted)]">
                    {p.solarCreated ?? formatISODate(p.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="text-xs text-[var(--accent-primary)] hover:underline"
                    >
                      جزئیات
                    </Link>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-[var(--text-muted)]"
                  >
                    هیچ پروژه‌ای یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {projects.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-[var(--text-muted)]">
            صفحه {page}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={buildFilterUrl({ page: String(page - 1) })}
                className="px-4 py-2 rounded-xl border border-[var(--border-primary)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                قبلی
              </Link>
            )}
            {projects.length === pageSize && (
              <Link
                href={buildFilterUrl({ page: String(page + 1) })}
                className="px-4 py-2 rounded-xl border border-[var(--border-primary)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                بعدی
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
