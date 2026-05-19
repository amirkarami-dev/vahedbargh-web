"use client";
import { useState } from "react";
import { Eye, EyeOff, Zap, Shield, LogIn } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [userType, setUserType] = useState<"user" | "expert" | "admin">("user");

  const userTypeLabels = {
    user: "ورود کاربران",
    expert: "ورود کارشناسان",
    admin: "ورود مدیران",
  };

  return (
    <div className="glass rounded-3xl border border-[var(--border)] p-8 shadow-2xl shadow-black/30 w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/40">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">دفتر اجرایی نظارت برق</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">سازمان نظام مهندسی ساختمان استان کردستان</p>
      </div>

      {/* User type selector */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] mb-6">
        {(["user", "expert", "admin"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setUserType(type)}
            className={`py-2 rounded-lg text-xs font-medium transition-all ${
              userType === type
                ? "bg-blue-600 text-white shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {userTypeLabels[type]}
          </button>
        ))}
      </div>

      <form className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5" htmlFor="username">
            نام کاربری
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            aria-label="نام کاربری"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
            placeholder="نام کاربری یا شماره ملی"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5" htmlFor="password">
            کلمه عبور
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-label="کلمه عبور"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm pl-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me + forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-base)] text-blue-600 focus:ring-blue-500/30"
            />
            <span className="text-[var(--text-secondary)]">مرا به خاطر بسپار</span>
          </label>
          <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">
            فراموشی رمز
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 mt-2"
        >
          <LogIn className="w-4 h-4" />
          {userTypeLabels[userType]}
        </button>
      </form>

      {/* Security badge */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
        <Shield className="w-3.5 h-3.5 text-emerald-400" />
        <span>اتصال امن و رمزگذاری شده</span>
      </div>

      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-blue-400 transition-colors">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
