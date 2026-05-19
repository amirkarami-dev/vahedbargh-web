import Link from "next/link";
import { getMeetingService } from "@/services";
import { formatJalaliDate } from "@/lib/jalali";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import MeetingActions from "./MeetingActions";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  "برگزار شده": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "مصوبه صادر شد": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "در دستور کار": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "در حال پیگیری": "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

export default async function AdminMeetingsPage() {
  const svc = await getMeetingService();
  const meetings = await svc.getAll();

  return (
    <div className="p-8">
      <AdminPageHeader
        title="جلسات"
        description={`${meetings.length} جلسه ثبت شده`}
        newHref="/admin/meetings/new"
        newLabel="جلسه جدید"
      />

      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">شماره</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">موضوع</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">نوع</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">وضعیت</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">تاریخ</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">مصوبات</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {meetings.map((m) => (
                <tr key={m.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] inline-flex items-center justify-center text-xs font-bold text-[var(--accent-primary)]">
                      {m.sessionNumber}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/meetings/${m.id}`}
                      className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      {m.subject}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">{m.type}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${STATUS_COLORS[m.status] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-muted)]">{formatJalaliDate(m.jalaliDate)}</td>
                  <td className="px-4 py-4 text-sm text-[var(--text-muted)]">{m.resolutions?.length ?? 0}</td>
                  <td className="px-4 py-4">
                    <MeetingActions id={m.id} />
                  </td>
                </tr>
              ))}
              {meetings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                    هیچ جلسه‌ای ثبت نشده است
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
