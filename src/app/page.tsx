import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/hero/HeroSection";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { StatsCounter } from "@/components/stats/StatsCounter";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { MeetingTimeline } from "@/components/meetings/MeetingTimeline";
import { getAnnouncementService, getMeetingService, getStatsService } from "@/services";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [announcementService, meetingService, statsService] = await Promise.all([
    getAnnouncementService(),
    getMeetingService(),
    getStatsService(),
  ]);
  const [latestAnnouncements, latestMeetings, stats] = await Promise.all([
    announcementService.getLatest(4),
    meetingService.getLatest(5),
    statsService.getAll(),
  ]);

  const featured = latestAnnouncements.find((a) => a.featured) ?? latestAnnouncements[0];
  const rest = latestAnnouncements.filter((a) => a.id !== featured?.id).slice(0, 3);

  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection stats={stats} />
        <ServiceGrid />
        <StatsCounter stats={stats} />

        {/* Announcements Preview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">آخرین اطلاعیه‌ها</h2>
              <p className="text-[var(--text-secondary)] mt-1">جدیدترین اخبار و اطلاعیه‌های دفتر</p>
            </div>
            <Link
              href="/announcements"
              className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              مشاهده همه
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {featured && <AnnouncementCard announcement={featured} featured />}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((ann) => (
                <AnnouncementCard key={ann.id} announcement={ann} />
              ))}
            </div>
          </div>
        </section>

        {/* Meetings Preview */}
        <section className="bg-[var(--bg-elevated)] border-y border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">آخرین جلسات</h2>
                <p className="text-[var(--text-secondary)] mt-1">جلسات هیئت رئیسه دفتر اجرایی</p>
              </div>
              <Link
                href="/meetings"
                className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                مشاهده همه
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
            <MeetingTimeline meetings={latestMeetings} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
