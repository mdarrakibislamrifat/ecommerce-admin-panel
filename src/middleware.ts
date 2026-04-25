import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 1. Session refresh kora ta PKCE flow-te khub guruttopurno
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
  ];

  const { pathname } = req.nextUrl;
  const isAuthRoute = authRoutes.includes(pathname);
  const isLoggedIn = !!session;

  // 2. Jodi user login thake ebong login page-e jete chay, dashboard-e pathan
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 3. Jodi user login NA thake ebong auth route-e-o NA thake, login page-e pathan
  // Kintu auth/callback route-ke jeno disturb na kore (config matcher-e eta kora ache)
  if (!isLoggedIn && !isAuthRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect_to", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Session refresh hobar por modified 'res' return kora dorkar
  return res;
}

export const config = {
  // matcher-e 'auth' thakay /auth/callback bypass hobe, jeta thik ache
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth|.*\\..*).*)"],
};