"use client";

import { cn } from "@/lib/cn";
import { useRef, useState, type ChangeEvent } from "react";

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  label?: string;
  currentFileName?: string;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept,
  multiple = false,
  maxSizeMB,
  label = "انتخاب فایل",
  currentFileName,
  className,
  disabled,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedName, setSelectedName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    if (maxSizeMB) {
      const oversized = files.filter(
        (f) => f.size > maxSizeMB * 1024 * 1024
      );
      if (oversized.length > 0) {
        setError(
          `حجم فایل نباید بیشتر از ${maxSizeMB} مگابایت باشد`
        );
        e.target.value = "";
        return;
      }
    }

    setSelectedName(
      files.length === 1
        ? files[0].name
        : `${files.length} فایل انتخاب شد`
    );
    onFileSelect(files);
  };

  const displayName = selectedName || currentFileName;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
          "bg-[var(--bg-secondary)] border border-[var(--border-primary)] border-dashed",
          "text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]",
          "transition-colors cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <svg
          className="w-5 h-5 flex-shrink-0 text-[var(--text-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        <span className="text-sm truncate flex-1 text-right">
          {displayName || label}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
      />

      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
