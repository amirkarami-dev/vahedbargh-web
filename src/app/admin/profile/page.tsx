import { createClient } from "@/lib/supabase-server";
import { ProfileForm, ChangePasswordForm } from "./ProfileForm";
import { User } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "پروفایل",
};

export default async function ProfilePage() {
  let user = null;
  let profile = null;

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone_number, national_code, avatar_url")
        .eq("id", user.id)
        .single();
      profile = data;
    }
  } catch {
    // Supabase not configured; use mock
  }

  const firstName = profile?.first_name ?? (user?.user_metadata?.first_name as string | undefined) ?? "کاربر";
  const lastName = profile?.last_name ?? (user?.user_metadata?.last_name as string | undefined) ?? "";
  const phone = profile?.phone_number ?? user?.phone ?? "";
  const email = user?.email ?? "user@example.com";
  const nationalCode = profile?.national_code ?? "";

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">پروفایل</h1>
        <p className="text-[var(--text-muted)] mt-1">مشاهده و ویرایش اطلاعات حساب کاربری</p>
      </div>

      {/* Avatar and identity */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-blue-600 flex items-center justify-center flex-shrink-0">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
          ) : (
            <User className="w-8 h-8 text-white" />
          )}
        </div>
        <div>
          <p className="text-lg font-bold text-[var(--text-primary)]">{firstName} {lastName}</p>
          <p className="text-sm text-[var(--text-muted)]">{email}</p>
          {phone && <p className="text-sm text-[var(--text-muted)] mt-0.5">{phone}</p>}
          {nationalCode && <p className="text-sm text-[var(--text-muted)] mt-0.5">کد ملی: {nationalCode}</p>}
        </div>
      </div>

      {/* Edit profile */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">ویرایش پروفایل</h2>
        <ProfileForm
          firstName={firstName}
          lastName={lastName}
          phone={phone}
        />
      </div>

      {/* Change password */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">تغییر رمز عبور</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
