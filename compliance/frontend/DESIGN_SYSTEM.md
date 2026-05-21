# Design System
## shadcn/ui + Tailwind CSS v4 + Persian RTL

---

## Setup

### Install shadcn/ui

```bash
npx shadcn@latest init
# Choose: TypeScript, App Router, Tailwind v4, CSS variables, RTL
```

### Required Components

Install all at once:

```bash
npx shadcn@latest add button card input label select textarea badge
npx shadcn@latest add dialog sheet drawer popover command
npx shadcn@latest add table data-table pagination
npx shadcn@latest add form checkbox radio-group switch
npx shadcn@latest add toast sonner
npx shadcn@latest add avatar dropdown-menu navigation-menu
npx shadcn@latest add tabs accordion collapsible
npx shadcn@latest add calendar date-picker
npx shadcn@latest add chart
npx shadcn@latest add separator skeleton progress
npx shadcn@latest add alert alert-dialog
npx shadcn@latest add breadcrumb
npx shadcn@latest add hover-card tooltip
```

---

## CSS Variables

### Full Token Set (globals.css)

```css
@import "tailwindcss";
@import "tailwindcss/theme" reference;

/* RTL */
[dir="rtl"] { direction: rtl; }

:root {
  /* Base colours */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.75rem;

  /* Primary (user-customisable — blue default) */
  --primary: 217 91% 60%;        /* #3B82F6 */
  --primary-foreground: 0 0% 100%;
  --secondary: 214 32% 91%;
  --secondary-foreground: 222 47% 11%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --accent: 210 40% 96%;
  --accent-foreground: 222 47% 11%;

  /* Custom tokens (keep for backward compat with existing admin pages) */
  --accent-primary: hsl(var(--primary));
  --accent-secondary: hsl(217 91% 65%);
  --bg-primary: hsl(210 40% 96%);
  --bg-card: hsl(var(--card));
  --bg-secondary: hsl(210 40% 96%);
  --border-primary: hsl(var(--border));
  --text-primary: hsl(var(--foreground));
  --text-secondary: hsl(215 25% 40%);
  --text-muted: hsl(var(--muted-foreground));
  --bg-base: hsl(var(--background));
  --bg-elevated: hsl(var(--card));
  --border: hsl(var(--border));
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
  --primary: 217 91% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;

  /* Custom tokens dark */
  --accent-primary: hsl(var(--primary));
  --accent-secondary: hsl(217 91% 65%);
  --bg-primary: hsl(222 84% 5%);
  --bg-card: hsl(222 84% 7%);
  --bg-secondary: hsl(217 32% 12%);
  --border-primary: hsl(217 32% 20%);
  --text-primary: hsl(var(--foreground));
  --text-secondary: hsl(215 20% 65%);
  --text-muted: hsl(var(--muted-foreground));
  --bg-base: hsl(222 84% 5%);
  --bg-elevated: hsl(222 84% 7%);
}
```

---

## User-Customisable Theme Color

### ThemeProvider Component

```typescript
// components/providers/ThemeProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Predefined colour options (HSL values for --primary)
export const THEME_COLORS = [
  { name: "آبی",      hsl: "217 91% 60%",  hex: "#3B82F6" },
  { name: "سبز",      hsl: "142 71% 45%",  hex: "#22C55E" },
  { name: "بنفش",     hsl: "263 70% 60%",  hex: "#8B5CF6" },
  { name: "نارنجی",   hsl: "25 95% 55%",   hex: "#F97316" },
  { name: "قرمز",     hsl: "0 84% 60%",    hex: "#EF4444" },
  { name: "فیروزه‌ای", hsl: "180 65% 45%",  hex: "#14B8A6" },
] as const;

const ThemeColorContext = createContext<{
  color: string;
  setColor: (hsl: string) => void;
}>({ color: "217 91% 60%", setColor: () => {} });

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [color, setColorState] = useState("217 91% 60%");

  useEffect(() => {
    const saved = localStorage.getItem("theme-color") ?? "217 91% 60%";
    setColorState(saved);
    document.documentElement.style.setProperty("--primary", saved);
  }, []);

  function setColor(hsl: string) {
    setColorState(hsl);
    localStorage.setItem("theme-color", hsl);
    document.documentElement.style.setProperty("--primary", hsl);
    // Also update --accent-primary for legacy components
    document.documentElement.style.setProperty("--accent-primary", `hsl(${hsl})`);
  }

  return (
    <ThemeColorContext.Provider value={{ color, setColor }}>
      <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
      </NextThemesProvider>
    </ThemeColorContext.Provider>
  );
}

export const useThemeColor = () => useContext(ThemeColorContext);
```

### Theme Color Picker Component

```typescript
// components/admin/ThemeColorPicker.tsx
"use client";

import { useThemeColor, THEME_COLORS } from "@/components/providers/ThemeProvider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeColorPicker() {
  const { color, setColor } = useThemeColor();
  return (
    <div className="flex items-center gap-2 p-2">
      {THEME_COLORS.map((c) => (
        <Tooltip key={c.hsl}>
          <TooltipTrigger asChild>
            <button
              className="w-6 h-6 rounded-full ring-offset-2 transition-all hover:scale-110"
              style={{
                backgroundColor: c.hex,
                outline: color === c.hsl ? `2px solid ${c.hex}` : "none",
                outlineOffset: "2px",
              }}
              onClick={() => setColor(c.hsl)}
            />
          </TooltipTrigger>
          <TooltipContent>{c.name}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
```

---

## Persian/Jalali Date Picker

### Wrapper Component

```typescript
// components/ui/PersianDatePicker.tsx
"use client";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PersianDatePickerProps {
  value?: string;  // ISO date string
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PersianDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className,
  disabled,
}: PersianDatePickerProps) {
  return (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      calendarPosition="bottom-right"
      value={value ? new Date(value) : undefined}
      onChange={(date) => {
        if (date) {
          const gregorian = date.toDate();
          onChange?.(gregorian.toISOString());
        }
      }}
      disabled={disabled}
      render={(value, openCalendar) => (
        <Input
          value={value}
          onClick={openCalendar}
          placeholder={placeholder}
          className={cn("cursor-pointer", className)}
          readOnly
        />
      )}
    />
  );
}
```

---

## Typography

```css
/* IranSans already self-hosted (from previous implementation) */
/* In globals.css add: */

body {
  font-family: "IranSans", system-ui, sans-serif;
  direction: rtl;
}

/* Monospace / numbers (LTR for codes, phone numbers) */
.ltr { direction: ltr; unicode-bidi: isolate; }
.mono { font-family: "Courier New", monospace; }
```

---

## DataTable (replaces MUI DataGrid + Ant Table)

```typescript
// components/ui/data-table.tsx
"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns, data, searchKey, searchPlaceholder = "جستجو...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter },
  });

  return (
    <div className="space-y-4">
      {searchKey && (
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      )}
      <div className="rounded-xl border border-[var(--border-primary)] overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-[var(--bg-secondary)]">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="text-right">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-[var(--bg-secondary)]/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-10 text-[var(--text-muted)]">
                  داده‌ای یافت نشد
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {table.getFilteredRowModel().rows.length} ردیف
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            قبلی
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            بعدی
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## Responsive Breakpoints

```
xs: 375px  (mobile — all pages must work)
sm: 640px  (large mobile)
md: 768px  (tablet)
lg: 1024px (laptop)
xl: 1280px (desktop)
2xl: 1536px (wide)
```

### Admin Sidebar Responsive

```typescript
// Sidebar: hidden on mobile, opens as Sheet/Drawer
// Breakpoint: hide at < md (768px)

// In AdminSidebar.tsx:
// Desktop: fixed left sidebar (w-64)
// Mobile: Sheet from left, triggered by hamburger in AdminHeader
```

---

## Status Badges

```typescript
// components/ui/StatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const PROJECT_LEVEL_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "ثبت شده",         color: "bg-gray-500" },
  1: { label: "در انتظار بررسی", color: "bg-yellow-500" },
  2: { label: "کارشناسی",        color: "bg-blue-500" },
  3: { label: "نقشه",            color: "bg-purple-500" },
  4: { label: "تست",             color: "bg-orange-500" },
  5: { label: "ارت",             color: "bg-teal-500" },
  6: { label: "تابلو",           color: "bg-indigo-500" },
  7: { label: "بازرسی",          color: "bg-pink-500" },
  8: { label: "تحویل",           color: "bg-green-500" },
  9: { label: "تکمیل شده",       color: "bg-emerald-600" },
};

export function ProjectLevelBadge({ level }: { level: number }) {
  const config = PROJECT_LEVEL_LABELS[level] ?? { label: "نامعلوم", color: "bg-gray-400" };
  return (
    <Badge className={cn("text-white text-xs", config.color)}>
      {config.label}
    </Badge>
  );
}
```

---

## Font Numeral Helper

```typescript
// lib/numeral.ts
// Convert Western digits to Persian/Arabic-Indic
export function toPersianDigits(n: string | number): string {
  const persianDigits = ["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"];
  return String(n).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

// Format currency (Rial/Toman)
export function formatCurrency(amount: number, unit: "rial" | "toman" = "toman"): string {
  const value = unit === "toman" ? Math.floor(amount / 10) : amount;
  return toPersianDigits(value.toLocaleString("fa-IR")) + " " + (unit === "toman" ? "تومان" : "ریال");
}
```
