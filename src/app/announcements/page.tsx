import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { UrgencyTicker } from "@/components/announcements/UrgencyTicker";
import { mockAnnouncementService } from "@/services";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "اطلاعیه‌ها",
};

export default async function AnnouncementsPage() {
  const [all, urgent] = await Promise.all([
    mockAnnouncementService.getAll(),
    mockAnnouncementService.getUrgent(),
  ]);

  const featured = all.find((a) => a.featured);
  const rest = all.filter((a) => !a.featured);

  return (
    <>
      <Header />
      <UrgencyTicker announcements={urgent} />
      <main id="main-content" className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
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
