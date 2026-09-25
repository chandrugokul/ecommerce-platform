import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              request.cookies.set(name, value);
            }
          );

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              supabaseResponse.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  const pathname = request.nextUrl.pathname;

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  const isLoginPage =
    pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !claims) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && claims) {
    return NextResponse.redirect(
      new URL("/admin", request.url)
    );
  }

  return supabaseResponse;
}