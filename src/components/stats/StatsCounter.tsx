"use client";
import { FileCheck, Users, Activity, ShieldCheck, TrendingUp, Award, Building2, ClipboardCheck, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { useCounter } from "@/hooks/useCounter";
import { toPersianNumber } from "@/lib/persian-numbers";
import type { StatItem } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  FileCheck,
  Users,
  Activity,
  ShieldCheck,
  TrendingUp,
  Award,
  Building2,
  ClipboardCheck,
};

function CounterItem({
  value,
  label,
  suffix,
  iconName,
  index,
  active,
}: {
  value: number;
  label: string;
  suffix: string;
  iconName: string;
  index: number;
  active: boolean;
}) {
  const count = useCounter(value, 2500, active);
  const Icon = iconMap[iconName] ?? FileCheck;

  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 20 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="text-center p-6"
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-600/20 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-blue-400" />
      </div>
      <div className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-1 tabular-nums">
        {toPersianNumber(count.toLocaleString("en-US"))}{suffix}
      </div>
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
    </motion.div>
  );
}

export function StatsCounter({ stats }: { stats: StatItem[] }) {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <section className="bg-[var(--bg-elevated)] border-y border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">عملکرد دفتر در یک نگاه</h2>
          <p className="text-[var(--text-secondary)] mt-2">آمار و اطلاعات تجمعی از آغاز فعالیت دفتر اجرایی</p>
        </div>
        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-x-reverse divide-[var(--border)]">
          {stats.map((stat, i) => (
            <CounterItem
              key={stat.id}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              iconName={stat.iconName}
              index={i}
              active={inView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
