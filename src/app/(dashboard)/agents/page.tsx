"use client";

import { useEffect, useState } from "react";
import { IUser } from "@/types";
import { api } from "@/lib/apiClient";
import { avatarUrl, timeAgo } from "@/lib/utils";
import Image from "next/image";

export default function AgentsPage() {
  const [agents,  setAgents]  = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: IUser[] }>("/api/agents")
      .then((res) => setAgents(res.data))
      .finally(() => setLoading(false));
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
            <div key={i} className="glass rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent._id} className="glass rounded-2xl p-5 card-hover flex items-center gap-4">
              <Image
                src={agent.avatar ?? avatarUrl(agent.name)}
                alt={agent.name}
                width={52}
                height={52}
                className="rounded-xl border border-slate-700 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold text-slate-100 truncate">{agent.name}</p>
                <p className="text-xs text-slate-500 truncate">{agent.email}</p>
                <p className="text-xs text-slate-600 mt-1">Joined {timeAgo(agent.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
