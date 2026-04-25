"use client";

import { useEffect, useState, FormEvent } from "react";
import { Calendar, CheckCircle2, AlertTriangle, Plus, Loader2 } from "lucide-react";
import { IFollowUp } from "@/types";
import { api }       from "@/lib/apiClient";
import { useToast }  from "@/components/shared/Toast";
import { isOverdue } from "@/lib/utils";
import { cn }        from "@/lib/utils";

export default function FollowUpWidget({ leadId }: { leadId: string }) {
  const { toast } = useToast();
  const [followups, setFollowups] = useState<IFollowUp[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [showForm,  setShowForm]  = useState(false);
  const [form, setForm] = useState({ scheduledAt: "", note: "" });

  async function load() {
    const res = await api.get<{ data: IFollowUp[] }>("/api/followup");
    setFollowups(res.data.filter((f) => f.leadId === leadId));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [leadId]); // eslint-disable-line

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/followup", { leadId, ...form });
      toast("Follow-up scheduled", "success");
      setShowForm(false);
      setForm({ scheduledAt: "", note: "" });
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function markDone(id: string) {
    try {
      await api.patch("/api/followup", { id });
      toast("Follow-up completed!", "success");
      await load();
    } catch {
      toast("Failed to update", "error");
    }
  }

  const pending   = followups.filter((f) => !f.isDone);
  const completed = followups.filter((f) => f.isDone);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-yellow-400" />
          Follow-ups
        </h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" /> Schedule
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="glass rounded-xl p-4 space-y-3 border border-yellow-400/10">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Date & Time</label>
            <input
              type="datetime-local"
              className="input-base text-sm"
              value={form.scheduledAt}
              onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Note (optional)</label>
            <textarea
              className="input-base text-sm resize-none"
              rows={2}
              placeholder="e.g. Call to discuss DHA plot details"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-400 text-xs hover:border-slate-600 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 btn-gold py-2 rounded-lg text-xs flex items-center justify-center gap-1">
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}

      {/* Pending follow-ups */}
      {loading ? (
        <div className="h-12 bg-slate-800/40 rounded-xl animate-pulse" />
      ) : pending.length === 0 && !showForm ? (
        <p className="text-xs text-slate-600 text-center py-2">No pending follow-ups</p>
      ) : (
        <div className="space-y-2">
          {pending.map((f) => {
            const overdue = isOverdue(f.scheduledAt);
            return (
              <div
                key={f._id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 border text-sm",
                  overdue
                    ? "bg-red-400/5 border-red-400/20"
                    : "bg-slate-900/40 border-slate-800"
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {overdue
                      ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      : <Calendar      className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    }
                    <span className={cn("text-xs font-medium", overdue ? "text-red-400" : "text-amber-400")}>
                      {new Date(f.scheduledAt).toLocaleDateString("en-PK", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                    </span>
                    {overdue && <span className="text-xs text-red-400 font-semibold">OVERDUE</span>}
                  </div>
                  {f.note && <p className="text-xs text-slate-500 mt-0.5 truncate">{f.note}</p>}
                </div>
                <button
                  onClick={() => markDone(f._id)}
                  className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors flex-shrink-0"
                  title="Mark done"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <details className="text-xs text-slate-600 cursor-pointer">
          <summary className="hover:text-slate-400 transition-colors">{completed.length} completed</summary>
          <div className="mt-2 space-y-1.5">
            {completed.map((f) => (
              <div key={f._id} className="flex items-center gap-2 text-slate-600 line-through">
                <CheckCircle2 className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                <span>{new Date(f.scheduledAt).toLocaleDateString("en-PK")}</span>
                {f.note && <span className="truncate">— {f.note}</span>}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
