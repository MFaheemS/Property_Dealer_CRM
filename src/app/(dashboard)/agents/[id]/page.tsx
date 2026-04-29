"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, TrendingUp, CheckCircle2, Clock,
  Mail, AlertTriangle, Calendar,
} from "lucide-react";
import { IUser, ILead } from "@/types";
import { api } from "@/lib/apiClient";
import { avatarUrl, timeAgo, formatPKR, isOverdue, STATUS_COLORS, PRIORITY_COLORS } from "@/lib/utils";
import StatusPill    from "@/components/shared/StatusPill";
import PriorityBadge from "@/components/shared/PriorityBadge";

interface AgentDetail extends IUser {
  totalLeads:  number;
  closedLeads: number;
  activeLeads: number;
}

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [agent,  setAgent]  = useState<AgentDetail | null>(null);
  const [leads,  setLeads]  = useState<ILead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ data: IUser[] }>("/api/agents"),
      api.get<{ data: { leads: ILead[]; total: number } }>(`/api/leads?assignedTo=${id}&limit=50`),
      api.get<{ data: { agentPerformance: { agent: IUser; total: number; closed: number }[] } }>("/api/analytics"),
    ]).then(([agentsRes, leadsRes, analyticsRes]) => {
      const found = agentsRes.data.find((a) => a._id === id);
      if (!found) { router.push("/agents"); return; }

      const perf = analyticsRes.data.agentPerformance.find((p) => p.agent._id === id);
      setAgent({
        ...found,
        totalLeads:  perf?.total  ?? leadsRes.data.total,
        closedLeads: perf?.closed ?? 0,
        activeLeads: (perf?.total ?? leadsRes.data.total) - (perf?.closed ?? 0),
      });
      setLeads(leadsRes.data.leads);
    }).finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[20, 36, 48].map((h, i) => (
          <div key={i} className={`glass rounded-2xl h-${h} animate-pulse`} />
        ))}
      </div>
    );
  }
  if (!agent) return null;

  const closeRate = agent.totalLeads > 0
    ? Math.round((agent.closedLeads / agent.totalLeads) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <button
        onClick={() => router.push("/agents")}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Agents
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — profile + stats */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="glass rounded-2xl p-6 text-center">
            <Image
              src={agent.avatar ?? avatarUrl(agent.name)}
              alt={agent.name}
              width={72}
              height={72}
              className="rounded-2xl border border-slate-700 mx-auto mb-4"
            />
            <h2 className="text-lg font-bold text-slate-100">{agent.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{agent.email}</p>
            <span className="mt-3 inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
              Agent
            </span>
            <p className="text-xs text-slate-600 mt-3">Joined {timeAgo(agent.createdAt)}</p>
          </div>

          {/* Stats */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Performance</h3>
            <div className="space-y-3">
              <Stat icon={<TrendingUp className="w-4 h-4 text-yellow-400" />}  label="Total Leads"  value={agent.totalLeads} />
              <Stat icon={<Clock      className="w-4 h-4 text-blue-400"   />}  label="Active Leads" value={agent.activeLeads} />
              <Stat icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} label="Closed"     value={agent.closedLeads} />
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Close rate</span>
                <span className="text-yellow-400 font-semibold">{closeRate}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-600 to-emerald-500 rounded-full"
                  style={{ width: `${closeRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <a
            href={`mailto:${agent.email}`}
            className="glass rounded-xl p-4 flex items-center gap-3 hover:border-yellow-400/20 border border-transparent transition-colors"
          >
            <Mail className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-300 truncate">{agent.email}</span>
          </a>
        </div>

        {/* Right — assigned leads */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800/60">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                Assigned Leads
                <span className="ml-2 text-xs text-slate-500 font-normal">({leads.length})</span>
              </h3>
            </div>

            {leads.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-slate-500 text-sm">No leads assigned yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/40">
                {leads.map((lead) => (
                  <Link
                    key={lead._id}
                    href={`/leads/${lead._id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-800/20 transition-colors group"
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      lead.priority === "high"   ? "bg-red-400" :
                      lead.priority === "medium" ? "bg-amber-400" : "bg-emerald-400"
                    }`} />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate group-hover:text-yellow-400 transition-colors">
                        {lead.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{lead.propertyInterest}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold text-yellow-400 hidden sm:block">
                        {formatPKR(lead.budget)}
                      </span>
                      <StatusPill status={lead.status} />
                      {isOverdue(lead.followUpDate) && (
                        <span title="Overdue follow-up">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        {icon}
        {label}
      </div>
      <span className="text-sm font-bold text-slate-100">{value}</span>
    </div>
  );
}
