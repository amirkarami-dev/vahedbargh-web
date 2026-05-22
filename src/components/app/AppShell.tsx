"use client";

import { useState } from "react";
import AppSidebar from "@/components/app/AppSidebar";
import AppHeader from "@/components/app/AppHeader";
import type { Role } from "@/lib/auth";

interface AppShellProps {
  children: React.ReactNode;
  profileName?: string | null;
  role?: Role | null;
}

export default function AppShell({ children, profileName, role }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]" dir="rtl">
      {/* Sidebar */}
      <AppSidebar
        role={role ?? null}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader
          onMenuClick={() => setSidebarOpen(true)}
          profileName={profileName}
          role={role}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
