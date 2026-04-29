import { connectDB } from "@/lib/db";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { AnalyticsSummary } from "@/types";

export async function getAnalytics(): Promise<AnalyticsSummary> {
  await connectDB();

  const [
    totalLeads,
    assignedCount,
    unassignedCount,
    byStatusRaw,
    byPriorityRaw,
    agentStatsRaw,
    monthlyRaw,
  ] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ assignedTo: { $ne: null } }),
    Lead.countDocuments({ assignedTo: null }),

    Lead.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    Lead.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),

    Lead.aggregate<{ _id: string; total: number; closed: number }>([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id:    "$assignedTo",
          total:  { $sum: 1 },
          closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]),

    Lead.aggregate<{ _id: { year: number; month: number }; count: number }>([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  const byStatus = byStatusRaw.reduce(
    (acc, { _id, count }) => ({ ...acc, [_id]: count }),
    {} as AnalyticsSummary["byStatus"]
  );

  const byPriority = byPriorityRaw.reduce(
    (acc, { _id, count }) => ({ ...acc, [_id]: count }),
    {} as AnalyticsSummary["byPriority"]
  );

  // Enrich agent stats with user details
  const agentIds = agentStatsRaw.map((a) => a._id);
  const agents   = await User.find({ _id: { $in: agentIds } })
    .select("name email avatar role")
    .lean();

  const agentMap = new Map(agents.map((a) => [a._id.toString(), a]));

  const agentPerformance: AnalyticsSummary["agentPerformance"] = agentStatsRaw
    .map((a) => {
      const agent = agentMap.get(a._id.toString());
      if (!agent) return null;
      return {
        agent: {
          _id:       agent._id.toString(),
          name:      agent.name,
          email:     agent.email,
          role:      agent.role as "admin" | "agent",
          avatar:    agent.avatar,
          createdAt: agent.createdAt?.toISOString() ?? "",
        },
        total:  a.total,
        closed: a.closed,
      };
    })
    .filter(Boolean) as AnalyticsSummary["agentPerformance"];

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyLeads = monthlyRaw.map(({ _id, count }) => ({
    month: `${MONTHS[_id.month - 1]} ${_id.year}`,
    count,
  }));

  return { totalLeads, assignedCount, unassignedCount, byStatus, byPriority, agentPerformance, monthlyLeads };
}
