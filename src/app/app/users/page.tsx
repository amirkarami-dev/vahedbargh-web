"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Users,
  Plus,
  Shield,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { getAppUsers, updateUserRole, inviteUser, deactivateAppUser } from "./actions";
import type { AppUserRecord } from "./actions";

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLES = [
  { value: "Administrator", label: "مدیر کل", cls: "text-purple-400 bg-purple-400/10" },
  { value: "Engineer", label: "مهندس ناظر", cls: "text-blue-400 bg-blue-400/10" },
  { value: "Employee", label: "کارمند", cls: "text-green-400 bg-green-400/10" },
  { value: "Accountant", label: "حسابدار", cls: "text-yellow-400 bg-yellow-400/10" },
  { value: "PanelMaker", label: "تابلوساز", cls: "text-orange-400 bg-orange-400/10" },
  { value: "ElectAdmin", label: "کارشناس برق", cls: "text-cyan-400 bg-cyan-400/10" },
  { value: "Section", label: "ناظر بخش", cls: "text-pink-400 bg-pink-400/10" },
];

function roleCls(role: string): string {
  return (
    ROLES.find((r) => r.value === role)?.cls ?? "text-gray-400 bg-gray-400/10"
  );
}

function roleLabel(role: string): string {
  return ROLES.find((r) => r.value === role)?.label ?? role;
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({
  onClose,
  onInvited,
}: {
  onClose: () => void;
  onInvited: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Employee");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await inviteUser(email, role);
      if (res.ok) {
        onInvited();
        onClose();
      } else {
        setError(res.error ?? "خطا در ارسال دعوت‌نامه");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 w-full max-w-md mx-4"
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            دعوت کاربر جدید
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              ایمیل <span className="text-red-400 mr-1">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
              dir="ltr"
              className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 text-left"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              نقش
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 disabled:opacity-60 transition-colors"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isPending ? "در حال ارسال…" : "ارسال دعوت‌نامه"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AppUsersPage() {
  const [users, setUsers] = useState<AppUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{
    type: "ok" | "error";
    msg: string;
  } | null>(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getAppUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  function notify(type: "ok" | "error", msg: string) {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  }

  function handleRoleChange(userId: string, newRole: string) {
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole);
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        notify("ok", "نقش کاربر تغییر کرد.");
      } else {
        notify("error", res.error ?? "خطا در تغییر نقش");
      }
    });
  }

  function handleDeactivate(userId: string) {
    startTransition(async () => {
      const res = await deactivateAppUser(userId);
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: false } : u))
        );
        notify("ok", "کاربر غیر فعال شد.");
      } else {
        notify("error", res.error ?? "خطا در غیرفعال‌سازی");
      }
    });
  }

  return (
    <div className="p-6 sm:p-8" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              مدیریت کاربران
            </h1>
          </div>
          <p className="text-sm text-[var(--text-muted)] mr-13">
            مدیریت نقش‌ها و دسترسی کاربران سامانه
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          دعوت کاربر
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl border text-sm flex items-center gap-2 ${
            notification.type === "ok"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {notification.type === "ok" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {notification.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "کل کاربران", value: users.length },
          { label: "فعال", value: users.filter((u) => u.isActive).length },
          { label: "مهندسان", value: users.filter((u) => u.role === "Engineer").length },
          { label: "مدیران", value: users.filter((u) => u.role === "Administrator").length },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-4 text-center"
          >
            <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
              {s.value.toLocaleString("fa-IR")}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[var(--accent-primary)] animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Users className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-40" />
            <p className="text-sm text-[var(--text-muted)]">
              هیچ کاربری یافت نشد
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  {["نام", "ایمیل", "نقش", "وضعیت", "تاریخ عضویت", "عملیات"].map(
                    (h) => (
                      <th
                        key={h}
                        className="py-4 px-5 text-right text-xs font-semibold text-[var(--text-muted)]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    {/* Name */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center text-sm font-bold text-[var(--accent-primary)] flex-shrink-0">
                          {(user.firstName || user.email).charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {user.firstName || user.lastName
                              ? `${user.firstName} ${user.lastName}`.trim()
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-5 text-[var(--text-muted)] text-xs" dir="ltr">
                      {user.email}
                    </td>

                    {/* Role — inline select */}
                    <td className="py-3.5 px-5">
                      <div className="relative inline-block">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          disabled={isPending}
                          className={`appearance-none text-xs font-medium pl-6 pr-2 py-1.5 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 cursor-pointer ${roleCls(user.role)}`}
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {user.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="py-3.5 px-5 text-[var(--text-muted)] text-xs">
                      {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5">
                      {user.isActive && (
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          disabled={isPending}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        >
                          غیرفعال
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvited={loadUsers}
        />
      )}
    </div>
  );
}
