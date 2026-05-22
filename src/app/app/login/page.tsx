"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

function AppLoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/app";

  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(loginAction, { error: "" });

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-4 shadow-lg overflow-hidden border border-blue-100">
            <Image src="/logo.png" alt="KURDNEZAM" width={64} height={64} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">سامانه کاربری KURDNEZAM</h1>
          <p className="text-[var(--text-muted)] mt-1 text-sm">ورود به سامانه کاربری</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-8 shadow-xl">
          <form action={formAction} className="space-y-5">
            {/* Pass redirect as hidden field */}
            <input type="hidden" name="redirect" value={redirectTo} />

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                آدرس ایمیل
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  name="email"
                  required
                  dir="ltr"
                  placeholder="user@example.ir"
                  className="w-full pr-10 pl-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors text-left"
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
                  placeholder="••••••••"
                  className="w-full pr-10 pl-10 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors text-left"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {state.error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
            >
              {isPending ? "در حال ورود..." : "ورود به سامانه"}
            </button>
          </form>
        </div>

        <p className="text-center text-[var(--text-muted)] text-xs mt-6">
          سامانه یکپارچه دفتر اجرایی نظارت برق
        </p>
      </div>
    </div>
  );
}

export default function AppLoginPage() {
  return (
    <Suspense>
      <AppLoginForm />
    </Suspense>
  );
}
