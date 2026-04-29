"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { X, Loader2, Search, UserCheck } from "lucide-react";
import { ILead, PropertyInterest, LeadSource } from "@/types";
import { api } from "@/lib/apiClient";
import { useAgents } from "@/hooks/useLeads";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES: PropertyInterest[] = [
  "Residential Plot","Commercial Plot","House","Apartment",
  "Farm House","Shop","Office","Warehouse","Duplex","Penthouse","Commercial Building",
];
const LEAD_SOURCES: LeadSource[] = [
  "Facebook Ads","Walk-in","Website Inquiry","Referral","Phone Call","Other",
];
const STATUSES = ["new","contacted","qualified","negotiation","closed","lost"] as const;

interface LeadFormProps {
  lead?:    ILead | null;
  onClose:  () => void;
  onSaved:  () => void;
}

export default function LeadForm({ lead, onClose, onSaved }: LeadFormProps) {
  const { user }   = useAuth();
  const { agents } = useAgents();
  const isEdit     = !!lead;

  const [form, setForm] = useState({
    name:             lead?.name             ?? "",
    email:            lead?.email            ?? "",
    phone:            lead?.phone            ?? "",
    propertyInterest: lead?.propertyInterest ?? "Residential Plot",
    source:           (lead?.source ?? "Other") as LeadSource,
    budget:           lead?.budget           ?? "",
    status:           lead?.status           ?? "new",
    notes:            lead?.notes            ?? "",
    assignedTo:       typeof lead?.assignedTo === "object"
                        ? (lead?.assignedTo as { _id: string })?._id ?? ""
                        : lead?.assignedTo ?? "",
    followUpDate:     lead?.followUpDate
                        ? new Date(lead.followUpDate).toISOString().split("T")[0]
                        : "",
  });

  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [agentSearch,  setAgentSearch]  = useState(() => {
    if (typeof lead?.assignedTo === "object" && lead?.assignedTo) {
      return (lead.assignedTo as { name: string }).name;
    }
    return "";
  });
  const [agentOpen,    setAgentOpen]    = useState(false);
  const agentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (agentRef.current && !agentRef.current.contains(e.target as Node)) {
        setAgentOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        budget:      Number(form.budget),
        assignedTo:  form.assignedTo || null,
        followUpDate: form.followUpDate || null,
      };

      if (isEdit) {
        await api.put(`/api/leads/${lead!._id}`, payload);
      } else {
        await api.post("/api/leads", payload);
      }

      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save lead");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-sm rounded-t-2xl z-10">
          <h2 className="text-base font-bold text-slate-100">
            {isEdit ? "Edit Lead" : "Add New Lead"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Client Name" colSpan={2}>
              <input className="input-base" placeholder="Ali Hassan" value={form.name}
                onChange={(e) => update("name", e.target.value)} required />
            </Field>

            <Field label="Email">
              <input className="input-base" type="email" placeholder="email@example.com"
                value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </Field>

            <Field label="Phone">
              <input className="input-base" placeholder="0321-1234567" value={form.phone}
                onChange={(e) => update("phone", e.target.value)} required />
            </Field>

            <Field label="Property Interest">
              <select className="input-base" value={form.propertyInterest}
                onChange={(e) => update("propertyInterest", e.target.value)}>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Lead Source">
              <select className="input-base" value={form.source}
                onChange={(e) => update("source", e.target.value)}>
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field label="Budget (PKR)">
              <input className="input-base" type="number" min={0} placeholder="5000000"
                value={form.budget} onChange={(e) => update("budget", e.target.value)} required />
            </Field>

            <Field label="Status">
              <select className="input-base" value={form.status}
                onChange={(e) => update("status", e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </Field>

            {/* Follow-up date — available to all users */}
            <Field label="Follow-up Date" colSpan={2}>
              <input className="input-base" type="date" value={form.followUpDate}
                onChange={(e) => update("followUpDate", e.target.value)} />
            </Field>

            {/* Assign agent — admin only, searchable combobox */}
            {user?.role === "admin" && (
              <Field label="Assign Agent" colSpan={2}>
                <div ref={agentRef} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    className="input-base pl-9 pr-8"
                    placeholder="Search agent by name…"
                    value={agentSearch}
                    onChange={(e) => {
                      setAgentSearch(e.target.value);
                      setAgentOpen(true);
                      if (!e.target.value) update("assignedTo", "");
                    }}
                    onFocus={() => setAgentOpen(true)}
                    autoComplete="off"
                  />
                  {form.assignedTo && (
                    <UserCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
                  )}
                  {agentOpen && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                      {/* Unassign option */}
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { update("assignedTo", ""); setAgentSearch(""); setAgentOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-800/60 transition-colors border-b border-slate-800"
                      >
                        — Unassigned —
                      </button>
                      {agents
                        .filter((a) => a.name.toLowerCase().includes(agentSearch.toLowerCase()))
                        .map((a) => (
                          <button
                            key={a._id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              update("assignedTo", a._id);
                              setAgentSearch(a.name);
                              setAgentOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2",
                              form.assignedTo === a._id
                                ? "bg-yellow-400/10 text-yellow-400"
                                : "text-slate-300 hover:bg-slate-800/60"
                            )}
                          >
                            <span className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                              {a.name[0].toUpperCase()}
                            </span>
                            {a.name}
                            {form.assignedTo === a._id && (
                              <UserCheck className="w-3.5 h-3.5 ml-auto text-emerald-400" />
                            )}
                          </button>
                        ))
                      }
                      {agents.filter((a) => a.name.toLowerCase().includes(agentSearch.toLowerCase())).length === 0 && (
                        <p className="px-4 py-3 text-sm text-slate-500">No agents found</p>
                      )}
                    </div>
                  )}
                </div>
              </Field>
            )}

            <Field label="Notes" colSpan={2}>
              <textarea className="input-base resize-none" rows={3}
                placeholder="Additional notes about this lead…"
                value={form.notes} onChange={(e) => update("notes", e.target.value)} />
            </Field>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={cn("flex-1 btn-gold flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm")}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, colSpan }: {
  label:     string;
  children:  React.ReactNode;
  colSpan?:  number;
}) {
  return (
    <div className={cn(colSpan === 2 && "col-span-2")}>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
