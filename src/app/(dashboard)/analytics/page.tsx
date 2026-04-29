"use client";

import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, Users, CheckCircle2, XCircle, Target, UserCheck, UserX } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import StatsCard from "@/components/dashboard/StatsCard";
import { avatarUrl } from "@/lib/utils";
import Image from "next/image";

const STATUS_PALETTE: Record<string, string> = {
  new:         "#3B82F6",
  contacted:   "#A855F7",
  qualified:   "#06B6D4",
  negotiation: "#F59E0B",
  closed:      "#10B981",
  lost:        "#EF4444",
};

const PRIORITY_PALETTE: Record<string, string> = {
  high:   "#EF4444",
  medium: "#F59E0B",
  low:    "#10B981",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#1E293B",
  border:          "1px solid #334155",
  borderRadius:    "0.75rem",
  color:           "#F1F5F9",
  fontSize:        "13px",
};

export default function AnalyticsPage() {
  const { data, loading, error } = useAnalytics();

  if (loading) return <AnalyticsSkeleton />;
  if (error)   return <div className="glass rounded-2xl p-8 text-center text-red-400">{error}</div>;
  if (!data)   return null;

  const totalLeads   = data.totalLeads;
  const closedLeads  = data.byStatus?.closed  ?? 0;
  const lostLeads    = data.byStatus?.lost    ?? 0;
  const activeLeads  = totalLeads - closedLeads - lostLeads;
  const closeRate    = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

  const statusData = Object.entries(data.byStatus ?? {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: STATUS_PALETTE[name] ?? "#94A3B8",
  }));

  const priorityData = Object.entries(data.byPriority ?? {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: PRIORITY_PALETTE[name] ?? "#94A3B8",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Analytics</h2>
        <p className="text-sm text-slate-400 mt-1">Real-time performance overview</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard label="Total Leads"   value={totalLeads}                 icon={<TrendingUp   className="w-5 h-5 text-yellow-400"  />} accent="gold"    />
        <StatsCard label="Active Leads"  value={activeLeads}                icon={<Target       className="w-5 h-5 text-blue-400"    />} accent="blue"    />
        <StatsCard label="Closed Deals"  value={closedLeads}                icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} accent="emerald" sub={`${closeRate}% close rate`} />
        <StatsCard label="Lost Leads"    value={lostLeads}                  icon={<XCircle      className="w-5 h-5 text-red-400"     />} accent="red"     />
        <StatsCard label="Assigned"      value={data.assignedCount ?? 0}    icon={<UserCheck    className="w-5 h-5 text-emerald-400" />} accent="emerald" sub="to an agent" />
        <StatsCard label="Unassigned"    value={data.unassignedCount ?? 0}  icon={<UserX        className="w-5 h-5 text-amber-400"   />} accent="gold"    sub="awaiting assignment" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly trend bar chart */}
        {data.monthlyLeads.length > 0 && (
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-5">Monthly Lead Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.monthlyLeads} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(212,175,55,0.05)" }} />
                <Bar dataKey="count" name="Leads" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Priority pie chart */}
        {priorityData.length > 0 && (
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-5">Leads by Priority</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  formatter={(value) => <span style={{ color: "#94A3B8", fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Status distribution */}
      {statusData.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-5">Lead Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748B", fontSize: 11 }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#94A3B8", fontSize: 12 }} width={90} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Agent performance table */}
      {data.agentPerformance.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800/60">
            <Users className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-slate-300">Agent Performance</h3>
          </div>
          <div className="divide-y divide-slate-800/40">
            {data.agentPerformance.map(({ agent, total, closed }) => {
              const rate = total > 0 ? Math.round((closed / total) * 100) : 0;
              return (
                <div key={agent._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800/20 transition-colors">
                  <Image
                    src={agent.avatar ?? avatarUrl(agent.name)}
                    alt={agent.name}
                    width={36}
                    height={36}
                    className="rounded-lg border border-slate-700 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{agent.name}</p>
                    <p className="text-xs text-slate-500">{agent.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-200">{total} leads</p>
                    <p className="text-xs text-slate-500">{closed} closed · {rate}% rate</p>
                  </div>
                  {/* Mini progress bar */}
                  <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-600 to-emerald-500 rounded-full"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl h-28 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass rounded-2xl h-72 animate-pulse" />
        <div className="glass rounded-2xl h-72 animate-pulse" />
      </div>
      <div className="glass rounded-2xl h-56 animate-pulse" />
    </div>
  );
}
