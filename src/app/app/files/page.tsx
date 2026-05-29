import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserRoles } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { FileText, Download, Search, FolderOpen } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "فایل‌های پروژه" };

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectFile {
  id: string;
  fileName: string;
  fileSize?: string | null;
  fileType?: string | null;
  projectId?: string | null;
  fileNumber?: string | null;
  uploadedAt: string;
  uploadedBy?: string | null;
  fileUrl?: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeIcon(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "📄";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "🖼️";
  if (["xlsx", "xls"].includes(ext)) return "📊";
  if (["docx", "doc"].includes(ext)) return "📝";
  if (["zip", "rar"].includes(ext)) return "📦";
  return "📎";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AppFilesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const roles = await getUserRoles();
  if (roles.length === 0) redirect("/login");

  const { q } = await searchParams;

  // Fetch files from DB (graceful fallback to empty)
  let files: ProjectFile[] = [];
  let dbError = false;

  try {
    const supabase = await createClient();

    // Try project_files table first
    const { data, error } = await supabase
      .from("project_files")
      .select(
        "id, file_name, file_size, file_type, project_id, uploaded_at, uploaded_by, file_url, elect_projects(file_number)"
      )
      .order("uploaded_at", { ascending: false })
      .limit(100);

    if (error) {
      dbError = true;
    } else {
      files = (data ?? []).map((r) => ({
        id: r.id as string,
        fileName: (r.file_name as string) ?? "فایل بدون نام",
        fileSize: r.file_size as string | null,
        fileType: r.file_type as string | null,
        projectId: r.project_id as string | null,
        fileNumber:
          ((r.elect_projects as unknown) as { file_number: string } | null)?.file_number ??
          null,
        uploadedAt: r.uploaded_at as string,
        uploadedBy: r.uploaded_by as string | null,
        fileUrl: r.file_url as string | null,
      }));
    }
  } catch {
    dbError = true;
  }

  // Client-side search filter (via searchParams)
  const filteredFiles = q
    ? files.filter(
        (f) =>
          f.fileName.toLowerCase().includes(q.toLowerCase()) ||
          f.fileNumber?.toLowerCase().includes(q.toLowerCase())
      )
    : files;

  return (
    <div className="p-6 sm:p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              فایل‌های پروژه
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              مدیریت و دریافت فایل‌های مرتبط با پروژه‌ها
            </p>
          </div>
        </div>
      </div>

      {/* DB error notice */}
      {dbError && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
          جدول فایل‌ها در پایگاه داده یافت نشد. پس از اعمال migrations، این
          صفحه فعال خواهد شد.
        </div>
      )}

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <form>
          <input
            name="q"
            defaultValue={q}
            placeholder="جستجو بر اساس نام فایل یا شماره پروژه…"
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
          />
        </form>
      </div>

      {/* File list */}
      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <p className="text-base font-medium text-[var(--text-secondary)] mb-1">
            {q ? "هیچ فایلی با این عبارت جستجو یافت نشد" : "فایلی وجود ندارد"}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            فایل‌ها پس از آپلود در فرآیند پروژه اینجا نمایش داده می‌شوند
          </p>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  {["نام فایل", "پروژه", "نوع", "حجم", "تاریخ آپلود", "دریافت"].map(
                    (h) => (
                      <th
                        key={h}
                        className="py-4 px-5 text-right text-xs font-semibold text-[var(--text-muted)]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl" aria-hidden="true">
                          {fileTypeIcon(file.fileName)}
                        </span>
                        <span className="font-medium text-[var(--text-primary)] max-w-[200px] truncate">
                          {file.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-[var(--text-muted)] text-xs">
                      {file.fileNumber ?? file.projectId?.slice(0, 8) ?? "—"}
                    </td>
                    <td className="py-3.5 px-5 text-[var(--text-muted)] text-xs uppercase">
                      {file.fileType ??
                        file.fileName.split(".").pop()?.toUpperCase() ??
                        "—"}
                    </td>
                    <td className="py-3.5 px-5 text-[var(--text-muted)] text-xs">
                      {file.fileSize
                        ? isNaN(Number(file.fileSize))
                          ? file.fileSize
                          : formatFileSize(Number(file.fileSize))
                        : "—"}
                    </td>
                    <td className="py-3.5 px-5 text-[var(--text-muted)] text-xs">
                      {new Date(file.uploadedAt).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="py-3.5 px-5">
                      {file.fileUrl ? (
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20 text-xs font-medium transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          دریافت
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
