"use client";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">تماس با ما</h1>
            <p className="text-[var(--text-secondary)] mt-2">با دفتر اجرایی نظارت برق در ارتباط باشید</p>
          </div>

          {/* Map placeholder */}
          <div className="rounded-2xl border border-[var(--border)] overflow-hidden mb-8 h-64 bg-[var(--bg-raised)] flex items-center justify-center">
            <div className="text-center text-[var(--text-muted)]">
              <MapPin className="w-10 h-10 mx-auto mb-2 text-blue-400" />
              <p className="text-sm">سنندج، میدان کوهنورد، ساختمان نظام مهندسی</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Contact form */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
              <h2 className="font-bold text-[var(--text-primary)] mb-4">ارسال پیام</h2>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600/15 flex items-center justify-center mx-auto mb-3">
                    <Send className="w-7 h-7 text-emerald-400" />
                  </div>
                  <p className="text-emerald-400 font-medium">پیام شما ارسال شد</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">در اسرع وقت پاسخ خواهیم داد</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1.5">نام و نام خانوادگی</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500 text-sm"
                      placeholder="نام کامل"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1.5">موضوع</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500 text-sm"
                      placeholder="موضوع پیام"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1.5">پیام</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500 text-sm resize-none"
                      placeholder="متن پیام خود را بنویسید..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    ارسال پیام
                  </button>
                </form>
              )}
            </div>

            {/* Contact info */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
                <h2 className="font-bold text-[var(--text-primary)] mb-4">اطلاعات تماس</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-0.5">آدرس</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        سنندج، میدان کوهنورد، ساختمان سازمان نظام مهندسی ساختمان استان کردستان
                      </p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-0.5">تلفن</p>
                      <p className="text-sm text-[var(--text-secondary)]" dir="ltr">۰۸۷-۳۳۲۷۰۰۰۰</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-0.5">ایمیل</p>
                      <p className="text-sm text-[var(--text-secondary)]">info@inse-kurdistan.ir</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-0.5">ساعات کاری</p>
                      <p className="text-sm text-[var(--text-secondary)]">شنبه تا چهارشنبه — ۸ تا ۱۶</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
