import Link from "next/link";
import { getAnnouncementService } from "@/services";
import { formatJalaliDate } from "@/lib/jalali";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AnnouncementActions from "./AnnouncementActions";

export const dynamic = "force-dynamic";

const PRIORITY_LABELS = { urgent: "فوری", important: "مهم", info: "اطلاعاتی" };
const PRIORITY_COLORS = {
  urgent: "bg-red-500/15 text-red-400 border-red-500/30",
  important: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

export default async function AdminAnnouncementsPage() {
  const svc = await getAnnouncementService();
  const announcements = await svc.getAll();

  return (
    <div className="p-8">
      <AdminPageHeader
        title="اطلاعیه‌ها"
        description={`${announcements.length} اطلاعیه ثبت شده`}
        newHref="/admin/announcements/new"
        newLabel="اطلاعیه جدید"
      />

      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">عنوان</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">دسته</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">اولویت</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">تاریخ</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">برجسته</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {announcements.map((a) => (
                <tr key={a.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/announcements/${a.id}`}
                      className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      {a.title}
                    </Link>
                    {a.excerpt && (
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate max-w-xs">{a.excerpt}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">{a.category}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${PRIORITY_COLORS[a.priority]}`}>
                      {PRIORITY_LABELS[a.priority]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-muted)]">{formatJalaliDate(a.jalaliDate)}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs ${a.featured ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
                      {a.featured ? "بله" : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <AnnouncementActions id={a.id} />
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                    هیچ اطلاعیه‌ای ثبت نشده است
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
