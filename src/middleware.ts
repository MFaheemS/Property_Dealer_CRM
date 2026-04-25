import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME_TOKEN } from "@/lib/auth";

// Paths that never require authentication
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/seed",
];

// Paths that require admin role
const ADMIN_ONLY_PATHS = [
  "/agents",
  "/api/agents",
  "/analytics",
  "/api/analytics",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Skip static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|svg|ico|webp)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME_TOKEN)?.value;

  if (!token) {
    return pathname.startsWith("/api/")
      ? NextResponse.json({ success: false, error: "Unauthorized — please log in" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
  }

  const user = verifyToken(token);

  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete(COOKIE_NAME_TOKEN);
    return res;
  }

  // Admin-only route guard
  if (ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p)) && user.role !== "admin") {
    return pathname.startsWith("/api/")
      ? NextResponse.json({ success: false, error: "Forbidden — admin only" }, { status: 403 })
      : NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Inject user identity into request headers for API routes
  const headers = new Headers(request.headers);
  headers.set("x-user-id",   user.id);
  headers.set("x-user-role", user.role);
  headers.set("x-user-name", user.name);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
