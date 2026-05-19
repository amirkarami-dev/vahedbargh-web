import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import type { Meeting } from "@/types";
import { MEETING_STATUS_COLORS } from "@/lib/constants";
import { formatJalaliDate } from "@/lib/jalali";
import { toPersianNumber } from "@/lib/persian-numbers";

interface MeetingTimelineProps {
  meetings: Meeting[];
}

export function MeetingTimeline({ meetings }: MeetingTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute right-[18px] top-3 bottom-3 w-px bg-gradient-to-b from-blue-600/60 via-blue-600/30 to-transparent" />

      <div className="space-y-6">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="flex gap-6">
            {/* Dot */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full border-2 border-blue-600 bg-[var(--bg-base)] flex items-center justify-center shadow-[0_0_12px_rgba(37,99,235,0.4)]">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <time className="text-xs text-[var(--text-muted)]">{formatJalaliDate(meeting.jalaliDate)}</time>
                <span className="text-xs text-[var(--text-muted)]">·</span>
                <span className="text-xs text-[var(--text-secondary)]">
                  جلسه شماره {toPersianNumber(meeting.sessionNumber)}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] mb-2">
                {meeting.subject}
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${MEETING_STATUS_COLORS[meeting.status] ?? "bg-slate-600/20 text-slate-400 border-slate-600/30"}`}
                >
                  {meeting.status}
                </span>

                {meeting.pdfUrl && (
                  <a
                    href={meeting.pdfUrl}
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    دریافت صورت‌جلسه PDF
                  </a>
                )}

                <Link
                  href={`/meetings/${meeting.id}`}
                  className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-blue-400 transition-colors mr-auto"
                >
                  جزئیات
                  <ArrowLeft className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
