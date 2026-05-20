import Link from "next/link";
import { getStatsService } from "@/services";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StatsActions from "./StatsActions";
import { FileCheck, Users, Activity, ShieldCheck, TrendingUp, Award, Building2, ClipboardCheck } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "مدیریت آمار" };

const iconMap: Record<string, React.ElementType> = {
  FileCheck, Users, Activity, ShieldCheck, TrendingUp, Award, Building2, ClipboardCheck,
};

export default async function AdminStatsPage() {
  const svc = await getStatsService();
  const stats = await svc.getAll();

  return (
    <div className="p-8">
      <AdminPageHeader
        title="آمار سایت"
        description={`${stats.length} شاخص آماری در صفحه اصلی`}
        newHref="/admin/stats/new"
        newLabel="آمار جدید"
      />

      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">آیکون و عنوان</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">مقدار</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">پسوند</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">ترتیب</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {stats.map((stat) => {
                const Icon = iconMap[stat.iconName] ?? FileCheck;
                return (
                  <tr key={stat.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/15 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-blue-400" />
                        </div>
                        <Link
                          href={`/admin/stats/${stat.id}`}
                          className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                        >
                          {stat.label}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-[var(--accent-primary)] tabular-nums">
                      {stat.value.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-muted)]">
                      {stat.suffix || "—"}
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-muted)]">{stat.sortOrder}</td>
                    <td className="px-4 py-4">
                      <StatsActions id={stat.id} label={stat.label} />
                    </td>
                  </tr>
                );
              })}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                    هیچ آماری ثبت نشده است
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
