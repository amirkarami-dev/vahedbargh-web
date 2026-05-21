import { cn } from "@/lib/cn";
import { forwardRef, type InputHTMLAttributes } from "react";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputEl = (
      <input
        ref={ref}
        type="checkbox"
        id={id}
        className={cn(
          "w-4 h-4 rounded border border-[var(--border-primary)] bg-[var(--bg-secondary)]",
          "accent-[var(--accent-primary)] cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );

    if (!label) return inputEl;

    return (
      <label
        htmlFor={id}
        className="inline-flex items-center gap-2 cursor-pointer select-none text-sm text-[var(--text-primary)]"
      >
        {inputEl}
        <span>{label}</span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
