"use server";

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

/**
 * Next.js 16 + React 19 useActionState encodes form fields with a _N_ prefix
 * (e.g. "email" → "_1_email"). This helper reads a field with or without the
 * prefix so the action works regardless of the internal encoding.
 */
function getField(formData: FormData, name: string): string {
  const direct = formData.get(name);
  if (direct != null) return direct as string;
  // Strip _N_ prefix used by Next.js Server Action / useActionState encoding
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && key.replace(/^_\d+_/, "") === name) {
      return value;
    }
  }
  return "";
}

export async function loginAction(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const email = getField(formData, "email");
  const password = getField(formData, "password");
  const redirectTo = getField(formData, "redirect") || "/admin";

  if (!email || !password) {
    return { error: "لطفاً ایمیل و رمز عبور را وارد کنید." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "ایمیل یا رمز عبور اشتباه است." };
  }

  redirect(redirectTo);
}
