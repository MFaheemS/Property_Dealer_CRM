import { NextRequest } from "next/server";
import { getAnalytics } from "@/services/analyticsService";
import { getRequestUser, ok, err } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  try {
    const user = getRequestUser(req);
    if (user.role !== "admin") return err("Forbidden", 403);
    const data = await getAnalytics();
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to load analytics", 500);
  }
}
