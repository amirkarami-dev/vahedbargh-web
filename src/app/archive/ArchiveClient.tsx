"use client";
import { useState } from "react";
import { formatJalaliDate } from "@/lib/jalali";
import { toPersianNumber } from "@/lib/persian-numbers";
import { cn } from "@/lib/cn";
import { Download, Search, FileText, Star, Folder } from "lucide-react";
import type { Document, DocumentCategory } from "@/types";

interface Props {
  documents: Document[];
}

export function ArchiveClient({ documents }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | "همه">("همه");
  const [sortBy, setSortBy] = useState<"date" | "downloads" | "name">("date");

  const allCategories = Array.from(new Set(documents.map((d) => d.category)));

  const filtered = documents
    .filter((d) => {
      const matchCat = activeCategory === "همه" || d.category === activeCategory;
      const matchSearch =
        !search ||
        d.title.includes(search) ||
        d.description.includes(search) ||
        d.tags.some((t) => t.includes(search));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "downloads") return b.downloadCount - a.downloadCount;
      if (sortBy === "name") return a.title.localeCompare(b.title, "fa");
      return 0;
    });

  const categoryCounts = allCategories.map((cat) => ({
    name: cat,
    count: documents.filter((d) => d.category === cat).length,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">آرشیو اسناد</h1>
        <p className="text-[var(--text-secondary)] mt-2">مرکز دانلود اسناد، فرم‌ها و مقررات دفتر اجرایی</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 sticky top-20">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-400" />
              دسته‌بندی‌ها
            </h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveCategory("همه")}
                  className={cn(
                    "w-full text-right px-3 py-2 rounded-xl text-sm flex items-center justify-between transition-colors",
                    activeCategory === "همه"
                      ? "bg-blue-600/15 text-blue-400 font-medium"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-raised)]"
                  )}
                >
                  <span>همه اسناد</span>
                  <span className="text-xs bg-[var(--bg-raised)] px-1.5 py-0.5 rounded">
                    {toPersianNumber(documents.length)}
                  </span>
                </button>
              </li>
              {categoryCounts.map(({ name, count }) => (
                <li key={name}>
                  <button
                    onClick={() => setActiveCategory(name as DocumentCategory)}
                    className={cn(
                      "w-full text-right px-3 py-2 rounded-xl text-sm flex items-center justify-between transition-colors",
                      activeCategory === name
                        ? "bg-blue-600/15 text-blue-400 font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-raised)]"
                    )}
                  >
                    <span>{name}</span>
                    <span className="text-xs bg-[var(--bg-raised)] px-1.5 py-0.5 rounded">
                      {toPersianNumber(count)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search + sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="search"
                placeholder="جستجو در اسناد..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="date">ترتیب: تاریخ</option>
              <option value="downloads">ترتیب: بیشترین دانلود</option>
              <option value="name">ترتیب: نام</option>
            </select>
          </div>

          <p className="text-sm text-[var(--text-muted)]">
            {toPersianNumber(filtered.length)} سند یافت شد
          </p>

          {/* Documents table */}
          <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-raised)]">
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--text-muted)]">نام سند</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--text-muted)] hidden sm:table-cell">دسته</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--text-muted)] hidden md:table-cell">تاریخ</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--text-muted)] hidden lg:table-cell">نسخه</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--text-muted)]">دریافت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((doc) => (
                  <tr
                    key={doc.id}
                    className="bg-[var(--bg-elevated)] hover:bg-[var(--bg-raised)] transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[var(--text-primary)] font-medium line-clamp-1">{doc.title}</span>
                            {doc.downloadCount > 1000 && (
                              <Star className="w-3 h-3 text-amber-400" />
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{doc.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-xs bg-blue-600/15 text-blue-400 px-2 py-1 rounded-lg">{doc.category}</span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-xs text-[var(--text-muted)]">
                      {formatJalaliDate(doc.jalaliDate)}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-xs text-[var(--text-muted)]">
                      {doc.version}
                    </td>
                    <td className="px-4 py-4">
                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 text-xs font-medium transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </a>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-raised)] text-[var(--text-muted)] text-xs cursor-not-allowed">
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-[var(--text-muted)]">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>سندی یافت نشد</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
