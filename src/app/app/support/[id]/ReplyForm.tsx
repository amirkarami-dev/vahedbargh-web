"use client";

import { useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { replyToTicket } from "../actions";

interface ReplyFormProps {
  ticketId: string;
}

export default function ReplyForm({ ticketId }: ReplyFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const msg = (fd.get("message") as string | null)?.trim() ?? "";
    if (!msg) {
      setError("متن پیام نمی‌تواند خالی باشد");
      return;
    }
    startTransition(async () => {
      const res = await replyToTicket(fd);
      if (res.ok) {
        formRef.current?.reset();
      } else {
        setError(res.error ?? "خطا در ارسال پیام");
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-4 flex flex-col gap-3"
    >
      <input type="hidden" name="ticketId" value={ticketId} />

      <textarea
        name="message"
        placeholder="پیام خود را بنویسید…"
        rows={3}
        className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
        required
        disabled={pending}
      />

      {error && (
        <p className="text-xs text-red-400 px-1">{error}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 disabled:opacity-60 transition-colors"
        >
          <Send className="w-4 h-4" />
          {pending ? "در حال ارسال…" : "ارسال پیام"}
        </button>
      </div>
    </form>
  );
}
