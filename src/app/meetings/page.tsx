import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MeetingTimeline } from "@/components/meetings/MeetingTimeline";
import { getMeetingService } from "@/services";

export const dynamic = "force-dynamic";
import { MEETING_STATUS_COLORS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "جلسات و مصوبات",
};

export default async function MeetingsPage() {
  const meetingService = await getMeetingService();
  const meetings = await meetingService.getAll();

  const statusCounts = meetings.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">جلسات و مصوبات</h1>
            <p className="text-[var(--text-secondary)] mt-2">سوابق جلسات هیئت رئیسه دفتر اجرایی نظارت برق</p>
          </div>

          {/* Status summary */}
          <div className="flex flex-wrap gap-3 mb-8">
            {Object.entries(statusCounts).map(([status, count]) => (
              <span
                key={status}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${MEETING_STATUS_COLORS[status] ?? "bg-slate-600/20 text-slate-400 border-slate-600/30"}`}
              >
                {status}
                <span className="bg-white/20 rounded-md px-1.5 py-0.5 text-[10px] font-bold">{count}</span>
              </span>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MeetingTimeline meetings={meetings} />
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
                <h2 className="font-semibold text-[var(--text-primary)] mb-3">راهنمای دریافت صورت‌جلسه</h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  صورت‌جلسات دارای نشانه PDF قابل دانلود مستقیم هستند. برای دریافت سایر جلسات با دفتر تماس بگیرید.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
                <h2 className="font-semibold text-[var(--text-primary)] mb-3">تقویم جلسات</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  جلسات هیئت رئیسه هر دو هفته یک‌بار (سه‌شنبه‌ها) برگزار می‌شود.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
