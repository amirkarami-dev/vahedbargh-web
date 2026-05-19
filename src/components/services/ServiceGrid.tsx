import Link from "next/link";
import {
  FileSearch, UserPlus, DollarSign, Download,
  Zap, ShieldCheck, GitBranch, BarChart2,
  type LucideIcon
} from "lucide-react";

interface ServiceItem {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

const services: ServiceItem[] = [
  { icon: FileSearch, title: "پیگیری پروانه", description: "استعلام وضعیت پروانه برق", href: "/services#parvaneh" },
  { icon: UserPlus, title: "ثبت‌نام کارشناس", description: "ثبت‌نام و احراز صلاحیت", href: "/services#register" },
  { icon: DollarSign, title: "استعلام تعرفه", description: "تعرفه‌های اجرای الکترود زمین", href: "/services#tariff" },
  { icon: Download, title: "دانلود فرم‌ها", description: "فرم‌های اجرایی و استاندارد", href: "/archive" },
  { icon: Zap, title: "مدیریت پروژه", description: "نظارت بر پروژه‌های برق", href: "/services#projects" },
  { icon: ShieldCheck, title: "نظارت فنی", description: "بازرسی و کنترل کیفیت", href: "/services#inspection" },
  { icon: GitBranch, title: "گردش کار", description: "اتوماسیون فرآیندهای اداری", href: "/services#workflow" },
  { icon: BarChart2, title: "گزارش‌ها", description: "آمار و گزارش عملکرد دفتر", href: "/services#reports" },
];

export function ServiceGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">دسترسی سریع</h2>
        <p className="text-[var(--text-secondary)] mt-2">خدمات و امکانات دفتر اجرایی نظارت برق</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.title}
              href={service.href}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-active)] hover:shadow-[0_0_20px_rgba(37,99,235,0.12)] transition-all duration-300 hover:-translate-y-1 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                <Icon className="w-6 h-6 text-blue-500 group-hover:drop-shadow-[0_0_8px_rgba(37,99,235,0.8)] transition-all" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{service.title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{service.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
