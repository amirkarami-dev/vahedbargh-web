"use server";

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function loginAction(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const redirectTo = (formData.get("redirect") as string) || "/admin";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "ایمیل یا رمز عبور اشتباه است." };
  }

  redirect(redirectTo);
}
