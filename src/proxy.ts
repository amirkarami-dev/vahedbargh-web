import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Decode the `roles` claim from a JWT without verifying the signature.
 *  Verification is handled by Supabase — we trust the token because getUser()
 *  has already validated it server-side. */
function decodeJwtRoles(token: string | undefined): string[] {
  if (!token) return [];
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return [];
    const padding = "=".repeat((4 - (payloadB64.length % 4)) % 4);
    const json = atob(
      payloadB64.replace(/-/g, "+").replace(/_/g, "/") + padding
    );
    const payload = JSON.parse(json) as { roles?: unknown };
    if (!Array.isArray(payload.roles)) return [];
    return payload.roles.filter((r): r is string => typeof r === "string");
  } catch {
    return [];
  }
}

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build a mutable response so @supabase/ssr can set refreshed session cookies
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Write cookies onto both the outgoing request and the response so that
        // the new tokens are visible to downstream server components in the same
        // render cycle AND sent back to the browser.
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: do not run any logic between createServerClient and getUser()
  // as per @supabase/ssr docs — getUser() triggers session refresh if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── /admin/* routes ────────────────────────────────────────────────────────
  // Login page and its sub-pages (e.g. /admin/login/otp) are public.
  const isAdminLoginPage =
    pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  if (pathname.startsWith("/admin")) {
    // 1. Not authenticated → send to login
    if (!user && !isAdminLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user) {
      // 2. Authenticated — check AdminPanel role from JWT
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const roles = decodeJwtRoles(session?.access_token);
      const hasAdminPanel =
        roles.includes("AdminPanel") || roles.includes("Administrator");

      // 3. Has role + is on login page → bounce to dashboard
      if (isAdminLoginPage && hasAdminPanel) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // 4. Has role → proceed normally
      if (!isAdminLoginPage && hasAdminPanel) {
        return supabaseResponse;
      }

      // 5. No AdminPanel role + not on login page → forbidden
      if (!isAdminLoginPage && !hasAdminPanel) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("error", "forbidden");
        return NextResponse.redirect(loginUrl);
      }
    }

    return supabaseResponse;
  }

  // ── /app/* routes ──────────────────────────────────────────────────────────
  const isAppLoginPage = pathname === "/login";

  if (pathname.startsWith("/app")) {
    if (!user && !isAppLoginPage) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user && isAppLoginPage) {
      return NextResponse.redirect(new URL("/app", request.url));
    }

    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/app/:path*"],
};
