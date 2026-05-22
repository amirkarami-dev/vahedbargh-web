import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FolderOpen,
  CheckCircle2,
  Clock,
  Users,
  Briefcase,
  Receipt,
  ArrowLeft,
  LayoutGrid,
  MessageSquare,
  BadgePercent,
  Database,
  Wrench,
  Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { getUserRoles, hasRole } from "@/lib/auth";
import type { Role } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

interface QuickLink {
  href: string;
  label: string;
  color: string;
}

// ─── Role-based data fetching ─────────────────────────────────────────────────

async function fetchStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  roles: Role[]
): Promise<StatCard[]> {
  if (hasRole(roles, "Administrator", "SuperUser")) {
    const [totalRes, pendingRes, completedRes, engineersRes] = await Promise.all([
      supabase
        .from("elect_projects")
        .select("id", { count: "exact", head: true })
        .eq("is_delete", false),
      supabase
        .from("elect_projects")
        .select("id", { count: "exact", head: true })
        .eq("is_delete", false)
        .eq("elect_project_status", 1),
      supabase
        .from("elect_projects")
        .select("id", { count: "exact", head: true })
        .eq("is_delete", false)
        .eq("elect_project_status", 2),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("user_type", 2),
    ]);

    return [
      {
        label: "کل پروژه‌ها",
        value: totalRes.count ?? 0,
        icon: FolderOpen,
        color: "from-blue-500 to-cyan-500",
      },
      {
        label: "پروژه‌های در انتظار",
        value: pendingRes.count ?? 0,
        icon: Clock,
        color: "from-amber-500 to-orange-500",
      },
      {
        label: "پروژه‌های تکمیل‌شده",
        value: completedRes.count ?? 0,
        icon: CheckCircle2,
        color: "from-emerald-500 to-teal-500",
      },
      {
        label: "تعداد مهندسان",
        value: engineersRes.count ?? 0,
        icon: Users,
        color: "from-violet-500 to-purple-500",
      },
    ];
  }

  if (hasRole(roles, "Engineer")) {
    const [assignedRes, completedRes, pendingRes] = await Promise.all([
      supabase
        .from("elect_projects")
        .select("id", { count: "exact", head: true })
        .eq("is_delete", false)
        .eq("user_id", userId),
      supabase
        .from("elect_projects")
        .select("id", { count: "exact", head: true })
        .eq("is_delete", false)
        .eq("user_id", userId)
        .eq("elect_project_status", 2),
      supabase
        .from("elect_projects")
        .select("id", { count: "exact", head: true })
        .eq("is_delete", false)
        .eq("user_id", userId)
        .eq("is_defect_eng", true)
        .eq("solved_defect_eng", false),
    ]);

    return [
      {
        label: "پروژه‌های تخصیصی",
        value: assignedRes.count ?? 0,
        icon: Briefcase,
        color: "from-blue-500 to-cyan-500",
      },
      {
        label: "کارهای انجام‌شده",
        value: completedRes.count ?? 0,
        icon: CheckCircle2,
        color: "from-emerald-500 to-teal-500",
      },
      {
        label: "نقص‌های در انتظار",
        value: pendingRes.count ?? 0,
        icon: Clock,
        color: "from-amber-500 to-orange-500",
      },
    ];
  }

  if (hasRole(roles, "Accountant")) {
    const [pendingRes, totalRes] = await Promise.all([
      supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("status", 0),
      supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("status", 2),
    ]);

    return [
      {
        label: "فاکتورهای در انتظار",
        value: pendingRes.count ?? 0,
        icon: Receipt,
        color: "from-amber-500 to-orange-500",
      },
      {
        label: "کل تراکنش‌ها",
        value: totalRes.count ?? 0,
        icon: BadgePercent,
        color: "from-emerald-500 to-teal-500",
      },
    ];
  }

  if (hasRole(roles, "PanelMaker")) {
    const { count } = await supabase
      .from("elect_projects")
      .select("id", { count: "exact", head: true })
      .eq("is_delete", false)
      .eq("panel_need", true)
      .eq("panel_maker_submit", false);

    return [
      {
        label: "پروژه‌های نیازمند تابلو",
        value: count ?? 0,
        icon: Layers,
        color: "from-violet-500 to-purple-500",
      },
    ];
  }

  // Employee / ElectAdmin / Section and others
  const [activeRes, pendingRes] = await Promise.all([
    supabase
      .from("elect_projects")
      .select("id", { count: "exact", head: true })
      .eq("is_delete", false)
      .eq("elect_project_status", 0),
    supabase
      .from("elect_projects")
      .select("id", { count: "exact", head: true })
      .eq("is_delete", false)
      .eq("elect_project_status", 1),
  ]);

  return [
    {
      label: "پروژه‌های فعال",
      value: activeRes.count ?? 0,
      icon: FolderOpen,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "تکالیف در انتظار",
      value: pendingRes.count ?? 0,
      icon: Clock,
      color: "from-amber-500 to-orange-500",
    },
  ];
}

function quickLinks(roles: Role[]): QuickLink[] {
  if (hasRole(roles, "Administrator", "SuperUser")) {
    return [
      { href: "/app/projects", label: "پروژه‌ها", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400" },
      { href: "/app/users", label: "کاربران", color: "from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400" },
      { href: "/app/accounting", label: "حسابداری", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400" },
      { href: "/app/base-info", label: "اطلاعات پایه", color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400" },
      { href: "/app/support", label: "پشتیبانی", color: "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400" },
    ];
  }

  if (hasRole(roles, "Engineer")) {
    return [
      { href: "/app/projects", label: "پروژه‌های من", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400" },
      { href: "/app/eng-work", label: "کارهای مهندسی", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400" },
      { href: "/app/support", label: "پشتیبانی", color: "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400" },
    ];
  }

  if (hasRole(roles, "Accountant")) {
    return [
      { href: "/app/accounting", label: "حسابداری", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400" },
    ];
  }

  if (hasRole(roles, "PanelMaker")) {
    return [
      { href: "/app/projects", label: "پروژه‌ها", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400" },
    ];
  }

  // Employee / ElectAdmin / Section
  return [
    { href: "/app/projects", label: "پروژه‌ها", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400" },
    { href: "/app/support", label: "پشتیبانی", color: "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400" },
  ];
}

function roleLabel(roles: Role[]): string {
  if (hasRole(roles, "Administrator")) return "مدیر سامانه";
  if (hasRole(roles, "SuperUser")) return "کاربر ارشد";
  if (hasRole(roles, "Engineer")) return "مهندس";
  if (hasRole(roles, "Accountant")) return "حسابدار";
  if (hasRole(roles, "PanelMaker")) return "تابلوساز";
  if (hasRole(roles, "ElectAdmin")) return "مدیر برق";
  if (hasRole(roles, "Section")) return "بخش";
  if (hasRole(roles, "Executor")) return "مجری";
  if (hasRole(roles, "Analyzer")) return "تحلیلگر";
  return "کاربر";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AppDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/app/login");
  }

  const [roles, profileRes] = await Promise.all([
    getUserRoles(),
    supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single(),
  ]);

  const profile = profileRes.data;
  const firstName = profile?.first_name ?? null;
  const lastName = profile?.last_name ?? null;
  const displayName =
    firstName || lastName
      ? [firstName, lastName].filter(Boolean).join(" ")
      : "کاربر";

  const stats = await fetchStats(supabase, user.id, roles);
  const links = quickLinks(roles);
  const userRole = roleLabel(roles);

  return (
    <div className="p-6 md:p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              خوش آمدید، {displayName}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">
                {stat.value.toLocaleString("fa-IR")}
              </p>
              <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick links */}
      {links.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            دسترسی سریع
          </h2>
          <div className="flex flex-wrap gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r border text-sm font-medium transition-all hover:opacity-80 ${link.color}`}
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Info / announcement panel */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-primary)]">
          <MessageSquare className="w-4 h-4 text-[var(--accent-primary)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            اطلاعیه‌های مهم
          </h2>
        </div>
        <div className="divide-y divide-[var(--border-primary)]">
          {[
            "همکاران محترم تازه‌وارد که موفق به اخذ گواهینامه بازرسی برق اماکن شده‌اند مدارک مورد نیاز را در قسمت «فایل‌های من» بارگذاری نموده، سپس در قسمت پشتیبانی درخواست خود را به مدیریت ارسال فرمایند.",
            "همکارانی که قصد تغییر صلاحیت دارند درخواست خود را در قسمت پشتیبانی به مدیریت ارسال فرمایند.",
            "همکارانی که پروانه خود را تمدید کرده یا ارتقا پایه دریافت کرده‌اند در قسمت پشتیبانی ضمن پیوست کردن فایل پروانه جدید به مدیریت ارسال فرمایند.",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-4 px-6 py-4">
              <span className="mt-1.5 w-2 h-2 rounded-full bg-[var(--accent-primary)] flex-shrink-0" />
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* System info — visible to admins only */}
      {hasRole(roles, "Administrator", "SuperUser") && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Database, label: "وضعیت دیتابیس", value: "پایدار", color: "text-emerald-400" },
            { icon: Wrench, label: "نسخه سامانه", value: "آلفا", color: "text-[var(--accent-primary)]" },
            { icon: Users, label: "کاربران فعال", value: "—", color: "text-[var(--text-primary)]" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
                <p className={`text-base font-semibold ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
