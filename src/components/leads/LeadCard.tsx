"use client";

import { ILead, IUser } from "@/types";
import { formatPKR, timeAgo, whatsappUrl, avatarUrl } from "@/lib/utils";
import PriorityBadge from "@/components/shared/PriorityBadge";
import StatusPill    from "@/components/shared/StatusPill";
import { Phone, Mail, Home, Calendar, MessageCircle, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface LeadCardProps {
  lead:       ILead;
  onEdit:     (lead: ILead) => void;
  onDelete:   (id: string) => void;
  isAdmin:    boolean;
}

const PROPERTY_ICONS: Record<string, string> = {
  "Residential Plot": "🏘️",
  "Commercial Plot":  "🏢",
  "House":            "🏠",
  "Apartment":        "🏙️",
  "Farm House":       "🌿",
  "Shop":             "🛍️",
  "Office":           "💼",
};

export default function LeadCard({ lead, onEdit, onDelete, isAdmin }: LeadCardProps) {
  const agent = typeof lead.assignedTo === "object" ? lead.assignedTo as IUser : null;

  return (
    <div className="glass rounded-2xl p-5 card-hover flex flex-col gap-4 group">
      {/* Top row — name + badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/leads/${lead._id}`}
            className="text-base font-bold text-slate-100 hover:text-yellow-400 transition-colors line-clamp-1"
          >
            {lead.name}
          </Link>
          <p className="text-sm text-slate-500 mt-0.5">
            {PROPERTY_ICONS[lead.propertyInterest] ?? "🏠"} {lead.propertyInterest}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <PriorityBadge priority={lead.priority} />
          <StatusPill    status={lead.status} />
        </div>
      </div>

      {/* Budget — hero element */}
      <div className="bg-slate-900/60 rounded-xl px-4 py-3 border border-yellow-400/10">
        <p className="text-xs text-slate-500 mb-0.5">Budget</p>
        <p className="text-xl font-bold text-gold-gradient">{formatPKR(lead.budget)}</p>
        {/* Score bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400"
              style={{ width: `${lead.score}%` }}
            />
          </div>
          <span className="text-xs text-slate-500">Score {lead.score}</span>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
          <a
            href={`tel:${lead.phone}`}
            className="hover:text-slate-200 transition-colors truncate"
          >
            {lead.phone}
          </a>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{lead.email}</span>
        </div>
        {lead.followUpDate && (
          <div className="flex items-center gap-2 text-amber-400">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs">
              Follow-up: {new Date(lead.followUpDate).toLocaleDateString("en-PK")}
            </span>
          </div>
        )}
      </div>

      {/* Footer — agent + actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
        {/* Assigned agent */}
        <div className="flex items-center gap-2">
          {agent ? (
            <>
              <Image
                src={agent.avatar ?? avatarUrl(agent.name)}
                alt={agent.name}
                width={24}
                height={24}
                className="rounded-lg border border-slate-700"
              />
              <span className="text-xs text-slate-500 truncate max-w-[100px]">{agent.name}</span>
            </>
          ) : (
            <span className="text-xs text-slate-600 italic">Unassigned</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* WhatsApp */}
          <a
            href={whatsappUrl(lead.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors"
            title="WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => onEdit(lead)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {isAdmin && (
            <button
              onClick={() => onDelete(lead._id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Time */}
      <p className="text-[11px] text-slate-700 -mt-2">{timeAgo(lead.createdAt)}</p>
    </div>
  );
}
