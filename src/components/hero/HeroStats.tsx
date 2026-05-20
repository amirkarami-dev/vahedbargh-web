import { FileCheck, Users, Activity, ShieldCheck, TrendingUp, Award, Building2, ClipboardCheck } from "lucide-react";
import { toPersianNumber } from "@/lib/persian-numbers";
import type { StatItem } from "@/types";

const iconMap = {
  FileCheck,
  Users,
  Activity,
  ShieldCheck,
  TrendingUp,
  Award,
  Building2,
  ClipboardCheck,
};

export function HeroStats({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-10">
      {stats.map((stat) => {
        const Icon = iconMap[stat.iconName as keyof typeof iconMap] ?? FileCheck;
        const display = toPersianNumber(stat.value.toLocaleString("en-US")) + stat.suffix;
        return (
          <div
            key={stat.id}
            className="glass rounded-2xl border border-[var(--border)] p-4 flex items-center gap-3 hover:border-[var(--border-active)] transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--text-primary)] leading-none">{display}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
