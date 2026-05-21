import { cn } from "@/lib/cn";
import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  dir?: "ltr" | "rtl";
  placeholder?: string;
  options?: SelectOption[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, dir, placeholder, options, children, ...props }, ref) => (
    <select
      ref={ref}
      dir={dir}
      className={cn(
        "w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
        "text-[var(--text-primary)]",
        "focus:outline-none focus:border-[var(--accent-primary)] transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "appearance-none cursor-pointer",
        className
      )}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options
        ? options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))
        : children}
    </select>
  )
);
Select.displayName = "Select";

export { Select };
export type { SelectOption };
