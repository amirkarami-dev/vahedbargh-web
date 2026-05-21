import { cn } from "@/lib/cn";
import { forwardRef, type InputHTMLAttributes } from "react";

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { dir?: "ltr" | "rtl" }
>(({ className, dir, ...props }, ref) => (
  <input
    ref={ref}
    dir={dir}
    className={cn(
      "w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
      "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
      "focus:outline-none focus:border-[var(--accent-primary)] transition-colors",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
