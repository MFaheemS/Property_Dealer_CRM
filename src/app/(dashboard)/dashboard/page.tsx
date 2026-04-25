"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Users, CheckCircle2, Clock, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api }     from "@/lib/apiClient";
import { ILead }   from "@/types";
import { formatPKR, STATUS_COLORS, PRIORITY_COLORS } from "@/lib/utils";

interface DashboardStats {
  totalLeads:  number;
  newLeads:    number;
  closedLeads: number;
  myLeads:     number;
  recent:      ILead[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ data: { leads: ILead[]; total: number } }>("/api/leads?limit=5");
        const leads = res.data.leads;
        setStats({
          totalLeads:  res.data.total,
          newLeads:    leads.filter((l) => l.status === "new").length,
          closedLeads: leads.filter((l) => l.status === "closed").length,
          myLeads:     leads.length,
          recent:      leads.slice(0, 5),
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            Welcome back, <span className="text-gold-gradient">{user?.name?.split(" ")[0]}</span> 👋
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {new Date().toLocaleDateString("en-PK", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
          </p>
        </div>
        <Link href="/leads" className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" />
          New Lead
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-28 animate-pulse" />
          ))
        ) : (
          <>
            <StatCard icon={<TrendingUp className="w-5 h-5 text-yellow-400" />}
              label="Total Leads" value={stats?.totalLeads ?? 0} color="yellow" />
            <StatCard icon={<Clock className="w-5 h-5 text-blue-400" />}
              label="New Leads"   value={stats?.newLeads ?? 0}   color="blue" />
            <StatCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              label="Closed"     value={stats?.closedLeads ?? 0} color="emerald" />
            <StatCard icon={<Users className="w-5 h-5 text-purple-400" />}
              label="My Leads"   value={stats?.myLeads ?? 0}     color="purple" />
          </>
        )}
      </div>

      {/* Recent leads table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
          <h3 className="font-semibold text-slate-200 text-sm">Recent Leads</h3>
          <Link href="/leads" className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-800/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : stats?.recent.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No leads yet — <Link href="/leads" className="text-yellow-400 hover:underline">add your first one</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {stats?.recent.map((lead) => (
              <Link
                key={lead._id}
                href={`/leads/${lead._id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/20 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.propertyInterest}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-sm font-semibold text-yellow-400">
                    {formatPKR(lead.budget)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[lead.priority]}`}>
                    {lead.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[lead.status]}`}>
                    {lead.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon:  React.ReactNode;
  label: string;
  value: number;
  color: "yellow" | "blue" | "emerald" | "purple";
}) {
  const borders = {
    yellow:  "border-yellow-400/20",
    blue:    "border-blue-400/20",
    emerald: "border-emerald-400/20",
    purple:  "border-purple-400/20",
  };
  return (
    <div className={`glass rounded-2xl p-5 border ${borders[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="p-2 rounded-lg bg-slate-800/60">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
