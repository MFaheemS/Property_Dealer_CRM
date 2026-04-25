import { connectDB } from "@/lib/db";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { AnalyticsSummary } from "@/types";

export async function getAnalytics(): Promise<AnalyticsSummary> {
  await connectDB();

  const [
    totalLeads,
    byStatusRaw,
    byPriorityRaw,
    agentStatsRaw,
    monthlyRaw,
    recentLeads,
  ] = await Promise.all([
    Lead.countDocuments(),

    // Group by status
    Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // Group by priority
    Lead.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),

    // Per-agent: total leads + closed leads
    Lead.aggregate([
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

    // Leads per month (last 6 months)
    Lead.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    // 5 most recent leads
    Lead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("assignedTo", "name avatar")
      .lean(),
  ]);

  // Shape status map
  const byStatus = byStatusRaw.reduce(
    (acc, { _id, count }) => ({ ...acc, [_id]: count }),
    {} as AnalyticsSummary["byStatus"]
  );

  // Shape priority map
  const byPriority = byPriorityRaw.reduce(
    (acc, { _id, count }) => ({ ...acc, [_id]: count }),
    {} as AnalyticsSummary["byPriority"]
  );

  // Enrich agent stats with user names
  const agentIds = agentStatsRaw.map((a) => a._id);
  const agents   = await User.find({ _id: { $in: agentIds } })
    .select("name email avatar role")
    .lean();
  const agentMap = new Map(agents.map((a) => [a._id.toString(), a]));

  const agentPerformance = agentStatsRaw
    .map((a) => ({
      agent: agentMap.get(a._id.toString())!,
      total: a.total,
      closed: a.closed,
    }))
    .filter((a) => a.agent); // drop if user was deleted

  // Shape monthly leads
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyLeads = monthlyRaw.map(({ _id, count }) => ({
    month: `${MONTHS[_id.month - 1]} ${_id.year}`,
    count,
  }));

  return {
    totalLeads,
    byStatus,
    byPriority,
    agentPerformance,
    monthlyLeads,
    recentLeads: recentLeads as AnalyticsSummary["recentLeads"],
  };
}
