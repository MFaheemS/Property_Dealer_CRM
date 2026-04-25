import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import FollowUp from "@/models/FollowUp";
import { logActivity } from "@/services/activityService";
import { getRequestUser, ok, err } from "@/lib/apiHelpers";
import { Types } from "mongoose";

const CreateSchema = z.object({
  leadId:      z.string().min(1),
  scheduledAt: z.string().min(1),
  note:        z.string().max(500).optional(),
});

// GET: agent's upcoming + overdue follow-ups
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = getRequestUser(req);
    const followups = await FollowUp.find({ agentId: new Types.ObjectId(user.id) })
      .sort({ scheduledAt: 1 })
      .populate("leadId", "name propertyInterest budget")
      .lean();
    return ok(followups);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to fetch follow-ups", 500);
  }
}

// POST: create a follow-up
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user   = getRequestUser(req);
    const body   = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Invalid input");

    const followup = await FollowUp.create({
      leadId:      new Types.ObjectId(parsed.data.leadId),
      agentId:     new Types.ObjectId(user.id),
      scheduledAt: new Date(parsed.data.scheduledAt),
      note:        parsed.data.note ?? "",
    });

    await logActivity({
      leadId:      parsed.data.leadId,
      action:      "followup_set",
      performedBy: user.id,
      meta:        { scheduledAt: parsed.data.scheduledAt, note: parsed.data.note },
    });

    return ok(followup, 201);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to create follow-up", 500);
  }
}

// PATCH: mark follow-up done
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const user  = getRequestUser(req);
    const { id } = await req.json();
    if (!id) return err("id is required");

    const followup = await FollowUp.findOneAndUpdate(
      { _id: new Types.ObjectId(id), agentId: new Types.ObjectId(user.id) },
      { isDone: true },
      { new: true }
    );
    if (!followup) return err("Follow-up not found", 404);

    await logActivity({
      leadId:      followup.leadId.toString(),
      action:      "followup_completed",
      performedBy: user.id,
    });

    return ok(followup);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to update follow-up", 500);
  }
}
