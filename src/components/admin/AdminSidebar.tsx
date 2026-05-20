"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/logout/actions";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  FileText,
  Settings,
  LogOut,
  Zap,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/admin/announcements", label: "اطلاعیه‌ها", icon: Megaphone },
  { href: "/admin/meetings", label: "جلسات", icon: Users },
  { href: "/admin/documents", label: "اسناد", icon: FileText },
  { href: "/admin/settings", label: "تنظیمات", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 min-h-screen bg-[var(--bg-card)] border-l border-[var(--border-primary)] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border-primary)]">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">SEBNB</p>
            <p className="text-xs text-[var(--text-muted)]">پنل مدیریت</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-[var(--accent-primary)]" : ""}`} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronLeft className="w-4 h-4 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-primary)]">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all mb-1"
          target="_blank"
        >
          <Zap className="w-4 h-4" />
          <span>مشاهده سایت</span>
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج از حساب</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
