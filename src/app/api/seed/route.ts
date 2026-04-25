import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User, { IUserDocument } from "@/models/User";
import Lead from "@/models/Lead";
import { SEED_USERS, SEED_LEADS } from "@/lib/seedData";

// Only available in development
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  await connectDB();

  // Clear existing data
  await Promise.all([User.deleteMany({}), Lead.deleteMany({})]);

  // Create users one-by-one so the pre-save bcrypt hook fires
  const createdUsers: IUserDocument[] = [];
  for (const u of SEED_USERS) {
    createdUsers.push(await User.create(u));
  }

  const adminUser  = createdUsers.find((u) => u.role === "admin")!;
  const agentUsers = createdUsers.filter((u) => u.role === "agent");

  // Assign leads alternately to agents
  const leadsWithAgents = SEED_LEADS.map((lead, i) => ({
    ...lead,
    assignedTo: agentUsers[i % agentUsers.length]._id,
  }));

  await Lead.insertMany(leadsWithAgents);

  return NextResponse.json({
    success: true,
    message: `Seeded ${createdUsers.length} users and ${leadsWithAgents.length} leads`,
    credentials: {
      admin: { email: adminUser.email, password: "admin123" },
      agent: { email: agentUsers[0].email, password: "agent123" },
    },
  });
}
