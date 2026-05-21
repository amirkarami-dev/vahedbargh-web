import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in Client Components.
 *
 * `@supabase/ssr` handles document.cookie automatically for browser clients —
 * no manual cookie wiring needed.
 *
 * Use NEXT_PUBLIC_* variables only (they are inlined at build time and safe to
 * ship to the browser).
 */
export function createBrowserClient() {
  return _createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
