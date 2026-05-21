# Auth Module Spec
## Authentication & Authorization Migration

---

## Current State (Old System)

- JWT HS512, 120-min expiry, refresh tokens in ASP.NET Identity token store
- Tokens stored in `localStorage.getItem("authUser")`
- MFA: SMS OTP via gsotp.com (called **directly from frontend**)
- Roles: 10 roles injected as JWT claims
- Multi-tenant: `cid` (ClientId) claim in token

## Target State (New System)

- Supabase Auth (JWT RS256, managed by Supabase)
- Tokens in `httpOnly` cookies (server-side via `@supabase/ssr`)
- MFA: SMS OTP via msgway.com, called server-side
- Roles: stored in `user_roles` table, injected as custom JWT claim
- Multi-tenant: `client_id` custom claim in Supabase JWT

---

## Database Schema

```sql
-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id             uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  client_id      uuid REFERENCES clients(id),
  first_name     text,
  last_name      text,
  national_code  text,
  phone_number   text,
  avatar_url     text,
  theme_color    text DEFAULT '217 91% 60%',
  is_active      boolean DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz
);

CREATE TABLE user_roles (
  user_id    uuid REFERENCES auth.users ON DELETE CASCADE,
  role       text NOT NULL,
  client_id  uuid REFERENCES clients(id),
  PRIMARY KEY (user_id, role, client_id)
);

-- Auto-create profile on auth.users INSERT
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name, phone_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Custom JWT Claims Hook

Inject `client_id` and `roles` into the Supabase JWT:

```sql
-- In Supabase dashboard: Authentication > Hooks > Custom Access Token Hook
-- Or via SQL:

CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_client_id uuid;
  user_roles text[];
BEGIN
  claims := event -> 'claims';

  -- Get client_id from profiles
  SELECT client_id INTO user_client_id
  FROM profiles
  WHERE id = (event ->> 'user_id')::uuid;

  -- Get roles
  SELECT array_agg(role) INTO user_roles
  FROM user_roles
  WHERE user_id = (event ->> 'user_id')::uuid;

  -- Inject custom claims
  claims := jsonb_set(claims, '{cid}', to_jsonb(user_client_id));
  claims := jsonb_set(claims, '{roles}', to_jsonb(user_roles));

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

---

## RLS Policies (Auth Tables)

```sql
-- Profiles: users can read/update their own; service role can read all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles in client"
  ON profiles FOR SELECT
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role IN ('Administrator', 'SuperUser')
    )
  );
```

---

## Login Flow

### Email + Password (Admin Login)

```typescript
// app/admin/login/actions.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: { error: string }, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect") as string ?? "/admin";

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "ایمیل یا رمز عبور اشتباه است" };

  redirect(redirectTo);
}
```

### SMS OTP (2FA)

```typescript
// app/admin/login/otp-action.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function sendOtpAction(phone: string) {
  // Call msgway.com to send OTP
  await fetch("https://api.msgway.com/sms/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": process.env.MSGWAY_API_KEY! },
    body: JSON.stringify({ phone }),
  });
  return { ok: true };
}

export async function verifyOtpAction(phone: string, code: string) {
  // Verify with msgway
  const res = await fetch("https://api.msgway.com/sms/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": process.env.MSGWAY_API_KEY! },
    body: JSON.stringify({ phone, code }),
  });
  const data = await res.json();
  if (!data.ok) return { error: "کد تایید اشتباه است" };

  // Sign in with Supabase phone auth
  const cookieStore = await cookies();
  const supabase = createServerClient(/* ... */);
  const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
  if (error) return { error: error.message };
  return { ok: true };
}
```

---

## Route Guard (Middleware)

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !user) {
    return NextResponse.redirect(new URL(`/admin/login?redirect=${request.nextUrl.pathname}`, request.url));
  }

  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

---

## Role-Based Access (Server Components)

```typescript
// lib/auth.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Role =
  | "Administrator" | "SuperUser" | "Executor" | "Engineer"
  | "Accountant" | "Employee" | "PanelMaker" | "ElectAdmin"
  | "Section" | "Analyzer";

export async function requireRole(...roles: Role[]) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const jwt = await supabase.auth.getSession();
  const userRoles: string[] = jwt.data.session?.access_token
    ? (JSON.parse(atob(jwt.data.session.access_token.split(".")[1])).roles ?? [])
    : [];

  const hasRole = roles.some((r) => userRoles.includes(r));
  if (!hasRole) redirect("/admin"); // or 403 page

  return user;
}

// Usage in Server Component:
// const user = await requireRole("Administrator", "Section");
```

---

## User Migration Plan

### Step 1: Export users from SQL Server

```sql
SELECT
  LOWER(Id)        AS id,
  Email            AS email,
  PhoneNumber      AS phone_number,
  FirstName        AS first_name,
  LastName         AS last_name,
  NaCode           AS national_code,
  CAST(Active AS bit) AS is_active,
  LOWER(ClientId)  AS client_id
FROM AspNetUsers
WHERE Active = 1;
```

### Step 2: Create users in Supabase Auth

```typescript
// scripts/migrate-users.ts
const { data, error } = await supabase.auth.admin.createUser({
  email: row.email,
  phone: row.phone_number,
  user_metadata: {
    first_name: row.first_name,
    last_name: row.last_name,
  },
  email_confirm: true,
});
```

### Step 3: Insert profiles

```typescript
await supabase.from("profiles").insert({
  id: data.user.id,
  client_id: row.client_id,
  first_name: row.first_name,
  last_name: row.last_name,
  national_code: row.national_code,
  phone_number: row.phone_number,
  is_active: row.is_active,
});
```

### Step 4: Assign roles

```typescript
for (const role of user.roles) {
  await supabase.from("user_roles").insert({
    user_id: data.user.id,
    role: role,
    client_id: row.client_id,
  });
}
```

### Step 5: Force password reset

```typescript
await supabase.auth.admin.generateLink({
  type: "recovery",
  email: row.email,
});
// Send link via SMS to user's phone
```
