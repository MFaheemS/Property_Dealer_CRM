"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IUser } from "@/types";
import { api } from "@/lib/apiClient";
import { avatarUrl, timeAgo } from "@/lib/utils";
import Image from "next/image";
import { TrendingUp, CheckCircle2, Clock, ChevronRight } from "lucide-react";

interface AgentWithStats extends IUser {
  totalLeads:  number;
  closedLeads: number;
  activeLeads: number;
}

export default function AgentsPage() {
  const [agents,  setAgents]  = useState<AgentWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ data: IUser[] }>("/api/agents"),
      api.get<{ data: { agentPerformance: { agent: IUser; total: number; closed: number }[] } }>("/api/analytics"),
    ]).then(([agentsRes, analyticsRes]) => {
      const perfMap = new Map(
        analyticsRes.data.agentPerformance.map((p) => [p.agent._id, p])
      );
      setAgents(
        agentsRes.data.map((agent) => {
          const perf = perfMap.get(agent._id);
          return {
            ...agent,
            totalLeads:  perf?.total  ?? 0,
            closedLeads: perf?.closed ?? 0,
            activeLeads: (perf?.total ?? 0) - (perf?.closed ?? 0),
          };
        })
      );
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Agents</h2>
        <p className="text-sm text-slate-500 mt-0.5">{agents.length} active agent{agents.length !== 1 ? "s" : ""}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-slate-500">No agents found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const closeRate = agent.totalLeads > 0
              ? Math.round((agent.closedLeads / agent.totalLeads) * 100)
              : 0;

            return (
              <Link key={agent._id} href={`/agents/${agent._id}`} className="glass rounded-2xl p-5 space-y-4 block hover:border-yellow-400/20 border border-transparent transition-colors group">
                {/* Identity */}
                <div className="flex items-center gap-3">
                  <Image
                    src={agent.avatar ?? avatarUrl(agent.name)}
                    alt={agent.name}
                    width={48}
                    height={48}
                    className="rounded-xl border border-slate-700 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-100 truncate group-hover:text-yellow-400 transition-colors">{agent.name}</p>
                    <p className="text-xs text-slate-500 truncate">{agent.email}</p>
                    <p className="text-xs text-slate-600 mt-0.5">Joined {timeAgo(agent.createdAt)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-yellow-400 transition-colors flex-shrink-0" />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-800/40 rounded-xl py-2 px-1">
                    <TrendingUp className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-slate-100">{agent.totalLeads}</p>
                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                  <div className="bg-slate-800/40 rounded-xl py-2 px-1">
                    <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-slate-100">{agent.activeLeads}</p>
                    <p className="text-xs text-slate-500">Active</p>
                  </div>
                  <div className="bg-slate-800/40 rounded-xl py-2 px-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-slate-100">{agent.closedLeads}</p>
                    <p className="text-xs text-slate-500">Closed</p>
                  </div>
                </div>

                {/* Close rate bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Close rate</span>
                    <span className="text-yellow-400 font-semibold">{closeRate}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-600 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${closeRate}%` }}
                    />
                  </div>
                </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
