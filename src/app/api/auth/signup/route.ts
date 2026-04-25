import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signup } from "@/services/authService";
import { createAuthCookie } from "@/lib/auth";

const SignupSchema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters").max(60),
  email:    z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role:     z.enum(["admin", "agent"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    const { user, token } = await signup(parsed.data);

    const response = NextResponse.json(
      { success: true, data: user, message: "Account created successfully" },
      { status: 201 }
    );
    response.headers.set("Set-Cookie", createAuthCookie(token));
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signup failed";
    const status  = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
