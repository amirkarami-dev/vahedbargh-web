import Link from "next/link";
import { Plus, ChevronLeft } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  newHref?: string;
  newLabel?: string;
  backHref?: string;
  backLabel?: string;
}

export default function AdminPageHeader({
  title,
  description,
  newHref,
  newLabel = "افزودن جدید",
  backHref,
  backLabel,
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            {backLabel ?? "بازگشت"}
          </Link>
        )}
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
        {description && <p className="text-[var(--text-muted)] mt-1 text-sm">{description}</p>}
      </div>
      {newHref && (
        <Link
          href={newHref}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {newLabel}
        </Link>
      )}
    </div>
  );
}
