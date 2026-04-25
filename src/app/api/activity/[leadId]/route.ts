import { NextRequest } from "next/server";
import { getLeadActivity } from "@/services/activityService";
import { getRequestUser, ok, err } from "@/lib/apiHelpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    getRequestUser(req); // ensures auth
    const logs = await getLeadActivity(leadId);
    return ok(logs);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to fetch activity", 500);
  }
}
