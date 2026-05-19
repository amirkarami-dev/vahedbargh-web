import { FileCheck, Users, Activity, ShieldCheck } from "lucide-react";
import { heroStats } from "@/data/stats";

const iconMap = {
  FileCheck,
  Users,
  Activity,
  ShieldCheck,
};

export function HeroStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-10">
      {heroStats.map((stat, i) => {
        const Icon = iconMap[stat.iconName as keyof typeof iconMap];
        return (
          <div
            key={i}
            className="glass rounded-2xl border border-[var(--border)] p-4 flex items-center gap-3 hover:border-[var(--border-active)] transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--text-primary)] leading-none">{stat.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
