import { NextRequest } from "next/server";
import { getAllAgents } from "@/services/authService";
import { getRequestUser, ok, err } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  try {
    const user = getRequestUser(req);
    // Middleware already blocks non-admins, but double-check
    if (user.role !== "admin") return err("Forbidden", 403);
    const agents = await getAllAgents();
    return ok(agents);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to fetch agents", 500);
  }
}
