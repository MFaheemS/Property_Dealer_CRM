"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp, Users, CheckCircle2, Clock,
  Plus, AlertTriangle, ArrowRight,
} from "lucide-react";
import { useAuth }    from "@/hooks/useAuth";
import { api }        from "@/lib/apiClient";
import { ILead }      from "@/types";
import { formatPKR, PRIORITY_COLORS, STATUS_COLORS, isOverdue } from "@/lib/utils";
import StatsCard from "@/components/dashboard/StatsCard";

interface DashSummary {
  total:    number;
  newCount: number;
  closed:   number;
  overdue:  number;
  recent:   ILead[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState<DashSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res   = await api.get<{ data: { leads: ILead[]; total: number } }>("/api/leads?limit=10");
        const leads = res.data.leads;
        setStats({
          total:    res.data.total,
          newCount: leads.filter((l) => l.status === "new").length,
          closed:   leads.filter((l) => l.status === "closed").length,
          overdue:  leads.filter((l) => isOverdue(l.followUpDate)).length,
          recent:   leads.slice(0, 6),
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="glass rounded-2xl p-6 border border-yellow-400/10 bg-gradient-to-r from-yellow-400/5 to-transparent flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-slate-400 text-sm">{greeting},</p>
          <h2 className="text-2xl font-bold text-slate-100 mt-0.5">
            {user?.name} <span className="text-gold-gradient">✦</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link href="/leads" className="btn-gold flex items-center gap-2 px-5 py-2.5 text-sm">
          <Plus className="w-4 h-4" />
          Add Lead
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass rounded-2xl h-28 animate-pulse" />)
        ) : (
          <>
            <StatsCard label="Total Leads"   value={stats?.total    ?? 0} icon={<TrendingUp   className="w-5 h-5 text-yellow-400" />} accent="gold"    />
            <StatsCard label="New This Week" value={stats?.newCount  ?? 0} icon={<Clock        className="w-5 h-5 text-blue-400" />}   accent="blue"    />
            <StatsCard label="Deals Closed"  value={stats?.closed    ?? 0} icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} accent="emerald" />
            <StatsCard label="Overdue"        value={stats?.overdue   ?? 0} icon={<AlertTriangle className="w-5 h-5 text-red-400" />}    accent="red"     sub="follow-ups" />
          </>
        )}
      </div>

      {/* Recent leads */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-slate-200">Recent Leads</h3>
          </div>
          <Link href="/leads" className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-800/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !stats?.recent.length ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">🏠</p>
            <p className="text-slate-400 text-sm">No leads yet</p>
            <Link href="/leads" className="btn-gold mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm">
              <Plus className="w-4 h-4" /> Add your first lead
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {stats.recent.map((lead) => (
              <Link
                key={lead._id}
                href={`/leads/${lead._id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-800/20 transition-colors group"
              >
                {/* Priority dot */}
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  lead.priority === "high" ? "bg-red-400" :
                  lead.priority === "medium" ? "bg-amber-400" : "bg-emerald-400"
                }`} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate group-hover:text-yellow-400 transition-colors">
                    {lead.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{lead.propertyInterest}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold text-yellow-400 hidden sm:block">
                    {formatPKR(lead.budget)}
                  </span>
                  <span className={`hidden md:inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[lead.priority]}`}>
                    {lead.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[lead.status]}`}>
                    {lead.status}
                  </span>
                  {isOverdue(lead.followUpDate) && (
                    <span title="Overdue follow-up">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links — admin only */}
      {user?.role === "admin" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/analytics" className="glass rounded-2xl p-5 border border-yellow-400/10 hover:border-yellow-400/30 transition-colors group">
            <TrendingUp className="w-6 h-6 text-yellow-400 mb-3" />
            <p className="font-semibold text-slate-200 group-hover:text-yellow-400 transition-colors">Analytics</p>
            <p className="text-xs text-slate-500 mt-1">View performance charts and agent stats</p>
          </Link>
          <Link href="/agents" className="glass rounded-2xl p-5 border border-emerald-400/10 hover:border-emerald-400/30 transition-colors group">
            <Users className="w-6 h-6 text-emerald-400 mb-3" />
            <p className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">Agents</p>
            <p className="text-xs text-slate-500 mt-1">Manage your team of property agents</p>
          </Link>
        </div>
      )}
    </div>
  );
}
