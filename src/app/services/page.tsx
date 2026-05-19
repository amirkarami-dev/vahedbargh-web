import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { earthElectrodeTariffs } from "@/data/documents";
import { formatCurrency } from "@/lib/persian-numbers";
import { toPersianNumber } from "@/lib/persian-numbers";
import { Zap, FileSearch, UserPlus, DollarSign } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "خدمات",
};

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">خدمات دفتر</h1>
            <p className="text-[var(--text-secondary)] mt-2">امکانات و خدمات قابل ارائه دفتر اجرایی نظارت برق</p>
          </div>

          <div className="space-y-8">
            {/* Tariff table */}
            <section id="tariff" className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-[var(--border)] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600/15 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="font-bold text-[var(--text-primary)]">تعرفه‌های اجرای الکترود زمین</h2>
                  <p className="text-xs text-[var(--text-muted)]">قیمت‌های پیشنهادی — اردیبهشت ماه ۱۴۰۵</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-raised)]">
                      <th className="text-right px-5 py-3 text-xs font-semibold text-[var(--text-muted)]">ردیف</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-[var(--text-muted)]">روش اجرا</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-[var(--text-muted)]">قیمت</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-[var(--text-muted)]">واحد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {earthElectrodeTariffs.map((t) => (
                      <tr key={t.id} className="hover:bg-[var(--bg-raised)] transition-colors">
                        <td className="px-5 py-4 text-[var(--text-muted)] tabular-nums">{toPersianNumber(t.id)}</td>
                        <td className="px-5 py-4 text-[var(--text-primary)] font-medium">{t.method}</td>
                        <td className="px-5 py-4 text-emerald-400 font-semibold tabular-nums" dir="ltr">
                          {toPersianNumber(t.price.toLocaleString("en-US"))}
                        </td>
                        <td className="px-5 py-4 text-[var(--text-muted)] text-xs">{t.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[var(--text-muted)] p-4 border-t border-[var(--border)]">
                * قیمت‌ها به تومان بوده و شامل مالیات نمی‌باشند. تعرفه‌ها مصوب هیئت رئیسه دفتر اجرایی نظارت برق است.
              </p>
            </section>

            {/* Service cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div id="parvaneh" className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
                <div className="w-10 h-10 rounded-xl bg-blue-600/15 flex items-center justify-center mb-4">
                  <FileSearch className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] mb-2">پیگیری وضعیت پروانه</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  استعلام آنلاین وضعیت پروانه برق و پیگیری مراحل صدور. برای دسترسی به این سرویس نیاز به ورود به سامانه دارید.
                </p>
              </div>

              <div id="register" className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
                <div className="w-10 h-10 rounded-xl bg-blue-600/15 flex items-center justify-center mb-4">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] mb-2">ثبت‌نام کارشناسان</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  فرآیند ثبت‌نام، احراز صلاحیت و تمدید اعتبار کارشناسان حوزه برق. فرم ثبت‌نام در بخش آرشیو قابل دانلود است.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
