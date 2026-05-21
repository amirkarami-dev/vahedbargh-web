import { cn } from "@/lib/cn";

interface SeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function Separator({
  className,
  orientation = "horizontal",
}: SeparatorProps) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn(
          "inline-block w-px self-stretch bg-[var(--border-primary)]",
          className
        )}
      />
    );
  }

  return (
    <hr
      role="separator"
      className={cn(
        "border-0 h-px w-full bg-[var(--border-primary)]",
        className
      )}
    />
  );
}
