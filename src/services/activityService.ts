import { connectDB } from "@/lib/db";
import ActivityLog, { ActivityAction } from "@/models/ActivityLog";
import { Types } from "mongoose";

interface LogActivityOptions {
  leadId: string;
  action: ActivityAction;
  performedBy: string;
  meta?: Record<string, unknown>;
}

/**
 * Write a single activity entry.
 * Called from every lead mutation so the timeline stays complete.
 */
export async function logActivity(opts: LogActivityOptions): Promise<void> {
  await connectDB();
  await ActivityLog.create({
    leadId:      new Types.ObjectId(opts.leadId),
    action:      opts.action,
    performedBy: new Types.ObjectId(opts.performedBy),
    meta:        opts.meta ?? {},
    timestamp:   new Date(),
  });
}

/**
 * Fetch the full activity timeline for a lead, newest first.
 * Populates the performedBy user so the UI can show name + avatar.
 */
export async function getLeadActivity(leadId: string) {
  await connectDB();
  return ActivityLog.find({ leadId: new Types.ObjectId(leadId) })
    .sort({ timestamp: -1 })
    .populate("performedBy", "name email avatar role")
    .lean();
}
