"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { ILead } from "@/types";
import { api }   from "@/lib/apiClient";
import { cn }    from "@/lib/utils";

interface Suggestion {
  action:  string;
  message: string;
  urgency: "high" | "medium" | "low";
}

const URGENCY_STYLES = {
  high:   "border-red-400/30 bg-red-400/5",
  medium: "border-amber-400/30 bg-amber-400/5",
  low:    "border-emerald-400/30 bg-emerald-400/5",
};

const URGENCY_ICON = {
  high:   <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />,
  medium: <Info          className="w-4 h-4 text-amber-400 flex-shrink-0" />,
  low:    <CheckCircle2  className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
};

export default function AISuggest({ lead }: { lead: ILead }) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading,    setLoading]    = useState(false);

  async function getSuggestion() {
    setLoading(true);
    try {
      const daysSinceCreated = Math.floor(
        (Date.now() - new Date(lead.createdAt).getTime()) / 86_400_000
      );
      const res = await api.post<{ data: Suggestion }>("/api/ai-suggest", {
        name:             lead.name,
        status:           lead.status,
        priority:         lead.priority,
        propertyInterest: lead.propertyInterest,
        budget:           lead.budget,
        daysSinceCreated,
      });
      setSuggestion(res.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={getSuggestion}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-yellow-400/20 bg-yellow-400/5 text-yellow-400 text-sm font-medium hover:bg-yellow-400/10 transition-colors"
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Sparkles className="w-4 h-4" />
        }
        {loading ? "Generating…" : "AI Follow-up Suggestion"}
      </button>

      {suggestion && (
        <div className={cn("rounded-xl p-4 border space-y-2", URGENCY_STYLES[suggestion.urgency])}>
          <div className="flex items-center gap-2">
            {URGENCY_ICON[suggestion.urgency]}
            <span className="text-sm font-semibold text-slate-200">{suggestion.action}</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{suggestion.message}</p>
        </div>
      )}
    </div>
  );
}
