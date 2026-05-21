"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/logout/actions";
import dynamic from "next/dynamic";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  FileText,
  Settings,
  LogOut,
  Globe,
  ChevronLeft,
  BarChart3,
  Briefcase,
  HardHat,
  Calculator,
  CircleDollarSign,
  PieChart,
  MessageSquare,
  UserCog,
  X,
} from "lucide-react";

const ThemeColorPicker = dynamic(
  () => import("@/components/admin/ThemeColorPicker").then((m) => m.ThemeColorPicker),
  { ssr: false }
);

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    items: [
      { href: "/admin", label: "داشبورد", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "مدیریت پروژه‌ها",
    items: [
      { href: "/admin/projects", label: "پروژه‌ها", icon: Briefcase },
      { href: "/admin/engineers", label: "مهندسان", icon: HardHat },
      { href: "/admin/tariffs", label: "تعرفه‌ها", icon: CircleDollarSign },
      { href: "/admin/quotas", label: "سهمیه‌ها", icon: PieChart },
    ],
  },
  {
    title: "محتوا",
    items: [
      { href: "/admin/announcements", label: "اطلاعیه‌ها", icon: Megaphone },
      { href: "/admin/meetings", label: "جلسات", icon: Users },
      { href: "/admin/documents", label: "اسناد", icon: FileText },
      { href: "/admin/stats", label: "آمار سایت", icon: BarChart3 },
    ],
  },
  {
    title: "سیستم",
    items: [
      { href: "/admin/accounting", label: "حسابداری", icon: Calculator },
      { href: "/admin/support", label: "پشتیبانی", icon: MessageSquare },
      { href: "/admin/users", label: "کاربران", icon: UserCog },
      { href: "/admin/settings", label: "تنظیمات", icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <aside className="w-64 h-full bg-[var(--bg-card)] border-l border-[var(--border-primary)] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm border border-[var(--border-primary)]">
            <Image src="/logo.png" alt="KURDNEZAM" width={36} height={36} className="object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">KURDNEZAM</p>
            <p className="text-xs text-[var(--text-muted)]">پنل مدیریت</p>
          </div>
        </Link>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="بستن منو"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-4">
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            {section.title && (
              <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] select-none">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                      active
                        ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 ${active ? "text-[var(--accent-primary)]" : ""}`}
                    />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronLeft className="w-4 h-4 opacity-60" />}
                  </Link>
                );
              })}
            </div>
            {sectionIdx < navSections.length - 1 && (
              <div className="mt-4 border-t border-[var(--border-primary)]" />
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-primary)]">
        <ThemeColorPicker />
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all mb-1"
          target="_blank"
        >
          <Globe className="w-4 h-4" />
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

  return (
    <>
      {/* Desktop: always visible fixed sidebar */}
      <div className="hidden md:flex w-64 min-h-screen flex-shrink-0">{sidebarContent}</div>

      {/* Mobile: slide-in overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Sidebar panel — slides in from right (RTL) */}
          <div className="relative mr-auto h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
