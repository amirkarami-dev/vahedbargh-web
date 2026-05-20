import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * SUPABASE_URL (no NEXT_PUBLIC_ prefix) is a server-only env var pointing to
 * the internal / local-network address of Supabase, e.g.:
 *   SUPABASE_URL=http://192.168.100.26:8586
 *
 * This lets the Next.js server reach Supabase over plain HTTP on the LAN while
 * the public site is served over HTTPS — avoiding mixed-content browser blocks.
 * Falls back to NEXT_PUBLIC_SUPABASE_URL if the private var is not set.
 */
const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function cookieHandlers(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      } catch {}
    },
  };
}

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: cookieHandlers(cookieStore),
  });
}

export async function createAdminClient() {
  const cookieStore = await cookies();
  return createServerClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: cookieHandlers(cookieStore) }
  );
}
