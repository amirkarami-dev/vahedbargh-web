"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { verifyOtpAction, sendOtpAction } from "@/lib/auth-actions";
import { Smartphone, ArrowRight, RefreshCw, CheckCircle } from "lucide-react";
import Image from "next/image";

interface OtpCardProps {
  phone: string;        // 09XXXXXXXXX local format
  redirectTo: string;
  loginBase: string;    // e.g. /login, /app/login, /admin/login
  /** Show a hint to check the server console (no SMS provider configured) */
  devMode?: boolean;
}

export function OtpCard({ phone, redirectTo, loginBase, devMode }: OtpCardProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [verifyState, verifyAction, isVerifying] = useActionState(verifyOtpAction, { error: "" });
  const [, resendAction] = useActionState(sendOtpAction, { error: "" });

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  function handleChange(idx: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (e.key === "ArrowLeft" && idx > 0) inputRefs.current[idx - 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) next[i] = text[i] ?? "";
    setDigits(next);
    const focusIdx = Math.min(text.length, 5);
    inputRefs.current[focusIdx]?.focus();
  }

  async function handleResend() {
    setResending(true);
    const fd = new FormData();
    fd.set("phone", phone);
    fd.set("redirect", redirectTo);
    fd.set("loginBase", loginBase);
    await resendAction(fd);
    setResending(false);
    setResent(true);
    setCountdown(120);
    setCanResend(false);
    setDigits(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    setTimeout(() => setResent(false), 3000);
  }

  const token = digits.join("");
  const isFilled = token.length === 6;

  const maskedPhone = phone.slice(0, 4) + "***" + phone.slice(7);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-4 shadow-lg overflow-hidden border border-blue-100">
            <Image src="/logo.png" alt="KURDNEZAM" width={64} height={64} className="object-contain" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-8 shadow-xl">
          {/* Icon + heading */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-600/10 border-2 border-blue-500/30 flex items-center justify-center mb-4">
              <Smartphone className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">تأیید شماره موبایل</h2>
            <p className="text-sm text-[var(--text-muted)] mt-2 text-center leading-relaxed">
              کد ۶ رقمی ارسال‌شده به شماره
              <br />
              <span className="text-[var(--text-secondary)] font-medium ltr inline-block mt-1 tracking-wider">
                {maskedPhone}
              </span>
              <br />
              را وارد کنید
            </p>
            {devMode && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs text-center">
                حالت توسعه: کد را در کنسول سرور (ترمینال) ببینید
              </div>
            )}
          </div>

          {/* OTP boxes */}
          <form
            action={verifyAction}
            onPaste={handlePaste}
          >
            <input type="hidden" name="phone" value={phone} />
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="redirect" value={redirectTo} />

            {/* 6 digit boxes — LTR direction so first box is on left */}
            <div className="flex gap-3 justify-center mb-6" dir="ltr">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 bg-[var(--bg-base)] text-[var(--text-primary)] outline-none transition-all duration-200
                    ${d ? "border-blue-500 bg-blue-500/5" : "border-[var(--border)]"}
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {/* Error */}
            {verifyState.error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {verifyState.error}
              </div>
            )}

            {/* Resent confirmation */}
            {resent && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                کد جدید ارسال شد
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!isFilled || isVerifying}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  در حال تأیید...
                </>
              ) : (
                "تأیید و ورود"
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-5 text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                ارسال مجدد کد
              </button>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                ارسال مجدد کد در{" "}
                <span className="text-[var(--text-secondary)] font-medium tabular-nums">
                  {String(Math.floor(countdown / 60)).padStart(2, "0")}:
                  {String(countdown % 60).padStart(2, "0")}
                </span>{" "}
                دیگر
              </p>
            )}
          </div>

          {/* Back link */}
          <div className="mt-4 text-center">
            <a
              href={loginBase}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              بازگشت
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
