import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { login } from "@/services/authService";
import { createAuthCookie } from "@/lib/auth";

const LoginSchema = z.object({
  email:    z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    const { user, token } = await login(parsed.data);

    const response = NextResponse.json(
      { success: true, data: user, message: "Logged in successfully" },
      { status: 200 }
    );
    response.headers.set("Set-Cookie", createAuthCookie(token));
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    // Return 401 for bad credentials, not 500
    const status  = message.includes("Invalid email or password") ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
