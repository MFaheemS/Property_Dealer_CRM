import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import User, { IUserDocument } from "@/models/User";
import Lead from "@/models/Lead";
import ActivityLog from "@/models/ActivityLog";
import FollowUp from "@/models/FollowUp";
import { computePriority, computeScore } from "@/lib/utils";
import { SEED_USERS, SEED_LEADS, UNASSIGNED_LEADS } from "@/lib/seedData";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Lead.deleteMany({}),
      ActivityLog.deleteMany({}),
      FollowUp.deleteMany({}),
    ]);

    // Users — one-by-one so bcrypt pre-save hook fires
    const createdUsers: IUserDocument[] = [];
    for (const u of SEED_USERS) {
      createdUsers.push(await User.create(u));
    }

    const adminUser  = createdUsers.find((u) => u.role === "admin")!;
    const agentUsers = createdUsers.filter((u) => u.role === "agent");

    // Build assigned lead documents manually (bypass timestamps: true)
    const leadDocs: object[]      = [];
    const activityLogs: object[]  = [];
    const followUps: object[]     = [];
    const leadIds: Types.ObjectId[] = [];

    for (let i = 0; i < SEED_LEADS.length; i++) {
      const sl        = SEED_LEADS[i] as Record<string, unknown>;
      const agent     = agentUsers[i % agentUsers.length];
      const createdAt = sl.createdAt as Date ?? new Date();
      const id        = new Types.ObjectId();
      leadIds.push(id);

      leadDocs.push({
        _id:              id,
        name:             sl.name,
        email:            sl.email,
        phone:            sl.phone,
        propertyInterest: sl.propertyInterest,
        budget:           sl.budget,
        status:           sl.status,
        priority:         computePriority(sl.budget as number),
        score:            computeScore(sl.budget as number),
        notes:            sl.notes ?? "",
        assignedTo:       agent._id,
        followUpDate:     sl.followUpDate ?? null,
        createdAt,
        updatedAt:        createdAt,
      });

      activityLogs.push({ leadId: id, action: "lead_created",  performedBy: adminUser._id, meta: { leadName: sl.name },                                    timestamp: createdAt });
      activityLogs.push({ leadId: id, action: "lead_assigned",  performedBy: adminUser._id, meta: { agentName: agent.name },                                timestamp: new Date(createdAt.getTime() + 60_000) });
      if (sl.status !== "new")  activityLogs.push({ leadId: id, action: "status_changed",  performedBy: agent._id, meta: { from: "new", to: sl.status },   timestamp: new Date(createdAt.getTime() + 3_600_000) });
      if (sl.notes)             activityLogs.push({ leadId: id, action: "note_added",       performedBy: agent._id, meta: { note: (sl.notes as string).slice(0, 80) }, timestamp: new Date(createdAt.getTime() + 7_200_000) });

      if (sl.followUpDate) {
        const isOverdue = (sl.followUpDate as Date) < new Date();
        followUps.push({ leadId: id, agentId: agent._id, scheduledAt: sl.followUpDate, note: isOverdue ? "Scheduled call — needs follow-up" : "Upcoming check-in call", isDone: sl.status === "closed" });
        activityLogs.push({ leadId: id, action: "followup_set", performedBy: agent._id, meta: { scheduledAt: sl.followUpDate }, timestamp: new Date(createdAt.getTime() + 10_800_000) });
        if (sl.status === "closed") activityLogs.push({ leadId: id, action: "followup_completed", performedBy: agent._id, meta: { note: "Deal closed" }, timestamp: sl.followUpDate });
      }
    }

    // Unassigned leads
    for (const ul of UNASSIGNED_LEADS) {
      const sl        = ul as Record<string, unknown>;
      const createdAt = sl.createdAt as Date ?? new Date();
      const id        = new Types.ObjectId();
      leadIds.push(id);

      leadDocs.push({
        _id:              id,
        name:             sl.name,
        email:            sl.email,
        phone:            sl.phone,
        propertyInterest: sl.propertyInterest,
        budget:           sl.budget,
        status:           "new",
        priority:         computePriority(sl.budget as number),
        score:            computeScore(sl.budget as number),
        notes:            sl.notes ?? "",
        assignedTo:       null,
        followUpDate:     null,
        createdAt,
        updatedAt:        createdAt,
      });

      activityLogs.push({ leadId: id, action: "lead_created", performedBy: adminUser._id, meta: { leadName: sl.name }, timestamp: createdAt });
    }

    // Bulk insert — { timestamps: false } so Mongoose doesn't overwrite our createdAt
    await Lead.insertMany(leadDocs, { timestamps: false } as object);
    await ActivityLog.insertMany(activityLogs);
    if (followUps.length) await FollowUp.insertMany(followUps);

    return NextResponse.json({
      success: true,
      message: `Seeded ${createdUsers.length} users, ${leadDocs.length} leads (${UNASSIGNED_LEADS.length} unassigned), ${activityLogs.length} activity logs, ${followUps.length} follow-ups`,
      credentials: {
        admin:  { email: adminUser.email, password: "admin123" },
        agents: agentUsers.map((a) => ({ name: a.name, email: a.email, password: "agent123" })),
      },
    });
  } catch (err) {
    console.error("[seed] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
