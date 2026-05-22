import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";
import type { Metadata } from "next";
import { UserCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پروفایل | سامانه کاربری",
};

export default async function AppProfilePage() {
  let user = null;
  let profile: {
    first_name?: string | null;
    last_name?: string | null;
    phone_number?: string | null;
    national_code?: string | null;
    avatar_url?: string | null;
  } | null = null;
  let role: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      redirect("/app/login");
    }
    user = authUser;

    const [profileRes, roleRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("first_name, last_name, phone_number, national_code, avatar_url")
        .eq("id", authUser.id)
        .single(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id)
        .single(),
    ]);

    profile = profileRes.data ?? null;
    role = roleRes.data?.role ?? null;
  } catch {
    if (!user) redirect("/app/login");
  }

  const firstName =
    (profile?.first_name as string | null | undefined) ??
    (user?.user_metadata?.first_name as string | undefined) ??
    "کاربر";
  const lastName =
    (profile?.last_name as string | null | undefined) ??
    (user?.user_metadata?.last_name as string | undefined) ??
    "";
  const phone =
    (profile?.phone_number as string | null | undefined) ??
    user?.phone ??
    "";
  const email = user?.email ?? "";
  const nationalCode = (profile?.national_code as string | null | undefined) ?? "";
  const avatarUrl = (profile?.avatar_url as string | null | undefined) ?? null;

  const ROLE_LABELS: Record<string, string> = {
    Administrator: "مدیر کل",
    Engineer: "مهندس ناظر",
    Employee: "کارمند",
    Accountant: "حسابدار",
    PanelMaker: "تابلوساز",
    ElectAdmin: "کارشناس برق",
    Section: "ناظر بخش",
    SuperUser: "ابرکاربر",
    Executor: "مجری",
    Analyzer: "تحلیلگر",
  };

  const ROLE_COLORS: Record<string, string> = {
    Administrator: "bg-red-500/15 text-red-400 border-red-500/30",
    Engineer: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    Employee: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    Accountant: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    PanelMaker: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    ElectAdmin: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    Section: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    SuperUser: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  };

  const roleLabel = role ? (ROLE_LABELS[role] ?? role) : null;
  const roleColor = role ? (ROLE_COLORS[role] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30") : null;

  return (
    <div className="p-6 max-w-3xl">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">پروفایل</h1>
        <p className="text-[var(--text-muted)] mt-1">مشاهده و ویرایش اطلاعات حساب کاربری</p>
      </div>

      {/* Identity card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="تصویر پروفایل"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle className="w-9 h-9 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-lg font-bold text-[var(--text-primary)]">
              {firstName} {lastName}
            </p>
            {roleLabel && roleColor && (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${roleColor}`}
              >
                {roleLabel}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-0.5 dir-ltr">{email}</p>
          {phone && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5 tabular-nums">{phone}</p>
          )}
          {nationalCode && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              کد ملی: <span className="tabular-nums dir-ltr">{nationalCode}</span>
            </p>
          )}
        </div>
      </div>

      {/* Edit profile form */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">ویرایش اطلاعات</h2>
        <ProfileForm
          firstName={firstName}
          lastName={lastName}
          phone={phone}
          email={email}
          nationalCode={nationalCode}
        />
      </div>

      {/* Change password */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">تغییر رمز عبور</h2>
        <p className="text-xs text-[var(--text-muted)] mb-5">
          برای تغییر رمز عبور، رمز فعلی خود را وارد کنید
        </p>
        <ProfileForm
          mode="password"
          firstName=""
          lastName=""
          phone=""
          email={email}
          nationalCode=""
        />
      </div>
    </div>
  );
}
