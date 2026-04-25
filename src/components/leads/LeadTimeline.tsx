"use client";

import { useEffect, useState } from "react";
import {
  PlusCircle, RefreshCw, UserCheck, MessageSquare,
  Calendar, CheckCircle2, Trash2, Edit2,
} from "lucide-react";
import { IActivityLog } from "@/types";
import { api }          from "@/lib/apiClient";
import { timeAgo, avatarUrl } from "@/lib/utils";
import Image from "next/image";

const ACTION_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  lead_created:       { label: "Lead created",          icon: <PlusCircle   className="w-4 h-4" />, color: "text-emerald-400 bg-emerald-400/10" },
  lead_updated:       { label: "Lead updated",          icon: <Edit2        className="w-4 h-4" />, color: "text-blue-400 bg-blue-400/10"       },
  lead_assigned:      { label: "Lead assigned",         icon: <UserCheck    className="w-4 h-4" />, color: "text-yellow-400 bg-yellow-400/10"   },
  status_changed:     { label: "Status changed",        icon: <RefreshCw    className="w-4 h-4" />, color: "text-purple-400 bg-purple-400/10"   },
  note_added:         { label: "Note added",            icon: <MessageSquare className="w-4 h-4" />, color: "text-slate-400 bg-slate-400/10"   },
  followup_set:       { label: "Follow-up scheduled",  icon: <Calendar     className="w-4 h-4" />, color: "text-amber-400 bg-amber-400/10"    },
  followup_completed: { label: "Follow-up completed",  icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-400 bg-emerald-400/10" },
  lead_deleted:       { label: "Lead deleted",          icon: <Trash2       className="w-4 h-4" />, color: "text-red-400 bg-red-400/10"        },
};

function buildDetail(log: IActivityLog): string {
  const m = log.meta ?? {};
  switch (log.action) {
    case "status_changed":
      return `${m.from} → ${m.to}`;
    case "lead_assigned":
      return m.newAgent ? `Assigned to agent` : "Unassigned";
    case "note_added":
      return String(m.note ?? "").slice(0, 80) + (String(m.note ?? "").length > 80 ? "…" : "");
    case "followup_set":
      return m.scheduledAt
        ? `Scheduled for ${new Date(m.scheduledAt as string).toLocaleDateString("en-PK")}`
        : "";
    default:
      return "";
  }
}

export default function LeadTimeline({ leadId }: { leadId: string }) {
  const [logs,    setLogs]    = useState<IActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: IActivityLog[] }>(`/api/activity/${leadId}`)
      .then((res) => setLogs(res.data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [leadId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 bg-slate-800 rounded-lg animate-pulse flex-shrink-0" />
            <div className="flex-1 h-8 bg-slate-800 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!logs.length) {
    return <p className="text-sm text-slate-500 text-center py-4">No activity yet.</p>;
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-800" />

      <div className="space-y-4 pl-10">
        {logs.map((log) => {
          const meta   = ACTION_META[log.action] ?? { label: log.action, icon: null, color: "text-slate-400 bg-slate-800" };
          const detail = buildDetail(log);
          const by     = typeof log.performedBy === "object" ? log.performedBy : null;

          return (
            <div key={log._id} className="relative">
              {/* Dot */}
              <span className={`absolute -left-[2.15rem] w-7 h-7 rounded-lg flex items-center justify-center text-xs ${meta.color}`}>
                {meta.icon}
              </span>

              <div className="glass rounded-xl px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{meta.label}</p>
                    {detail && <p className="text-xs text-slate-500 mt-0.5">{detail}</p>}
                  </div>
                  <span className="text-xs text-slate-600 flex-shrink-0">{timeAgo(log.timestamp)}</span>
                </div>

                {by && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Image
                      src={by.avatar ?? avatarUrl(by.name)}
                      alt={by.name}
                      width={16}
                      height={16}
                      className="rounded border border-slate-700"
                    />
                    <span className="text-xs text-slate-500">{by.name}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
