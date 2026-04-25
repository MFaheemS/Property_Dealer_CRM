"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Mail, MessageCircle, Pencil } from "lucide-react";
import { ILead, IUser } from "@/types";
import { api } from "@/lib/apiClient";
import { formatPKR, whatsappUrl, avatarUrl, STATUS_LABELS } from "@/lib/utils";
import PriorityBadge from "@/components/shared/PriorityBadge";
import StatusPill    from "@/components/shared/StatusPill";
import LeadForm      from "@/components/leads/LeadForm";
import { useToast }  from "@/components/shared/Toast";
import Image from "next/image";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }    = use(params);
  const router    = useRouter();
  const { toast } = useToast();

  const [lead,     setLead]     = useState<ILead | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  async function fetchLead() {
    try {
      const res = await api.get<{ data: ILead }>(`/api/leads/${id}`);
      setLead(res.data);
    } catch {
      toast("Lead not found", "error");
      router.push("/leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchLead(); }, [id]); // eslint-disable-line

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass rounded-2xl h-32 animate-pulse" />
        <div className="glass rounded-2xl h-48 animate-pulse" />
      </div>
    );
  }

  if (!lead) return null;

  const agent = typeof lead.assignedTo === "object" ? lead.assignedTo as IUser : null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back */}
      <button
        onClick={() => router.push("/leads")}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leads
      </button>

      {/* Hero card */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">{lead.name}</h2>
            <p className="text-slate-400 mt-1">🏠 {lead.propertyInterest}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <PriorityBadge priority={lead.priority} />
            <StatusPill    status={lead.status} />
          </div>
        </div>

        {/* Budget */}
        <div className="mt-5 p-4 rounded-xl bg-slate-900/60 border border-yellow-400/10">
          <p className="text-xs text-slate-500 mb-1">Budget</p>
          <p className="text-3xl font-bold text-gold-gradient">{formatPKR(lead.budget)}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full"
                style={{ width: `${lead.score}%` }}
              />
            </div>
            <span className="text-sm text-slate-400">Score: {lead.score}/100</span>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href={`tel:${lead.phone}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors">
            <Phone className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-300">{lead.phone}</span>
          </a>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <Mail className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-300 truncate">{lead.email}</span>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <a
          href={whatsappUrl(lead.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Chat on WhatsApp
        </a>
      </div>

      {/* Details */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Lead Details</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <Detail label="Status"      value={STATUS_LABELS[lead.status]} />
          <Detail label="Priority"    value={lead.priority} capitalize />
          <Detail label="Created"     value={new Date(lead.createdAt).toLocaleDateString("en-PK")} />
          <Detail label="Updated"     value={new Date(lead.updatedAt).toLocaleDateString("en-PK")} />
          {lead.followUpDate && (
            <Detail label="Follow-up" value={new Date(lead.followUpDate).toLocaleDateString("en-PK")} />
          )}
        </div>

        {lead.notes && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Notes</p>
            <p className="text-sm text-slate-300 bg-slate-900/40 rounded-xl p-3 border border-slate-800">
              {lead.notes}
            </p>
          </div>
        )}
      </div>

      {/* Assigned agent */}
      {agent && (
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <Image
            src={agent.avatar ?? avatarUrl(agent.name)}
            alt={agent.name}
            width={48}
            height={48}
            className="rounded-xl border border-slate-700 flex-shrink-0"
          />
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Assigned Agent</p>
            <p className="text-sm font-semibold text-slate-200">{agent.name}</p>
            <p className="text-xs text-slate-500">{agent.email}</p>
          </div>
        </div>
      )}

      {/* Edit button */}
      <button
        onClick={() => setShowEdit(true)}
        className="btn-gold w-full flex items-center justify-center gap-2 py-2.5 text-sm"
      >
        <Pencil className="w-4 h-4" />
        Edit Lead
      </button>

      {showEdit && (
        <LeadForm
          lead={lead}
          onClose={() => setShowEdit(false)}
          onSaved={() => { fetchLead(); toast("Lead updated", "success"); }}
        />
      )}
    </div>
  );
}

function Detail({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className={`text-sm font-medium text-slate-200 ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}
