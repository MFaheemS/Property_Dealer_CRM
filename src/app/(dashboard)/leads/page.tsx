"use client";

import { useState } from "react";
import { Plus, LayoutGrid, List, Download } from "lucide-react";
import { ILead } from "@/types";
import { useLeads } from "@/hooks/useLeads";
import { useAuth }  from "@/hooks/useAuth";
import { useToast } from "@/components/shared/Toast";
import LeadCard    from "@/components/leads/LeadCard";
import LeadFilters from "@/components/leads/LeadFilters";
import LeadForm    from "@/components/leads/LeadForm";
import { api }     from "@/lib/apiClient";
import { cn }      from "@/lib/utils";

export default function LeadsPage() {
  const { user }  = useAuth();
  const { toast } = useToast();

  const [filters, setFilters] = useState({ search: "", status: "", priority: "", dateFrom: "", dateTo: "" });
  const [view,    setView]    = useState<"grid" | "list">("grid");
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState<ILead | null>(null);

  const { data, loading, error, refetch } = useLeads(filters);

  function openCreate() { setEditLead(null); setShowForm(true); }
  function openEdit(lead: ILead) { setEditLead(lead); setShowForm(true); }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    try {
      await api.delete(`/api/leads/${id}`);
      toast("Lead deleted", "success");
      refetch();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Delete failed", "error");
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Leads</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {data ? `${data.total} lead${data.total !== 1 ? "s" : ""} found` : "Loading…"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-slate-700 overflow-hidden">
            {(["grid","list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "p-2 transition-colors",
                  view === v
                    ? "bg-yellow-400/10 text-yellow-400"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {v === "grid" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </button>
            ))}
          </div>

          <a
            href="/api/export"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-sm transition-colors"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </a>

          <button
            onClick={openCreate}
            className="btn-gold flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <LeadFilters filters={filters} onChange={setFilters} />

      {/* States */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-56 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="glass rounded-2xl p-6 text-center text-red-400">{error}</div>
      )}

      {!loading && !error && data?.leads.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">🏠</p>
          <p className="text-slate-300 font-medium">No leads found</p>
          <p className="text-slate-500 text-sm mt-1">
            {filters.search || filters.status || filters.priority
              ? "Try adjusting your filters"
              : "Add your first lead to get started"}
          </p>
          <button onClick={openCreate} className="btn-gold mt-4 px-5 py-2 text-sm">
            Add Lead
          </button>
        </div>
      )}

      {/* Grid / List view */}
      {!loading && data && data.leads.length > 0 && (
        <>
          {view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.leads.map((lead) => (
                <LeadCard
                  key={lead._id}
                  lead={lead}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isAdmin={user?.role === "admin"}
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800/60">
                    {["Client","Property","Budget","Priority","Status","Agent",""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {data.leads.map((lead) => {
                    const agent = typeof lead.assignedTo === "object"
                      ? (lead.assignedTo as { name: string })?.name
                      : "—";
                    return (
                      <tr key={lead._id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-200">{lead.name}</td>
                        <td className="px-4 py-3 text-slate-400">{lead.propertyInterest}</td>
                        <td className="px-4 py-3 text-yellow-400 font-semibold">
                          {(lead.budget / 1_000_000).toFixed(1)}M
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            lead.priority === "high"   ? "bg-red-400/10 text-red-400" :
                            lead.priority === "medium" ? "bg-amber-400/10 text-amber-400" :
                                                         "bg-emerald-400/10 text-emerald-400"
                          }`}>
                            {lead.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{agent}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openEdit(lead)}
                            className="text-yellow-400 hover:text-yellow-300 text-xs font-medium transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: data.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFilters((f) => ({ ...f }))}
                  className={cn(
                    "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                    data.page === i + 1
                      ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Form modal */}
      {showForm && (
        <LeadForm
          lead={editLead}
          onClose={() => { setShowForm(false); setEditLead(null); }}
          onSaved={() => { toast(editLead ? "Lead updated" : "Lead created", "success"); refetch(); }}
        />
      )}
    </div>
  );
}
