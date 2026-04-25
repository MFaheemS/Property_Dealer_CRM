import { NextRequest, NextResponse } from "next/server";
import { AuthUser, UserRole } from "@/types";
import { checkRateLimit, RATE_LIMITS } from "./rateLimit";

/** Extract the authenticated user injected by middleware */
export function getRequestUser(req: NextRequest): AuthUser {
  return {
    id:    req.headers.get("x-user-id")!,
    name:  req.headers.get("x-user-name")!,
    email: "",
    role:  req.headers.get("x-user-role") as UserRole,
  };
}

/** Apply role-based rate limiting. Returns error response or null. */
export function applyRateLimit(
  req: NextRequest,
  user: AuthUser
): NextResponse | null {
  const config = RATE_LIMITS[user.role] ?? RATE_LIMITS.agent;
  const result = checkRateLimit(`${user.id}:${req.nextUrl.pathname}`, config);

  if (!result.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)) },
      }
    );
  }
  return null;
}

/** Standard success response */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

/** Standard error response */
export function err(message: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}
