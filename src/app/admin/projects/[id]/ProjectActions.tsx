"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitProject, stopProject, deleteProject } from "../actions";

interface ProjectActionsProps {
  id: string;
  projectLevel: number;
  isStop: boolean;
}

export default function ProjectActions({
  id,
  projectLevel,
  isStop,
}: ProjectActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [stopReason, setStopReason] = useState("");
  const [showStopForm, setShowStopForm] = useState(false);
  const [error, setError] = useState("");

  const canAdvance = !isStop && projectLevel < 9;

  function handleAdvance() {
    startTransition(async () => {
      const res = await submitProject(id);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error ?? "خطا در پیشرفت پروژه");
      }
    });
  }

  function handleStop(e: React.FormEvent) {
    e.preventDefault();
    if (!stopReason.trim()) {
      setError("دلیل توقف اجباری است");
      return;
    }
    startTransition(async () => {
      const res = await stopProject(id, stopReason);
      if (res.ok) {
        setShowStopForm(false);
        setStopReason("");
        router.refresh();
      } else {
        setError(res.error ?? "خطا در توقف پروژه");
      }
    });
  }

  function handleDelete() {
    if (!confirm("آیا از حذف این پروژه اطمینان دارید؟ این عملیات قابل بازگشت نیست.")) return;
    startTransition(async () => {
      const res = await deleteProject(id);
      if (res.ok) {
        router.push("/admin/projects");
      } else {
        setError(res.error ?? "خطا در حذف پروژه");
      }
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      <Link
        href={`/admin/projects/${id}/edit`}
        className="block w-full text-center py-2.5 rounded-xl border border-[var(--border-primary)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
      >
        ویرایش اطلاعات
      </Link>

      {canAdvance && (
        <button
          onClick={handleAdvance}
          disabled={pending}
          className="w-full py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 disabled:opacity-60 transition-colors"
        >
          {pending ? "در حال پردازش…" : "پیشرفت به مرحله بعد"}
        </button>
      )}

      {!isStop && projectLevel < 9 && !showStopForm && (
        <button
          onClick={() => setShowStopForm(true)}
          className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
        >
          توقف پروژه
        </button>
      )}

      {showStopForm && (
        <form onSubmit={handleStop} className="space-y-2">
          <textarea
            value={stopReason}
            onChange={(e) => setStopReason(e.target.value)}
            placeholder="دلیل توقف پروژه را بنویسید…"
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 text-sm font-medium disabled:opacity-60 transition-colors"
            >
              تأیید توقف
            </button>
            <button
              type="button"
              onClick={() => { setShowStopForm(false); setStopReason(""); setError(""); }}
              className="px-4 py-2 rounded-xl border border-[var(--border-primary)] text-sm text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              انصراف
            </button>
          </div>
        </form>
      )}

      <button
        onClick={handleDelete}
        disabled={pending}
        className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400/70 hover:bg-red-500/5 hover:text-red-400 text-xs transition-colors"
      >
        حذف پروژه
      </button>
    </div>
  );
}
