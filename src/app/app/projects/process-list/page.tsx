import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserRoles, hasRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { ClipboardList, FolderOpen, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "لیست فرآیندها" };

const INSPECTION_STATUS_LABEL: Record<number, { label: string; cls: string }> = {
  0: { label: "جدید", cls: "bg-blue-500/10 text-blue-400" },
  1: { label: "در جریان", cls: "bg-amber-500/10 text-amber-400" },
  2: { label: "تأیید شده", cls: "bg-green-500/10 text-green-400" },
  99: { label: "لغو شده", cls: "bg-red-500/10 text-red-400" },
};

export default async function ProcessListPage() {
  const roles = await getUserRoles();
  if (!hasRole(roles, "Administrator", "Section")) redirect("/app");

  const supabase = await createClient();
  const { data: processes, error } = await supabase
    .from("elect_project_processes")
    .select(`
      id,
      inspection_status,
      accepted,
      created_at,
      elect_projects ( title, owner_name ),
      engineers ( full_name )
    `)
    .eq("is_delete", false)
    .order("created_at", { ascending: false })
    .limit(200);

  const counts = {
    total: processes?.length ?? 0,
    active: processes?.filter((p) => p.inspection_status !== 2 && p.inspection_status !== 99).length ?? 0,
    completed: processes?.filter((p) => p.inspection_status === 2).length ?? 0,
    cancelled: processes?.filter((p) => p.inspection_status === 99).length ?? 0,
  };

  return (
    <div className="p-6 md:p-8" dir="rtl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">لیست فرآیندها</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              تمام فرآیندهای بازرسی (فعال، تکمیل‌شده و لغوشده)
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "کل فرآیندها", value: counts.total, cls: "text-[var(--text-primary)]" },
          { label: "فعال", value: counts.active, cls: "text-amber-400" },
          { label: "تکمیل‌شده", value: counts.completed, cls: "text-green-400" },
          { label: "لغو شده", value: counts.cancelled, cls: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold tabular-nums ${s.cls}`}>{s.value.toLocaleString("fa-IR")}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {error ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-10 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3 opacity-60" />
          <p className="text-sm text-[var(--text-muted)]">بارگذاری اطلاعات ممکن نشد</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
          {!processes || processes.length === 0 ? (
            <div className="p-10 text-center">
              <FolderOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-30" />
              <p className="text-sm text-[var(--text-muted)]">فرآیندی یافت نشد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                    {["ردیف", "عنوان پرونده", "مالک", "مهندس ناظر", "وضعیت", "تأیید", "تاریخ"].map((h) => (
                      <th key={h} className="py-3 px-4 text-right text-xs font-medium text-[var(--text-muted)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processes.map((proc, idx) => {
                    const proj = proc.elect_projects as { title?: string; owner_name?: string } | null;
                    const eng = proc.engineers as { full_name?: string } | null;
                    const st = INSPECTION_STATUS_LABEL[proc.inspection_status as number] ?? INSPECTION_STATUS_LABEL[0];
                    return (
                      <tr key={proc.id as string} className="border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                        <td className="py-3 px-4 text-xs text-[var(--text-muted)]">{(idx + 1).toLocaleString("fa-IR")}</td>
                        <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{proj?.title || "—"}</td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{proj?.owner_name || "—"}</td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{eng?.full_name || "تخصیص‌نیافته"}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${st.cls}`}>{st.label}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${proc.accepted ? "bg-green-500/10 text-green-400" : "bg-zinc-500/10 text-zinc-400"}`}>
                            {proc.accepted ? "تأیید" : "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-[var(--text-muted)]" dir="ltr">
                          {proc.created_at ? new Date(proc.created_at as string).toLocaleDateString("fa-IR") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
