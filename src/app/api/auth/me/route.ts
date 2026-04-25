import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/services/authService";
import { getRequestUser } from "@/lib/apiHelpers";

// Returns the currently authenticated user's profile
export async function GET(req: NextRequest) {
  try {
    const authUser = getRequestUser(req);
    const user     = await getUserById(authUser.id);

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}
