import Link from "next/link";
import { getDocumentService } from "@/services";
import { formatJalaliDate } from "@/lib/jalali";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DocumentActions from "./DocumentActions";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const svc = await getDocumentService();
  const documents = await svc.getAll();

  return (
    <div className="p-8">
      <AdminPageHeader
        title="اسناد"
        description={`${documents.length} سند ثبت شده`}
        newHref="/admin/documents/new"
        newLabel="سند جدید"
      />

      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">عنوان</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">دسته</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">نسخه</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">تاریخ</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">دانلود</th>
                <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">برجسته</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {documents.map((d) => (
                <tr key={d.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/documents/${d.id}`}
                      className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      {d.title}
                    </Link>
                    {d.fileUrl && (
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">دارای فایل پیوست</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">{d.category}</td>
                  <td className="px-4 py-4 text-sm text-[var(--text-muted)]" dir="ltr">{d.version}</td>
                  <td className="px-4 py-4 text-sm text-[var(--text-muted)]">{formatJalaliDate(d.jalaliDate)}</td>
                  <td className="px-4 py-4 text-sm text-[var(--text-muted)]">{d.downloadCount}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs ${d.featured ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
                      {d.featured ? "بله" : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <DocumentActions id={d.id} />
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                    هیچ سندی ثبت نشده است
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
