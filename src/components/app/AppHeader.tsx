"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import type { Role } from "@/lib/auth";

const ROLE_LABELS: Record<string, string> = {
  Administrator: "مدیر",
  Engineer: "کارشناس",
  Employee: "کارمند",
  Accountant: "حسابدار",
  PanelMaker: "تابلوساز",
  ElectAdmin: "توزیع برق",
  Section: "شهرستان",
};

const PAGE_TITLES: Record<string, string> = {
  "/app": "داشبورد",
  "/app/projects": "پروژه‌ها",
  "/app/projects/new": "پروژه جدید",
  "/app/eng-work": "کارهای مهندسی",
  "/app/accounting": "حسابداری",
  "/app/support": "پشتیبانی",
  "/app/users": "کاربران",
  "/app/base-info": "اطلاعات پایه",
  "/app/profile": "پروفایل",
};

function deriveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const segments = pathname.split("/").filter(Boolean);
  while (segments.length > 0) {
    const candidate = "/" + segments.join("/");
    if (PAGE_TITLES[candidate]) return PAGE_TITLES[candidate];
    segments.pop();
  }
  return "سامانه کاربری";
}

interface AppHeaderProps {
  onMenuClick?: () => void;
  profileName?: string | null;
  role?: Role | null;
}

export default function AppHeader({ onMenuClick, profileName, role }: AppHeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const title = deriveTitle(pathname);
  const roleLabel = role ? (ROLE_LABELS[role] ?? role) : null;

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
        {/* Role badge */}
        {roleLabel && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 select-none">
            {roleLabel}
          </span>
        )}

        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          aria-label="اعلان‌ها"
        >
          <Bell className="w-5 h-5" />
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
