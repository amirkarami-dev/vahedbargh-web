"use client";

import { useState, useTransition } from "react";
import { updateProfile, changePassword } from "./actions";

interface ProfileFormProps {
  firstName: string;
  lastName: string;
  phone: string;
}

export function ProfileForm({ firstName, lastName, phone }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateProfile(formData);
      setResult(res);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">نام</label>
          <input
            name="firstName"
            defaultValue={firstName}
            required
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">نام خانوادگی</label>
          <input
            name="lastName"
            defaultValue={lastName}
            required
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">شماره موبایل</label>
        <input
          name="phone"
          defaultValue={phone}
          type="tel"
          className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
        />
      </div>
      {result && (
        <p className={`text-sm ${result.ok ? "text-emerald-400" : "text-red-400"}`}>
          {result.ok ? "پروفایل با موفقیت ذخیره شد" : (result.error ?? "خطایی رخ داد")}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
      </button>
    </form>
  );
}

interface ChangePasswordFormProps {}

export function ChangePasswordForm(_: ChangePasswordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setResult({ ok: false, error: "رمز عبور جدید و تکرار آن یکسان نیستند" });
      return;
    }
    if (newPw.length < 8) {
      setResult({ ok: false, error: "رمز عبور جدید باید حداقل ۸ کاراکتر باشد" });
      return;
    }
    startTransition(async () => {
      const res = await changePassword(currentPw, newPw);
      setResult(res);
      if (res.ok) {
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">رمز عبور فعلی</label>
        <input
          type="password"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
        />
      </div>
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">رمز عبور جدید</label>
        <input
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
        />
      </div>
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">تکرار رمز عبور جدید</label>
        <input
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
        />
      </div>
      {result && (
        <p className={`text-sm ${result.ok ? "text-emerald-400" : "text-red-400"}`}>
          {result.ok ? "رمز عبور با موفقیت تغییر کرد" : (result.error ?? "خطایی رخ داد")}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {isPending ? "در حال تغییر..." : "تغییر رمز عبور"}
      </button>
    </form>
  );
}
