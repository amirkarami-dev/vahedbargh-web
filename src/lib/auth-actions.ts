"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

/**
 * Next.js 16 + React 19 useActionState encodes form fields with a _N_ prefix.
 * This helper reads a field with or without the prefix.
 */
function getField(formData: FormData, name: string): string {
  const direct = formData.get(name);
  if (direct != null) return direct as string;
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && key.replace(/^_\d+_/, "") === name)
      return value;
  }
  return "";
}

/** Normalize Iranian mobile to local 11-digit: 09XXXXXXXXX */
function toLocal(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("98") && d.length === 12) return "0" + d.slice(2);
  if (d.startsWith("9") && d.length === 10) return "0" + d;
  return d;
}

// ── SMS relay service ─────────────────────────────────────────────────────────
// The home server's dynamic IP can't be whitelisted on msgway (it returns 403),
// so OTP delivery is relayed through sms-service running on the ArvanCloud VPS
// (185.206.94.116) whose static IP IS whitelisted. That service forwards to
// msgway (template 14015) + Bale. See repo: sms-service.

const SMS_SERVICE_URL =
  process.env.SMS_SERVICE_URL ?? "https://sms.kurdnezambargh.ir";
const SMS_SERVICE_TOKEN = process.env.SMS_SERVICE_TOKEN ?? "";

/**
 * Deliver an OTP code to the user by calling the SMS relay service.
 * In development the code is also printed to the server console for convenience.
 */
async function deliverOtp(phone: string, code: string): Promise<void> {
  // Always log in dev so the code is visible in the terminal too
  if (process.env.NODE_ENV !== "production") {
    console.log("\n┌─────────────────────────────┐");
    console.log(`│  OTP for ${phone}  │`);
    console.log(`│  Code : ${code}               │`);
    console.log("└─────────────────────────────┘\n");
  }

  if (!SMS_SERVICE_TOKEN) {
    console.error("[sms] SMS_SERVICE_TOKEN is not configured — cannot deliver OTP");
    return;
  }

  try {
    const resp = await fetch(`${SMS_SERVICE_URL}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SMS_SERVICE_TOKEN}`,
      },
      body: JSON.stringify({ phone, code }),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      console.error("[sms] relay returned", resp.status, text.slice(0, 300));
    }
  } catch (err) {
    console.error("[sms] relay error", err);
  }
}

// ─── userName + password login ──────────────────────────────────────────────

export async function loginWithUsernameAction(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const userName = getField(formData, "userName");
  const password = getField(formData, "password");
  const redirectTo = getField(formData, "redirect") || "/app";

  if (!userName || !password)
    return { error: "لطفاً نام کاربری و رمز عبور را وارد کنید." };

  const supabase = await createClient();

  // ── Email login (input contains @) ─────────────────────────────────────────
  if (userName.includes("@")) {
    const { error } = await supabase.auth.signInWithPassword({
      email: userName,
      password,
    });
    if (error) return { error: "نام کاربری یا رمز عبور اشتباه است." };
    redirect(redirectTo);
  }

  // ── nick_name login (ASP.NET Identity UserName) ─────────────────────────────
  const admin = await createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("nick_name", userName)
    .maybeSingle();

  if (!profile) return { error: "نام کاربری یا رمز عبور اشتباه است." };

  const {
    data: { user: authUser },
    error: getUserErr,
  } = await admin.auth.admin.getUserById(profile.id);

  if (getUserErr || !authUser?.email)
    return { error: "نام کاربری یا رمز عبور اشتباه است." };

  const { error } = await supabase.auth.signInWithPassword({
    email: authUser.email,
    password,
  });

  if (error) return { error: "نام کاربری یا رمز عبور اشتباه است." };

  redirect(redirectTo);
}

// ─── Step 1 — send OTP to mobile (custom flow, no Supabase phone auth) ──────

export async function sendOtpAction(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const phone = getField(formData, "phone").trim();
  const redirectTo = getField(formData, "redirect") || "/app";
  const loginBase = getField(formData, "loginBase") || "/login";

  if (!phone) return { error: "لطفاً شماره موبایل را وارد کنید." };

  const local = toLocal(phone);
  if (!local.startsWith("09") || local.length !== 11)
    return { error: "شماره موبایل وارد شده معتبر نیست." };

  const admin = await createAdminClient();

  // Look up user by phone_number in profiles
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("phone_number", local)
    .maybeSingle();

  if (!profile)
    return { error: "این شماره موبایل در سامانه ثبت نشده است." };

  // Generate 6-digit OTP
  const code = String(Math.floor(100000 + Math.random() * 900000));

  // Clear old OTPs for this phone, then insert fresh one
  await admin.from("phone_otp_tokens").delete().eq("phone", local);
  const { error: insertErr } = await admin.from("phone_otp_tokens").insert({
    user_id: profile.id,
    phone: local,
    code,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });

  if (insertErr) {
    console.error("[sendOtp] DB insert error:", insertErr);
    return { error: "خطا در سیستم. لطفاً دوباره تلاش کنید." };
  }

  // Deliver OTP (SMS or console log)
  await deliverOtp(local, code);

  redirect(
    `${loginBase}/otp?phone=${encodeURIComponent(local)}&redirect=${encodeURIComponent(redirectTo)}`
  );
}

// ─── Step 2 — verify OTP and create session ─────────────────────────────────

export async function verifyOtpAction(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const phone = getField(formData, "phone");
  const token = getField(formData, "token").replace(/\D/g, "");
  const redirectTo = getField(formData, "redirect") || "/app";

  if (!phone || token.length !== 6)
    return { error: "لطفاً کد ۶ رقمی را کامل وارد کنید." };

  const local = toLocal(phone);
  const admin = await createAdminClient();

  // Verify the stored OTP
  const { data: record } = await admin
    .from("phone_otp_tokens")
    .select("user_id, expires_at")
    .eq("phone", local)
    .eq("code", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!record)
    return { error: "کد وارد شده اشتباه یا منقضی شده است." };

  // Consume the OTP (one-time use)
  await admin.from("phone_otp_tokens").delete().eq("phone", local);

  // Retrieve the user's email
  const {
    data: { user },
    error: userErr,
  } = await admin.auth.admin.getUserById(record.user_id);

  if (userErr || !user?.email)
    return { error: "خطا در احراز هویت." };

  // Generate a one-time magic-link token via the admin API,
  // then verify it server-side — this sets the session cookies via @supabase/ssr
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: user.email,
  });

  if (linkErr || !linkData?.properties?.email_otp) {
    console.error("[verifyOtp] generateLink error:", linkErr);
    return { error: "خطا در ورود. لطفاً دوباره تلاش کنید." };
  }

  const supabase = await createClient();
  const { error: verifyErr } = await supabase.auth.verifyOtp({
    email: user.email,
    token: linkData.properties.email_otp,
    type: "magiclink",
  });

  if (verifyErr) {
    console.error("[verifyOtp] verifyOtp error:", verifyErr);
    return { error: "خطا در ورود. لطفاً دوباره تلاش کنید." };
  }

  redirect(redirectTo);
}
