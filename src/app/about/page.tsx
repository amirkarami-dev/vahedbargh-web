import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield, Target, BookOpen, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "درباره ما",
};

const missions = [
  { icon: Shield, title: "نظارت فنی", description: "نظارت بر حسن اجرای پروژه‌های برق ساختمانی مطابق با مقررات ملی و استانداردهای فنی" },
  { icon: Target, title: "ارتقاء کیفیت", description: "ارتقاء کیفیت اجرای کارهای برق و ایمنی تأسیسات الکتریکی در استان کردستان" },
  { icon: BookOpen, title: "آموزش و توسعه", description: "آموزش و توانمندسازی کارشناسان و ناظران حوزه برق ساختمان" },
  { icon: Users, title: "هماهنگی سازمانی", description: "هماهنگی بین سازمان‌های مرتبط و یکپارچه‌سازی فرآیندهای اجرایی" },
];

const boardMembers = [
  { name: "مدیر اجرایی دفتر", role: "رئیس هیئت رئیسه", description: "منتخب هیئت مدیره سازمان" },
  { name: "نماینده هیئت مدیره", role: "عضو هیئت رئیسه", description: "نماینده انتصابی هیئت مدیره" },
  { name: "نماینده مجمع عمومی", role: "عضو هیئت رئیسه", description: "منتخب مجمع عمومی" },
];

const duties = [
  "نظارت بر اجرای صحیح ضوابط و مقررات فنی مربوط به تأسیسات برقی",
  "بررسی و تأیید صلاحیت کارشناسان برق",
  "صدور پروانه اشتغال و کنترل کیفیت",
  "رسیدگی به شکایات و تخلفات",
  "همکاری با ادارات و سازمان‌های دولتی ذیربط",
  "برگزاری دوره‌های آموزشی و مهارت‌افزایی",
  "تهیه و به‌روزرسانی دستورالعمل‌های فنی",
  "تدوین تعرفه‌های خدمات مهندسی برق",
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-16">
          {/* Introduction */}
          <section>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">درباره دفتر اجرایی</h1>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8">
              <p className="text-[var(--text-secondary)] leading-loose text-base">
                دفتر اجرایی نظارت برق، یکی از واحدهای تخصصی سازمان نظام مهندسی ساختمان استان کردستان است که با هدف
                نظارت بر حسن اجرای پروژه‌های برق ساختمانی و ارتقاء ایمنی تأسیسات الکتریکی در استان فعالیت می‌نماید.
                این دفتر بر اساس نظام‌نامه مصوب مورخ ۱۳۹۳/۰۵/۰۲ هیئت مدیره سازمان تشکیل شده و فعالیت‌های خود را
                در چارچوب قوانین و مقررات ملی ساختمان انجام می‌دهد.
              </p>
            </div>
          </section>

          {/* Missions */}
          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">اهداف و مأموریت</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {missions.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.title} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)] mb-1">{m.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">{m.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Org chart */}
          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">ساختار سازمانی</h2>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8">
              <div className="flex flex-col items-center gap-0">
                <div className="px-6 py-3 rounded-xl bg-[var(--primary)] border border-blue-600/30 text-[var(--text-primary)] font-semibold text-center text-sm">
                  هیئت مدیره سازمان نظام مهندسی
                </div>
                <div className="w-px h-8 bg-blue-600/40" />
                <div className="px-6 py-3 rounded-xl bg-blue-600/15 border border-blue-600/30 text-blue-300 font-semibold text-center text-sm">
                  هیئت رئیسه دفتر اجرایی (۳ نفر)
                </div>
                <div className="w-px h-8 bg-blue-600/40" />
                <div className="flex gap-8 items-start">
                  <div className="flex flex-col items-center gap-0">
                    <div className="w-px h-4 bg-blue-600/40" />
                    <div className="px-4 py-2.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text-secondary)] text-xs text-center">
                      مدیر اجرایی
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-0">
                    <div className="w-px h-4 bg-blue-600/40" />
                    <div className="px-4 py-2.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text-secondary)] text-xs text-center">
                      نمایندگان شهرستان‌ها
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Board members */}
          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">هیئت رئیسه</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {boardMembers.map((member) => (
                <div key={member.role} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--bg-raised)] mx-auto mb-3 flex items-center justify-center">
                    <Users className="w-8 h-8 text-[var(--text-muted)]" />
                  </div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{member.name}</h3>
                  <p className="text-sm text-blue-400 mt-1">{member.role}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{member.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Duties */}
          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">شرح وظایف</h2>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8">
              <ul className="space-y-3">
                {duties.map((duty, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-600/15 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)] leading-relaxed">{duty}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
