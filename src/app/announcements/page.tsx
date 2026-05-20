import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { UrgencyTicker } from "@/components/announcements/UrgencyTicker";
import { getAnnouncementService } from "@/services";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "اطلاعیه‌ها",
};

export default async function AnnouncementsPage() {
  const announcementService = await getAnnouncementService();
  const [all, urgent] = await Promise.all([
    announcementService.getAll(),
    announcementService.getUrgent(),
  ]);

  const featured = all.find((a) => a.featured);
  const rest = all.filter((a) => !a.featured);

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        {/* Ticker sits below the fixed header (h-[72px] initially → h-14 on scroll)
            sticky top-14 keeps it pinned under the collapsed header while scrolling */}
        {urgent.length > 0 && (
          <div className="mt-[72px] sticky top-14 z-40">
            <UrgencyTicker announcements={urgent} />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-16">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">اطلاعیه‌ها</h1>
            <p className="text-[var(--text-secondary)] mt-2">آخرین اخبار، دستورالعمل‌ها و اطلاعیه‌های دفتر اجرایی</p>
          </div>

          {/* Featured */}
          {featured && (
            <div className="mb-8">
              <AnnouncementCard announcement={featured} featured />
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((ann) => (
              <AnnouncementCard key={ann.id} announcement={ann} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
