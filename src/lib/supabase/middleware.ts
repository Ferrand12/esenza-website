import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: refresh session on every request
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /admin routes (except /admin/login)
  const url = request.nextUrl;
  if (
    url.pathname.startsWith("/admin") &&
    !url.pathname.startsWith("/admin/login") &&
    !user
  ) {
    const loginUrl = url.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and visiting /admin/login, redirect to dashboard
  if (url.pathname === "/admin/login" && user) {
    const dashUrl = url.clone();
    dashUrl.pathname = "/admin";
    return NextResponse.redirect(dashUrl);
  }

  return supabaseResponse;
}
