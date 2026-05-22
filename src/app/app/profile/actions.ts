"use server";

import { createClient } from "@/lib/supabase-server";

export async function updateProfile(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return { ok: false, error: "کاربر احراز هویت نشده است" };

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const nationalCode = formData.get("nationalCode") as string;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        national_code: nationalCode || null,
        updated_at: new Date().toISOString(),
      });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function changePassword(
  currentPw: string,
  newPw: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return { ok: false, error: "کاربر احراز هویت نشده است" };

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPw,
    });
    if (signInError) return { ok: false, error: "رمز عبور فعلی اشتباه است" };

    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) return { ok: false, error: error.message };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
