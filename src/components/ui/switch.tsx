"use client";

import { cn } from "@/lib/cn";
import { forwardRef, type InputHTMLAttributes } from "react";

interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, checked, onChange, ...props }, ref) => {
    const input = (
      <label
        className={cn(
          "relative inline-flex items-center cursor-pointer",
          props.disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            "w-11 h-6 rounded-full transition-colors duration-200",
            "bg-[var(--border-primary)] peer-checked:bg-[var(--accent-primary)]",
            "after:content-[''] after:absolute after:top-[2px] after:right-[2px]",
            "after:bg-white after:rounded-full after:w-5 after:h-5 after:transition-all after:duration-200",
            "peer-checked:after:translate-x-[-20px]"
          )}
        />
      </label>
    );

    if (!label) return input;

    return (
      <div className="inline-flex items-center gap-3">
        {input}
        <label
          htmlFor={id}
          className="text-sm text-[var(--text-primary)] cursor-pointer select-none"
        >
          {label}
        </label>
      </div>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
