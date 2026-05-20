import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { getAnnouncementService } from "@/services";
import { formatJalaliDate } from "@/lib/jalali";
import type { Metadata } from "next";
import type { AnnouncementPriority } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

const priorityLabel: Record<AnnouncementPriority, string> = {
  urgent: "فوری",
  important: "مهم",
  info: "اطلاع‌رسانی",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const announcementService = await getAnnouncementService();
  const ann = await announcementService.getById(slug);
  return { title: ann?.title ?? "اطلاعیه" };
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const { slug } = await params;
  const announcementService = await getAnnouncementService();
  const ann = await announcementService.getById(slug);

  if (!ann) notFound();

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <Link
            href="/announcements"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-blue-400 transition-colors mb-6"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به اطلاعیه‌ها
          </Link>

          <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-[var(--border)]">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={ann.priority}>{priorityLabel[ann.priority]}</Badge>
                <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Tag className="w-3 h-3" />
                  {ann.category}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">
                {ann.title}
              </h1>

              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Calendar className="w-4 h-4" />
                <time>{formatJalaliDate(ann.jalaliDate)}</time>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-[var(--text-secondary)] text-base leading-loose">{ann.content}</p>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
