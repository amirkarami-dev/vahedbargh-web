"use client";

import { useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { addHistory } from "../actions";

interface AddHistoryFormProps {
  engineerId: string;
}

export default function AddHistoryForm({ engineerId }: AddHistoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const description = textareaRef.current?.value.trim() ?? "";
    if (!description) {
      window.alert("متن یادداشت نمی‌تواند خالی باشد");
      return;
    }
    startTransition(async () => {
      const result = await addHistory(engineerId, description);
      if (result.ok) {
        if (textareaRef.current) textareaRef.current.value = "";
        router.refresh();
      } else {
        window.alert("خطا در ثبت یادداشت");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          افزودن یادداشت
        </label>
        <textarea
          ref={textareaRef}
          rows={2}
          placeholder="متن یادداشت را وارد کنید..."
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        ثبت
      </button>
    </form>
  );
}
