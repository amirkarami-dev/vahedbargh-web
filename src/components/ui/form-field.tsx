import { cn } from "@/lib/cn";
import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <Label>
          {label}
          {required && (
            <span className="text-red-500 mr-1" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
