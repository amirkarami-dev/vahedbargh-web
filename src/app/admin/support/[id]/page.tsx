"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Send, Lock } from "lucide-react";
import { getSupportById, addMessage, closeSupport } from "../actions";

interface Support {
  id: string;
  ticketNumber?: string;
  title: string;
  fileNumber?: string;
  closed: boolean;
  isRead: boolean;
  solarCreated?: string;
  createdAt: string;
  field1?: string;
}

interface SupportMessage {
  id: string;
  supportId: string;
  userId: string;
  message: string;
  createdAt: string;
  userName?: string;
}

export default function SupportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<{
    support: Support;
    messages: SupportMessage[];
    files: { id: string; name?: string; storagePath: string; createdAt: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [pending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function load() {
    const result = await getSupportById(id);
    setData(result as typeof data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    const msg = replyText;
    setReplyText("");
    startTransition(async () => {
      await addMessage(id, msg);
      load();
    });
  }

  function handleClose() {
    if (!confirm("آیا از بستن این تیکت اطمینان دارید؟")) return;
    startTransition(async () => {
      await closeSupport(id);
      router.push("/admin/support");
    });
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-[var(--bg-secondary)] rounded animate-pulse mb-6" />
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-[var(--bg-secondary)] rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--text-muted)]">تیکت مورد نظر یافت نشد.</p>
        <Link href="/admin/support" className="text-[var(--accent-primary)] text-sm hover:underline mt-2 inline-block">
          بازگشت به لیست
        </Link>
      </div>
    );
  }

  const { support, messages } = data;

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <Link
        href="/admin/support"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به لیست تیکت‌ها
      </Link>

      {/* Header card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {support.ticketNumber && (
                <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-1 rounded-lg">
                  #{support.ticketNumber}
                </span>
              )}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  support.closed
                    ? "bg-gray-500/15 text-gray-400"
                    : "bg-green-500/15 text-green-400"
                }`}
              >
                {support.closed ? "بسته" : "باز"}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{support.title}</h1>
            {support.fileNumber && (
              <p className="text-sm text-[var(--text-muted)] mt-1">
                شماره پرونده: {support.fileNumber}
              </p>
            )}
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {support.solarCreated ?? new Date(support.createdAt).toLocaleDateString("fa-IR")}
            </p>
          </div>
          {!support.closed && (
            <button
              onClick={handleClose}
              disabled={pending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors flex-shrink-0 disabled:opacity-60"
            >
              <Lock className="w-4 h-4" />
              بستن تیکت
            </button>
          )}
        </div>

        {support.field1 && (
          <div className="mt-4 pt-4 border-t border-[var(--border-primary)]">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{support.field1}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="space-y-4 mb-6">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--text-muted)]">
            هنوز پیامی ارسال نشده است
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isAdmin = msg.userName === "مدیر" || msg.userId === "admin";
            return (
              <div
                key={msg.id}
                className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                    isAdmin
                      ? "bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20"
                      : "bg-[var(--bg-card)] border border-[var(--border-primary)]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      {msg.userName ?? (isAdmin ? "مدیر" : "کاربر")}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">·</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(msg.createdAt).toLocaleTimeString("fa-IR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">{msg.message}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply form */}
      {!support.closed && (
        <form
          onSubmit={handleReply}
          className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-4 flex gap-3 items-end"
        >
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="پیام خود را بنویسید…"
            rows={3}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          />
          <button
            type="submit"
            disabled={pending || !replyText.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 disabled:opacity-60 transition-colors"
          >
            <Send className="w-4 h-4" />
            ارسال
          </button>
        </form>
      )}
    </div>
  );
}
