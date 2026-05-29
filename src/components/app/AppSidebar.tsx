"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { appLogoutAction } from "@/app/app/logout/actions";
import dynamic from "next/dynamic";
import {
  LayoutDashboard,
  FolderPlus,
  PlusCircle,
  List,
  Zap,
  Layers,
  User,
  GitBranch,
  ClipboardList,
  Activity,
  Calculator,
  CreditCard,
  BarChart2,
  FileBarChart,
  FileText,
  BookOpen,
  Database,
  Users,
  FolderOpen,
  MessageSquare,
  UserCircle,
  LogOut,
  ChevronLeft,
  X,
} from "lucide-react";
import type { Role } from "@/lib/auth";

const ThemeColorPicker = dynamic(
  () => import("@/components/admin/ThemeColorPicker").then((m) => m.ThemeColorPicker),
  { ssr: false }
);

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  roles: Role[];
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

const ALL_ROLES: Role[] = [
  "Administrator",
  "Engineer",
  "Employee",
  "Accountant",
  "PanelMaker",
  "ElectAdmin",
  "Section",
];

const PROFILE_ROLES: Role[] = [
  "Administrator",
  "Engineer",
  "Employee",
  "Accountant",
  "ElectAdmin",
  "Section",
];

const navSections: NavSection[] = [
  // ── داشبورد ──────────────────────────────────────────────────────────────
  {
    items: [
      {
        href: "/app",
        label: "داشبورد",
        icon: LayoutDashboard,
        exact: true,
        roles: ALL_ROLES,
      },
    ],
  },

  // ── پروژه‌ها ──────────────────────────────────────────────────────────────
  {
    title: "پروژه‌ها",
    items: [
      {
        href: "/app/projects/create",
        label: "ایجاد پرونده",
        icon: FolderPlus,
        roles: ["Administrator", "Section"],
      },
      {
        href: "/app/projects/new",
        label: "ثبت پروژه جدید",
        icon: PlusCircle,
        roles: ["ElectAdmin"],
      },
      {
        href: "/app/projects/elect-projects",
        label: "لیست پرونده‌ها",
        icon: List,
        roles: ["Administrator", "Section", "Employee"],
      },
      {
        href: "/app/projects/elect-projects-edc",
        label: "پرونده‌های EDC",
        icon: Zap,
        roles: ["ElectAdmin"],
      },
      {
        href: "/app/projects/panel-maker",
        label: "پرونده‌های تابلوساز",
        icon: Layers,
        roles: ["PanelMaker"],
      },
      {
        href: "/app/projects/eng-process",
        label: "پرونده‌های من",
        icon: User,
        roles: ["Engineer"],
      },
      {
        href: "/app/projects/edc-process",
        label: "فرآیندهای EDC",
        icon: GitBranch,
        roles: ["ElectAdmin"],
      },
      {
        href: "/app/projects/process",
        label: "فرآیند بازرسی",
        icon: GitBranch,
        roles: ["Administrator", "Section"],
      },
      {
        href: "/app/projects/process-list",
        label: "لیست فرآیندها",
        icon: ClipboardList,
        roles: ["Administrator", "Section"],
      },
    ],
  },

  // ── کارکرد ───────────────────────────────────────────────────────────────
  {
    title: "کارکرد",
    items: [
      {
        href: "/app/eng-work",
        label: "کارکرد مهندسین",
        icon: Activity,
        roles: ["Administrator", "Engineer", "Employee", "Accountant"],
      },
    ],
  },

  // ── مالی ─────────────────────────────────────────────────────────────────
  {
    title: "مالی",
    items: [
      {
        href: "/app/accounting",
        label: "حسابداری",
        icon: Calculator,
        exact: true,
        roles: ["Administrator", "Engineer", "Accountant", "Section"],
      },
      {
        href: "/app/accounting/eng-payment",
        label: "پرداخت مهندسین",
        icon: CreditCard,
        roles: ["Accountant"],
      },
    ],
  },

  // ── گزارش‌ها ──────────────────────────────────────────────────────────────
  {
    title: "گزارش‌ها",
    items: [
      {
        href: "/app/reports/elect-projects",
        label: "گزارش پرونده‌ها",
        icon: FileBarChart,
        roles: ["Administrator"],
      },
      {
        href: "/app/reports/eng-invoices",
        label: "فاکتور مهندسین",
        icon: FileText,
        roles: ["Accountant"],
      },
      {
        href: "/app/reports/eng-reports",
        label: "گزارش من",
        icon: BookOpen,
        roles: ["Engineer"],
      },
    ],
  },

  // ── ابزارها ───────────────────────────────────────────────────────────────
  {
    title: "ابزارها",
    items: [
      {
        href: "/app/base-info",
        label: "اطلاعات پایه",
        icon: Database,
        roles: ["Administrator", "Accountant", "Section"],
      },
      {
        href: "/app/users",
        label: "کاربران",
        icon: Users,
        roles: ["Administrator"],
      },
    ],
  },

  // ── حساب کاربری ──────────────────────────────────────────────────────────
  {
    title: "حساب کاربری",
    items: [
      {
        href: "/app/files",
        label: "فایل‌های من",
        icon: FolderOpen,
        roles: ["Administrator", "Engineer", "PanelMaker", "ElectAdmin", "Section"],
      },
      {
        href: "/app/support",
        label: "پشتیبانی",
        icon: MessageSquare,
        roles: ["Administrator", "Engineer", "Employee", "Accountant"],
      },
      {
        href: "/app/profile",
        label: "پروفایل",
        icon: UserCircle,
        roles: PROFILE_ROLES,
      },
    ],
  },
];

interface AppSidebarProps {
  role: Role | null;
  open?: boolean;
  onClose?: () => void;
}

export default function AppSidebar({ role, open, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  function canSee(item: NavItem): boolean {
    if (!role) return false;
    return item.roles.includes(role);
  }

  const sidebarContent = (
    <aside className="w-64 h-full bg-[var(--bg-card)] border-l border-[var(--border-primary)] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border-primary)] flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm border border-[var(--border-primary)]">
            <Image src="/logo.png" alt="KURDNEZAM" width={36} height={36} className="object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">KURDNEZAM</p>
            <p className="text-xs text-[var(--text-muted)]">سامانه کاربری</p>
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
        {navSections.map((section, sectionIdx) => {
          const visibleItems = section.items.filter(canSee);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sectionIdx}>
              {section.title && (
                <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] select-none">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                        active
                          ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <item.icon
                        className={`w-4.5 h-4.5 flex-shrink-0 ${active ? "text-[var(--accent-primary)]" : ""}`}
                      />
                      <span className="flex-1 text-[13px]">{item.label}</span>
                      {active && <ChevronLeft className="w-3.5 h-3.5 opacity-60" />}
                    </Link>
                  );
                })}
              </div>
              {sectionIdx < navSections.length - 1 && (
                <div className="mt-4 border-t border-[var(--border-primary)]" />
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-primary)]">
        <ThemeColorPicker />
        <form action={appLogoutAction}>
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
