import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "propvault_token";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/seed",
];

const ADMIN_ONLY_PATHS = [
  "/agents",
  "/api/agents",
  "/analytics",
  "/api/analytics",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|svg|ico|webp)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return pathname.startsWith("/api/")
      ? NextResponse.json({ success: false, error: "Unauthorized — please log in" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const user = payload as { id: string; role: string; name: string };

    if (ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p)) && user.role !== "admin") {
      return pathname.startsWith("/api/")
        ? NextResponse.json({ success: false, error: "Forbidden — admin only" }, { status: 403 })
        : NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const headers = new Headers(request.headers);
    headers.set("x-user-id",   user.id);
    headers.set("x-user-role", user.role);
    headers.set("x-user-name", user.name);

    return NextResponse.next({ request: { headers } });
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
