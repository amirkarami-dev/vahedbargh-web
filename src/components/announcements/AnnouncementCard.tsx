import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Announcement, AnnouncementPriority } from "@/types";
import { formatJalaliDate } from "@/lib/jalali";

const priorityLabel: Record<AnnouncementPriority, string> = {
  urgent: "فوری",
  important: "مهم",
  info: "اطلاع‌رسانی",
};

interface AnnouncementCardProps {
  announcement: Announcement;
  featured?: boolean;
}

export function AnnouncementCard({ announcement, featured = false }: AnnouncementCardProps) {
  if (featured) {
    return (
      <Link
        href={`/announcements/${announcement.slug}`}
        className="block relative rounded-2xl overflow-hidden border border-[var(--border)] group hover:border-[var(--border-active)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)]"
      >
        <div className="bg-gradient-to-l from-blue-600/20 to-[var(--bg-raised)] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant={announcement.priority}>{priorityLabel[announcement.priority]}</Badge>
            <span className="text-xs text-[var(--text-muted)]">{announcement.category}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-blue-400 transition-colors">
            {announcement.title}
          </h2>
          <p className="text-[var(--text-secondary)] line-clamp-3 text-sm leading-relaxed mb-4">
            {announcement.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <time className="text-xs text-[var(--text-muted)]">{formatJalaliDate(announcement.jalaliDate)}</time>
            <span className="flex items-center gap-1 text-blue-400 text-sm group-hover:gap-2 transition-all">
              مطالعه بیشتر <ArrowLeft className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/announcements/${announcement.slug}`}
      className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 group hover:border-[var(--border-active)] hover:shadow-[0_0_20px_rgba(37,99,235,0.1)] transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant={announcement.priority}>{priorityLabel[announcement.priority]}</Badge>
        <span className="text-xs text-[var(--text-muted)]">{announcement.category}</span>
      </div>
      <h3 className="font-bold text-[var(--text-primary)] line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors text-sm sm:text-base">
        {announcement.title}
      </h3>
      <p className="text-[var(--text-secondary)] line-clamp-3 text-sm leading-relaxed mb-4">
        {announcement.excerpt}
      </p>
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
        <time className="text-xs text-[var(--text-muted)]">{formatJalaliDate(announcement.jalaliDate)}</time>
        <ArrowLeft className="w-4 h-4 text-blue-400 group-hover:translate-x-[-4px] transition-transform" />
      </div>
    </Link>
  );
}
