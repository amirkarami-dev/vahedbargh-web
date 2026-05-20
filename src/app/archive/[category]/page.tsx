import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getDocumentService } from "@/services";
import { formatJalaliDate } from "@/lib/jalali";
import { FileText, Download } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  return { title: decodeURIComponent(category) };
}

export default async function CategoryArchivePage({ params }: Props) {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  const documentService = await getDocumentService();
  const docs = await documentService.getByCategory(decoded);

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <Link href="/archive" className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← بازگشت به آرشیو
          </Link>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{decoded}</h1>
          <p className="text-[var(--text-secondary)] mb-8">{docs.length} سند در این دسته</p>

          <div className="grid gap-4">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-active)] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--text-primary)] truncate">{doc.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatJalaliDate(doc.jalaliDate)} · نسخه {doc.version}</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 text-xs font-medium transition-colors shrink-0">
                  <Download className="w-3.5 h-3.5" />
                  دانلود
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
