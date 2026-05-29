"use client";

import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  loginWithUsernameAction,
  sendOtpAction,
} from "@/lib/auth-actions";
import { Eye, EyeOff, Lock, User, Smartphone, ShieldCheck } from "lucide-react";
import Image from "next/image";

type Tab = "username" | "mobile";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/admin";
  const loginBase = "/admin/login";
  const isForbidden = searchParams.get("error") === "forbidden";

  const [tab, setTab] = useState<Tab>("username");
  const [showPassword, setShowPassword] = useState(false);

  const [usernameState, usernameAction, usernameLoading] = useActionState(
    loginWithUsernameAction,
    { error: "" }
  );
  const [otpState, otpAction, otpLoading] = useActionState(sendOtpAction, {
    error: "",
  });

  return (
    <div
      className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-4 shadow-lg overflow-hidden border border-amber-100">
            <Image
              src="/logo.png"
              alt="KURDNEZAM"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            پنل مدیریت KURDNEZAM
          </h1>
          <p className="text-[var(--text-muted)] mt-1 text-sm flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            ورود به سامانه مدیریت
          </p>
        </div>

        {isForbidden && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm text-center">
            شما دسترسی به پنل مدیریت ندارید. لطفاً با حساب کاربری مناسب وارد شوید.
          </div>
        )}

        {/* Card */}
        <div className="bg-[var(--bg-elevated)] border border-amber-500/20 rounded-2xl p-8 shadow-xl shadow-amber-900/10">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] mb-6">
            <button
              type="button"
              onClick={() => setTab("username")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === "username"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <User className="w-4 h-4" />
              نام کاربری
            </button>
            <button
              type="button"
              onClick={() => setTab("mobile")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === "mobile"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              موبایل
            </button>
          </div>

          {/* Username / password form */}
          {tab === "username" && (
            <form action={usernameAction} className="space-y-5">
              <input type="hidden" name="redirect" value={redirectTo} />

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  نام کاربری
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    name="userName"
                    required
                    dir="ltr"
                    autoComplete="username"
                    placeholder="نام کاربری مدیر"
                    className="w-full pr-10 pl-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  رمز عبور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    dir="ltr"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pr-10 pl-10 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors text-left"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {usernameState.error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  {usernameState.error}
                </p>
              )}

              <button
                type="submit"
                disabled={usernameLoading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
              >
                {usernameLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    در حال ورود...
                  </>
                ) : (
                  "ورود به پنل مدیریت"
                )}
              </button>
            </form>
          )}

          {/* Mobile OTP form */}
          {tab === "mobile" && (
            <form action={otpAction} className="space-y-5">
              <input type="hidden" name="redirect" value={redirectTo} />
              <input type="hidden" name="loginBase" value={loginBase} />

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  شماره موبایل
                </label>
                <div className="relative">
                  <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    dir="ltr"
                    autoComplete="tel"
                    placeholder="09XXXXXXXXX"
                    maxLength={11}
                    className="w-full pr-10 pl-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors text-left tracking-wider"
                  />
                </div>
                <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                  کد تأیید به این شماره ارسال می‌شود
                </p>
              </div>

              {otpState.error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  {otpState.error}
                </p>
              )}

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
              >
                {otpLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    در حال ارسال...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    ارسال کد تأیید
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[var(--text-muted)] text-xs mt-6">
          سامانه یکپارچه دفتر اجرایی نظارت برق
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
