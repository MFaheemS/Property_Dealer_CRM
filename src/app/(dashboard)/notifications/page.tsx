"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, PlusCircle, UserCheck, RefreshCw, Calendar } from "lucide-react";
import { api } from "@/lib/apiClient";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface INotification {
  _id:       string;
  type:      string;
  title:     string;
  message:   string;
  leadId?:   string;
  isRead:    boolean;
  createdAt: string;
}

const TYPE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  lead_created:   { icon: <PlusCircle  className="w-4 h-4" />, color: "text-emerald-400 bg-emerald-400/10" },
  lead_assigned:  { icon: <UserCheck   className="w-4 h-4" />, color: "text-yellow-400 bg-yellow-400/10"   },
  status_changed: { icon: <RefreshCw   className="w-4 h-4" />, color: "text-purple-400 bg-purple-400/10"   },
  followup_due:   { icon: <Calendar    className="w-4 h-4" />, color: "text-amber-400 bg-amber-400/10"     },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unread,        setUnread]        = useState(0);
  const [loading,       setLoading]       = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<{ data: { notifications: INotification[]; unread: number } }>("/api/notifications");
      setNotifications(res.data.notifications);
      setUnread(res.data.unread);
    } finally {
      setLoading(false);
    }
  }

  async function markAll() {
    await api.patch("/api/notifications", {});
    setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-yellow-400" />
          <div>
            <h2 className="text-xl font-bold text-slate-100">Notifications</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Bell className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No notifications yet</p>
          <p className="text-slate-600 text-sm mt-1">Activity will appear here as leads are created and assigned</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden divide-y divide-slate-800/40">
          {notifications.map((n) => {
            const meta = TYPE_META[n.type] ?? { icon: <Bell className="w-4 h-4" />, color: "text-slate-400 bg-slate-800" };
            const inner = (
              <div className={cn(
                "flex items-start gap-4 px-5 py-4 transition-colors",
                !n.isRead ? "bg-yellow-400/[0.03]" : "hover:bg-slate-800/20"
              )}>
                <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", meta.color)}>
                  {meta.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium", n.isRead ? "text-slate-300" : "text-slate-100")}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{n.message}</p>
                </div>
                <span className="text-xs text-slate-600 flex-shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
              </div>
            );

            return n.leadId ? (
              <Link key={n._id} href={`/leads/${n.leadId}`} className="block hover:bg-slate-800/20 transition-colors">
                {inner}
              </Link>
            ) : (
              <div key={n._id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
