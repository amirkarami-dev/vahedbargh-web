import Link from "next/link";
import { Zap, Phone, Mail, MapPin } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-elevated)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-[var(--text-primary)]">دفتر اجرایی نظارت برق</p>
                <p className="text-xs text-[var(--text-muted)]">سازمان نظام مهندسی ساختمان استان کردستان</p>
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              نظارت  ·  ایمنی  ·  کیفیت
            </p>
          </div>

          {/* Nav links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">دسترسی سریع</h3>
            <nav className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-[var(--text-secondary)] hover:text-blue-400 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">تماس با ما</h3>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                <span>سنندج، میدان کوهنورد، ساختمان نظام مهندسی</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span dir="ltr">۰۸۷-۳۳۲۷۰۰۰۰</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>info@inse-kurdistan.ir</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            © ۱۴۰۵ — سامانه یکپارچه دفتر اجرایی نظارت برق (SEBNB)
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            سازمان نظام مهندسی ساختمان استان کردستان
          </p>
        </div>
      </div>
    </footer>
  );
}
