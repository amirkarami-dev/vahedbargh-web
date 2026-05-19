import Link from "next/link";
import { getAnnouncementService, getMeetingService, getDocumentService } from "@/services";
import { Megaphone, Users, FileText, TrendingUp, Plus, ArrowLeft } from "lucide-react";
import { formatJalaliDate } from "@/lib/jalali";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [announcementSvc, meetingSvc, documentSvc] = await Promise.all([
    getAnnouncementService(),
    getMeetingService(),
    getDocumentService(),
  ]);

  const [announcements, meetings, documents] = await Promise.all([
    announcementSvc.getAll(),
    meetingSvc.getAll(),
    documentSvc.getAll(),
  ]);

  const latestAnnouncements = announcements.slice(0, 5);
  const latestMeetings = meetings.slice(0, 5);

  const stats = [
    {
      label: "اطلاعیه‌ها",
      value: announcements.length,
      icon: Megaphone,
      href: "/admin/announcements",
      color: "from-blue-500 to-cyan-500",
      urgent: announcements.filter((a) => a.priority === "urgent").length,
    },
    {
      label: "جلسات",
      value: meetings.length,
      icon: Users,
      href: "/admin/meetings",
      color: "from-violet-500 to-purple-500",
      sub: `${meetings.filter((m) => m.status === "در دستور کار").length} در جریان`,
    },
    {
      label: "اسناد",
      value: documents.length,
      icon: FileText,
      href: "/admin/documents",
      color: "from-emerald-500 to-teal-500",
      sub: `${documents.filter((d) => d.featured).length} برجسته`,
    },
    {
      label: "مجموع دانلود",
      value: documents.reduce((sum, d) => sum + (d.downloadCount ?? 0), 0),
      icon: TrendingUp,
      href: "/admin/documents",
      color: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">داشبورد</h1>
        <p className="text-[var(--text-muted)] mt-1">خلاصه وضعیت محتوای سایت</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 hover:border-[var(--accent-primary)]/40 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <ArrowLeft className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">{stat.value}</p>
            <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
            {stat.urgent != null && stat.urgent > 0 && (
              <p className="text-xs text-red-400 mt-1">{stat.urgent} فوری</p>
            )}
            {stat.sub && <p className="text-xs text-[var(--text-muted)] mt-1">{stat.sub}</p>}
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">افزودن سریع</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/admin/announcements/new", label: "اطلاعیه جدید", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400" },
            { href: "/admin/meetings/new", label: "جلسه جدید", color: "from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400" },
            { href: "/admin/documents/new", label: "سند جدید", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r border text-sm font-medium transition-all hover:opacity-80 ${action.color}`}
            >
              <Plus className="w-4 h-4" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent announcements */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-primary)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">آخرین اطلاعیه‌ها</h2>
            <Link href="/admin/announcements" className="text-xs text-[var(--accent-primary)] hover:underline">
              همه
            </Link>
          </div>
          <div className="divide-y divide-[var(--border-primary)]">
            {latestAnnouncements.map((a) => (
              <Link
                key={a.id}
                href={`/admin/announcements/${a.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--bg-secondary)] transition-colors group"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  a.priority === "urgent" ? "bg-red-400" :
                  a.priority === "important" ? "bg-amber-400" : "bg-blue-400"
                }`} />
                <span className="flex-1 text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors truncate">
                  {a.title}
                </span>
                <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{formatJalaliDate(a.jalaliDate)}</span>
              </Link>
            ))}
            {latestAnnouncements.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">اطلاعیه‌ای ثبت نشده</p>
            )}
          </div>
        </div>

        {/* Recent meetings */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-primary)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">آخرین جلسات</h2>
            <Link href="/admin/meetings" className="text-xs text-[var(--accent-primary)] hover:underline">
              همه
            </Link>
          </div>
          <div className="divide-y divide-[var(--border-primary)]">
            {latestMeetings.map((m) => (
              <Link
                key={m.id}
                href={`/admin/meetings/${m.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--bg-secondary)] transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-xs font-bold text-[var(--accent-primary)] flex-shrink-0">
                  {m.sessionNumber}
                </span>
                <span className="flex-1 text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors truncate">
                  {m.subject}
                </span>
                <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{formatJalaliDate(m.jalaliDate)}</span>
              </Link>
            ))}
            {latestMeetings.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">جلسه‌ای ثبت نشده</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
