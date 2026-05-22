"use client";

import { useState, useTransition } from "react";
import { updateProfile, changePassword } from "./actions";

interface ProfileFormProps {
  mode?: "profile" | "password";
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  nationalCode: string;
}

export function ProfileForm({
  mode = "profile",
  firstName,
  lastName,
  phone,
  email,
  nationalCode,
}: ProfileFormProps) {
  if (mode === "password") {
    return <ChangePasswordSection email={email} />;
  }

  return <EditProfileSection firstName={firstName} lastName={lastName} phone={phone} nationalCode={nationalCode} />;
}

// ─── Edit profile ─────────────────────────────────────────────────────────────

interface EditProfileSectionProps {
  firstName: string;
  lastName: string;
  phone: string;
  nationalCode: string;
}

function EditProfileSection({ firstName, lastName, phone, nationalCode }: EditProfileSectionProps) {
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
            className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">نام خانوادگی</label>
          <input
            name="lastName"
            defaultValue={lastName}
            required
            className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">شماره موبایل</label>
          <input
            name="phone"
            defaultValue={phone}
            type="tel"
            dir="ltr"
            className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">کد ملی</label>
          <input
            name="nationalCode"
            defaultValue={nationalCode}
            maxLength={10}
            dir="ltr"
            className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>
      </div>

      {result && (
        <p className={`text-sm ${result.ok ? "text-emerald-400" : "text-red-400"}`}>
          {result.ok ? "اطلاعات با موفقیت ذخیره شد" : (result.error ?? "خطایی رخ داد")}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
      </button>
    </form>
  );
}

// ─── Change password ──────────────────────────────────────────────────────────

interface ChangePasswordSectionProps {
  email: string;
}

function ChangePasswordSection({ email: _email }: ChangePasswordSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setResult({ ok: false, error: "رمز عبور جدید و تکرار آن یکسان نیستند" });
      return;
    }
    if (newPw.length < 8) {
      setResult({ ok: false, error: "رمز عبور باید حداقل ۸ کاراکتر باشد" });
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
          autoComplete="current-password"
          className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">رمز عبور جدید</label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">تکرار رمز عبور جدید</label>
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>
      </div>

      {result && (
        <p className={`text-sm ${result.ok ? "text-emerald-400" : "text-red-400"}`}>
          {result.ok ? "رمز عبور با موفقیت تغییر کرد" : (result.error ?? "خطایی رخ داد")}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {isPending ? "در حال تغییر..." : "تغییر رمز عبور"}
      </button>
    </form>
  );
}
