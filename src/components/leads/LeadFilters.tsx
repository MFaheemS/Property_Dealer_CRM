"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FiltersState {
  search:   string;
  status:   string;
  priority: string;
}

interface LeadFiltersProps {
  filters:   FiltersState;
  onChange:  (f: FiltersState) => void;
}

const STATUSES  = ["","new","contacted","qualified","negotiation","closed","lost"] as const;
const PRIORITIES = ["","high","medium","low"] as const;

const STATUS_LABELS: Record<string, string> = {
  "": "All Status", new: "New", contacted: "Contacted",
  qualified: "Qualified", negotiation: "Negotiation",
  closed: "Closed", lost: "Lost",
};

const PRIORITY_LABELS: Record<string, string> = {
  "": "All Priority", high: "High", medium: "Medium", low: "Low",
};

export default function LeadFilters({ filters, onChange }: LeadFiltersProps) {
  function set(field: keyof FiltersState, value: string) {
    onChange({ ...filters, [field]: value });
  }

  const hasActiveFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          className="input-base pl-9 text-sm h-9"
          placeholder="Search name, email, phone…"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
        />
      </div>

      {/* Status filter */}
      <select
        className={cn(
          "input-base text-sm h-9 w-auto min-w-[140px]",
          filters.status && "border-yellow-400/40 text-yellow-400"
        )}
        value={filters.status}
        onChange={(e) => set("status", e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      {/* Priority filter */}
      <select
        className={cn(
          "input-base text-sm h-9 w-auto min-w-[140px]",
          filters.priority && "border-yellow-400/40 text-yellow-400"
        )}
        value={filters.priority}
        onChange={(e) => set("priority", e.target.value)}
      >
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
        ))}
      </select>

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ search: "", status: "", priority: "" })}
          className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-slate-700 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
