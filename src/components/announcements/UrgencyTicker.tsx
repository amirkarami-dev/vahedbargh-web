"use client";
import { AlertTriangle } from "lucide-react";
import type { Announcement } from "@/types";

interface UrgencyTickerProps {
  announcements: Announcement[];
}

export function UrgencyTicker({ announcements }: UrgencyTickerProps) {
  if (announcements.length === 0) return null;

  const text = announcements.map((a) => `⚡ ${a.title}`).join("    •    ");

  return (
    <div className="bg-red-600/90 text-white py-2 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 flex items-center gap-1.5 px-4 bg-red-700/60 self-stretch py-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-bold whitespace-nowrap">اطلاعیه فوری</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div
            className="whitespace-nowrap text-sm font-medium inline-block"
            style={{ animation: "ticker 30s linear infinite" }}
          >
            {text}
            &nbsp;&nbsp;&nbsp;&nbsp;
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}
