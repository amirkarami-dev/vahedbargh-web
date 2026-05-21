import { cn } from "@/lib/cn";

const PROJECT_LEVEL_COLORS: Record<number, string> = {
  0: "bg-gray-500",
  1: "bg-yellow-500",
  2: "bg-blue-500",
  3: "bg-purple-500",
  4: "bg-orange-500",
  5: "bg-teal-500",
  6: "bg-indigo-500",
  7: "bg-pink-500",
  8: "bg-green-500",
  9: "bg-emerald-600",
};

const PROJECT_LEVEL_LABELS: Record<number, string> = {
  0: "ثبت شده",
  1: "در انتظار بررسی",
  2: "کارشناسی",
  3: "نقشه",
  4: "تست",
  5: "ارت",
  6: "تابلو",
  7: "بازرسی",
  8: "تحویل",
  9: "تکمیل شده",
};

export function ProjectLevelBadge({ level }: { level: number }) {
  const color = PROJECT_LEVEL_COLORS[level] ?? "bg-gray-400";
  const label = PROJECT_LEVEL_LABELS[level] ?? "نامعلوم";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-white",
        color
      )}
    >
      {label}
    </span>
  );
}

export { PROJECT_LEVEL_LABELS, PROJECT_LEVEL_COLORS };
