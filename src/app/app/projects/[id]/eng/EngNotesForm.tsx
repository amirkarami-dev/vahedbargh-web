"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { saveProject } from "@/app/admin/projects/actions";

interface Props {
  projectId: string;
  initialNotes: string;
}

export default function EngNotesForm({ projectId, initialNotes }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(initialNotes);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleSave() {
    setStatus("idle");
    setErrorMsg("");

    const fd = new FormData();
    fd.set("id", projectId);
    fd.set("defectDes", notes);

    startTransition(async () => {
      const result = await saveProject(fd);
      if (result.ok) {
        setStatus("ok");
        router.refresh();
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setErrorMsg(result.error ?? "خطا در ذخیره‌سازی");
      }
    });
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--border-primary)]">
        یادداشت مهندس ناظر
      </h2>

      {status === "ok" && (
        <div className="mb-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          یادداشت با موفقیت ذخیره شد.
        </div>
      )}
      {status === "error" && (
        <div className="mb-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errorMsg}
        </div>
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="یادداشت‌ها، نقص‌ها یا توضیحات تکمیلی نظارت را اینجا وارد کنید…"
        className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)] transition-colors mb-4"
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 disabled:opacity-60 transition-colors"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {isPending ? "در حال ذخیره…" : "ذخیره یادداشت"}
      </button>
    </div>
  );
}
