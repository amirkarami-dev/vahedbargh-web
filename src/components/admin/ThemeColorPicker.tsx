"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

const COLORS = [
  { label: "آبی", value: "#2563EB", dark: "#3B82F6" },
  { label: "بنفش", value: "#7C3AED", dark: "#8B5CF6" },
  { label: "سبز", value: "#059669", dark: "#10B981" },
  { label: "نارنجی", value: "#D97706", dark: "#F59E0B" },
  { label: "قرمز", value: "#DC2626", dark: "#EF4444" },
  { label: "فیروزه‌ای", value: "#0891B2", dark: "#06B6D4" },
];

const STORAGE_KEY = "admin-accent-color";

export function ThemeColorPicker() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(COLORS[0].value);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) applyColor(saved, false);
  }, []);

  function applyColor(value: string, save = true) {
    const color = COLORS.find((c) => c.value === value) ?? COLORS[0];
    document.documentElement.style.setProperty("--accent-primary", color.value);
    document.documentElement.style.setProperty("--accent-secondary", color.dark);
    document.documentElement.style.setProperty("--border-primary", `${color.value}30`);
    setActive(value);
    if (save) localStorage.setItem(STORAGE_KEY, value);
  }

  return (
    <div className="relative mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
        aria-label="انتخاب رنگ تم"
      >
        <Palette className="w-4 h-4" />
        <span className="flex-1 text-right">رنگ تم</span>
        <span
          className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
          style={{ backgroundColor: active }}
        />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 left-0 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-3 shadow-lg z-10">
          <p className="text-xs text-[var(--text-muted)] mb-2 px-1">رنگ اصلی رابط کاربری</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => { applyColor(c.value); setOpen(false); }}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
                style={{
                  backgroundColor: c.value,
                  boxShadow: active === c.value ? `0 0 0 2px white, 0 0 0 4px ${c.value}` : undefined,
                }}
                title={c.label}
                aria-label={c.label}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
