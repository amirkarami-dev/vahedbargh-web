"use client";

import { cn } from "@/lib/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function toPersianDigits(n: number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];

  pages.push(1);

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav
      role="navigation"
      aria-label="صفحه‌بندی"
      className={cn("flex items-center gap-1 flex-wrap", className)}
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={cn(
          "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
          "border border-[var(--border-primary)]",
          page === 1
            ? "opacity-40 cursor-not-allowed text-[var(--text-muted)]"
            : "hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        )}
        aria-label="صفحه قبلی"
      >
        ‹
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 py-1.5 text-[var(--text-muted)] text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "min-w-[2rem] px-2 py-1.5 rounded-lg text-sm font-medium transition-colors",
              "border",
              p === page
                ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                : "border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {toPersianDigits(p)}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={cn(
          "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
          "border border-[var(--border-primary)]",
          page === totalPages
            ? "opacity-40 cursor-not-allowed text-[var(--text-muted)]"
            : "hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        )}
        aria-label="صفحه بعدی"
      >
        ›
      </button>
    </nav>
  );
}
