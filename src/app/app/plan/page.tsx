import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserRoles, hasRole } from "@/lib/auth";
import { PenTool, Info, Map, Layers } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ترسیم پلان" };

export default async function PlanPage() {
  const roles = await getUserRoles();
  if (!hasRole(roles, "Administrator")) redirect("/app");

  return (
    <div className="p-6 md:p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <PenTool className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">ترسیم پلان</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              ابزار ترسیم و مدیریت نقشه‌های برق ساختمانی
            </p>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        {[
          { icon: Map, title: "نقشه‌های ساختمانی", desc: "مشاهده و ویرایش نقشه‌های برق ساختمان‌های ثبت‌شده در سامانه", color: "from-blue-500 to-cyan-500" },
          { icon: Layers, title: "لایه‌بندی مدارها", desc: "ترسیم و نمایش لایه‌های مختلف مدارات برق قدرت و روشنایی", color: "from-violet-500 to-purple-500" },
        ].map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{f.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Placeholder canvas area */}
      <div className="bg-[var(--bg-card)] border border-dashed border-[var(--border-primary)] rounded-2xl p-10 flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
          <PenTool className="w-8 h-8 text-[var(--text-muted)]" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">محیط ترسیم</h2>
        <p className="text-sm text-[var(--text-muted)] text-center max-w-sm">
          ابزار تعاملی ترسیم پلان برق ساختمانی در اینجا نمایش داده خواهد شد.
        </p>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <p className="text-xs text-blue-300">این صفحه در حال توسعه است.</p>
        </div>
      </div>
    </div>
  );
}
