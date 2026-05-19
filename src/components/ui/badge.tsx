import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "urgent" | "important" | "info" | "success" | "default";
  className?: string;
}

const variants: Record<string, string> = {
  urgent: "bg-red-600 text-white",
  important: "bg-amber-600 text-white",
  info: "bg-blue-600 text-white",
  success: "bg-emerald-600 text-white",
  default: "bg-slate-600 text-white",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
