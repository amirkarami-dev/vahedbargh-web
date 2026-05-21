"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "جستجو...",
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize } },
  });

  // Sync page size changes to table
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    table.setPageSize(size);
  };

  const totalFiltered = table.getFilteredRowModel().rows.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="space-y-4">
      {/* Search + page size */}
      {(searchKey !== undefined) && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>نمایش:</span>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                onClick={() => handlePageSizeChange(size)}
                className={cn(
                  "px-2 py-1 rounded-lg transition-colors",
                  pageSize === size
                    ? "bg-[var(--accent-primary)] text-white"
                    : "hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-[var(--border-primary)] overflow-hidden">
        <table className="w-full text-sm text-right">
          <thead className="bg-[var(--bg-secondary)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-[var(--text-secondary)] font-semibold text-right",
                      header.column.getCanSort() &&
                        "cursor-pointer select-none hover:text-[var(--text-primary)] transition-colors"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getIsSorted() === "asc" && (
                        <span aria-hidden>↑</span>
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <span aria-hidden>↓</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="border-t border-[var(--border-primary)]">
                  {columns.map((_, ci) => (
                    <td key={ci} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-[var(--text-primary)]">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-[var(--text-muted)]"
                >
                  داده‌ای یافت نشد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between text-sm flex-wrap gap-2">
        <p className="text-[var(--text-muted)]">
          {totalFiltered} ردیف
          {totalPages > 1 && ` — صفحه ${currentPage} از ${totalPages}`}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            قبلی
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            بعدی
          </Button>
        </div>
      </div>
    </div>
  );
}
