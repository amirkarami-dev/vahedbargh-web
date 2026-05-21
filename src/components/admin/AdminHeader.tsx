"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "داشبورد",
  "/admin/announcements": "اطلاعیه‌ها",
  "/admin/meetings": "جلسات",
  "/admin/documents": "اسناد",
  "/admin/stats": "آمار سایت",
  "/admin/projects": "پروژه‌ها",
  "/admin/engineers": "مهندسان",
  "/admin/accounting": "حسابداری",
  "/admin/tariffs": "تعرفه‌ها",
  "/admin/quotas": "سهمیه‌ها",
  "/admin/support": "پشتیبانی",
  "/admin/users": "کاربران",
  "/admin/settings": "تنظیمات",
};

function deriveTitle(pathname: string): string {
  // exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // find the longest prefix match
  const segments = pathname.split("/").filter(Boolean);
  while (segments.length > 0) {
    const candidate = "/" + segments.join("/");
    if (PAGE_TITLES[candidate]) return PAGE_TITLES[candidate];
    segments.pop();
  }
  return "پنل مدیریت";
}

interface AdminHeaderProps {
  onMenuClick?: () => void;
  profileName?: string | null;
}

export default function AdminHeader({ onMenuClick, profileName }: AdminHeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const title = deriveTitle(pathname);

  return (
    <header className="h-16 flex items-center gap-4 px-4 sm:px-6 bg-[var(--bg-card)] border-b border-[var(--border-primary)] sticky top-0 z-30">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors flex-shrink-0"
        aria-label="باز کردن منو"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="flex-1 text-base font-semibold text-[var(--text-primary)] truncate">
        {title}
      </h1>

      {/* Right-side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          aria-label="اعلان‌ها"
        >
          <Bell className="w-5 h-5" />
          {/* Red dot badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[var(--bg-card)]" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          aria-label="تغییر تم"
        >
          {mounted ? (
            theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* User avatar */}
        <div
          className="w-9 h-9 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)] text-sm font-bold select-none"
          title={profileName ?? "کاربر"}
        >
          {profileName ? profileName.charAt(0) : "ک"}
        </div>
      </div>
    </header>
  );
}
