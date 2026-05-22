"use client";

import { useState, useTransition } from "react";
import type { UserRecord } from "./actions";
import { inviteUser, updateUserRole, deactivateUser } from "./actions";

const ROLE_LABELS: Record<string, string> = {
  Administrator: "مدیر سیستم",
  SuperUser: "ابرکاربر",
  Executor: "مجری",
  Engineer: "مهندس",
  Accountant: "حسابدار",
  Employee: "کارمند",
  PanelMaker: "تابلوساز",
  ElectAdmin: "مدیر برق",
  Section: "بخش",
  Analyzer: "تحلیلگر",
};

const ROLE_COLORS: Record<string, string> = {
  Administrator: "bg-red-500/15 text-red-400 border-red-500/30",
  SuperUser: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Executor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Engineer: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Accountant: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Employee: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  PanelMaker: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ElectAdmin: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  Section: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  Analyzer: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
};

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("fa-IR");
  } catch {
    return dateStr;
  }
}

interface InviteModalProps {
  onClose: () => void;
}

function InviteModal({ onClose }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Employee");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await inviteUser(email, role);
      setResult(res);
      if (res.ok) {
        setTimeout(onClose, 1500);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-5">دعوت کاربر جدید</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">آدرس ایمیل</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">نقش</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          {result && (
            <p className={`text-sm ${result.ok ? "text-emerald-400" : "text-red-400"}`}>
              {result.ok ? "دعوتنامه ارسال شد" : (result.error ?? "خطایی رخ داد")}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium disabled:opacity-50"
            >
              {isPending ? "در حال ارسال..." : "ارسال دعوتنامه"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--bg-secondary)]/80"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UserManagementClient({ initialUsers }: { initialUsers: UserRecord[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [showInvite, setShowInvite] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDeactivate(userId: string) {
    startTransition(async () => {
      const res = await deactivateUser(userId);
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: false } : u))
        );
      }
    });
  }

  function handleRoleChange(userId: string, newRole: string) {
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole);
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    });
  }

  return (
    <>
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-primary)]">
          <p className="text-sm text-[var(--text-muted)]">{users.length} کاربر</p>
          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            دعوت کاربر
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <th className="text-right px-6 py-3 text-[var(--text-muted)] font-medium">نام</th>
                <th className="text-right px-6 py-3 text-[var(--text-muted)] font-medium">ایمیل</th>
                <th className="text-right px-6 py-3 text-[var(--text-muted)] font-medium">نقش</th>
                <th className="text-right px-6 py-3 text-[var(--text-muted)] font-medium">وضعیت</th>
                <th className="text-right px-6 py-3 text-[var(--text-muted)] font-medium">تاریخ عضویت</th>
                <th className="text-right px-6 py-3 text-[var(--text-muted)] font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="px-6 py-4 text-[var(--text-primary)] font-medium">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] font-mono text-xs">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={isPending}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer bg-transparent ${ROLE_COLORS[user.role] ?? ROLE_COLORS.Employee}`}
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${user.isActive ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}>
                      {user.isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-muted)] text-xs">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive && (
                      <button
                        onClick={() => handleDeactivate(user.id)}
                        disabled={isPending}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                      >
                        غیرفعال‌سازی
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]">
                    کاربری یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
