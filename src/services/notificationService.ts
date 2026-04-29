import { connectDB } from "@/lib/db";
import Notification, { NotificationType } from "@/models/Notification";
import User from "@/models/User";

export async function createNotification(opts: {
  userId:  string;
  type:    NotificationType;
  title:   string;
  message: string;
  leadId?: string;
}) {
  await connectDB();
  return Notification.create(opts);
}

/** Notify all admins about a new lead */
export async function notifyAdminsNewLead(leadName: string, budget: number, leadId: string) {
  await connectDB();
  const admins = await User.find({ role: "admin" }).select("_id").lean();
  const PKR = budget.toLocaleString("en-PK");
  await Promise.all(
    admins.map((a) =>
      createNotification({
        userId:  a._id.toString(),
        type:    "lead_created",
        title:   "New Lead Received",
        message: `${leadName} — PKR ${PKR}`,
        leadId,
      })
    )
  );
}

/** Notify a specific agent they've been assigned a lead */
export async function notifyAgentAssigned(agentId: string, leadName: string, leadId: string) {
  return createNotification({
    userId:  agentId,
    type:    "lead_assigned",
    title:   "Lead Assigned to You",
    message: `You have been assigned: ${leadName}`,
    leadId,
  });
}

export async function getNotifications(userId: string, limit = 50) {
  await connectDB();
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function countUnread(userId: string) {
  await connectDB();
  return Notification.countDocuments({ userId, isRead: false });
}

export async function markAllRead(userId: string) {
  await connectDB();
  return Notification.updateMany({ userId, isRead: false }, { isRead: true });
}

export async function markOneRead(notifId: string, userId: string) {
  await connectDB();
  return Notification.findOneAndUpdate(
    { _id: notifId, userId },
    { isRead: true },
    { new: true }
  );
}
