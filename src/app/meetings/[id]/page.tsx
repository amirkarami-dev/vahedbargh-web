import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, FileText, Calendar, Users } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getMeetingService } from "@/services";
import { MEETING_STATUS_COLORS } from "@/lib/constants";
import { formatJalaliDate } from "@/lib/jalali";
import { toPersianNumber } from "@/lib/persian-numbers";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const meetingService = await getMeetingService();
  const meeting = await meetingService.getById(id);
  return { title: meeting ? `جلسه شماره ${meeting.sessionNumber}` : "جلسه" };
}

export default async function MeetingDetailPage({ params }: Props) {
  const { id } = await params;
  const meetingService = await getMeetingService();
  const meeting = await meetingService.getById(id);

  if (!meeting) notFound();

  const resolutionStatusColors: Record<string, string> = {
    "اجرا شده": "text-emerald-400",
    "در دست اقدام": "text-amber-400",
    "در انتظار": "text-slate-400",
  };

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <Link
            href="/meetings"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-blue-400 transition-colors mb-6"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به جلسات
          </Link>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-[var(--border)]">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm text-[var(--text-muted)]">جلسه شماره {toPersianNumber(meeting.sessionNumber)}</span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${MEETING_STATUS_COLORS[meeting.status] ?? ""}`}
                >
                  {meeting.status}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-4">
                {meeting.subject}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatJalaliDate(meeting.jalaliDate)}
                </span>
                {meeting.attendees && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {meeting.attendees.join(" · ")}
                  </span>
                )}
              </div>
            </div>

            {meeting.resolutions.length > 0 && (
              <div className="p-6 sm:p-8">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4">مصوبات جلسه</h2>
                <ul className="space-y-3">
                  {meeting.resolutions.map((res, i) => (
                    <li key={res.id} className="flex items-start gap-3">
                      <span className="text-xs text-[var(--text-muted)] mt-1 tabular-nums">{toPersianNumber(i + 1)}.</span>
                      <div className="flex-1">
                        <p className="text-sm text-[var(--text-secondary)]">{res.text}</p>
                        <span className={`text-xs font-medium ${resolutionStatusColors[res.status] ?? "text-slate-400"}`}>
                          {res.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {meeting.pdfUrl && (
              <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                <a
                  href={meeting.pdfUrl}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  دریافت صورت‌جلسه PDF
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
