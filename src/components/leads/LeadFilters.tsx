"use client";

import { Search, X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FiltersState {
  search:   string;
  status:   string;
  priority: string;
  dateFrom: string;
  dateTo:   string;
}

interface LeadFiltersProps {
  filters:  FiltersState;
  onChange: (f: FiltersState) => void;
}

const STATUSES = [
  { value: "",            label: "All Status"   },
  { value: "new",         label: "New"          },
  { value: "contacted",   label: "Contacted"    },
  { value: "qualified",   label: "Qualified"    },
  { value: "negotiation", label: "Negotiation"  },
  { value: "closed",      label: "Closed"       },
  { value: "lost",        label: "Lost"         },
];

const PRIORITIES = [
  { value: "",       label: "All Priority" },
  { value: "high",   label: "High"         },
  { value: "medium", label: "Medium"       },
  { value: "low",    label: "Low"          },
];

export default function LeadFilters({ filters, onChange }: LeadFiltersProps) {
  function set(field: keyof FiltersState, value: string) {
    onChange({ ...filters, [field]: value });
  }

  const hasActive =
    filters.status || filters.priority || filters.search ||
    filters.dateFrom || filters.dateTo;

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      {/* Row 1: search + status + priority + clear */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            className="input-base pl-9 text-sm h-9"
            placeholder="Search name, email, phone…"
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
          />
        </div>

        <select
          className={cn("input-base text-sm h-9 w-auto min-w-[140px]", filters.status   && "border-yellow-400/40 text-yellow-400")}
          value={filters.status}
          onChange={(e) => set("status", e.target.value)}
        >
          {STATUSES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>

        <select
          className={cn("input-base text-sm h-9 w-auto min-w-[140px]", filters.priority && "border-yellow-400/40 text-yellow-400")}
          value={filters.priority}
          onChange={(e) => set("priority", e.target.value)}
        >
          {PRIORITIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>

        {hasActive && (
          <button
            onClick={() => onChange({ search: "", status: "", priority: "", dateFrom: "", dateTo: "" })}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* Row 2: date range */}
      <div className="flex flex-wrap gap-3 items-center">
        <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
        <span className="text-xs text-slate-500">Date range:</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">From</span>
          <input
            type="date"
            className={cn("input-base text-sm h-9 w-auto", filters.dateFrom && "border-yellow-400/40 text-yellow-400")}
            value={filters.dateFrom}
            onChange={(e) => set("dateFrom", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">To</span>
          <input
            type="date"
            className={cn("input-base text-sm h-9 w-auto", filters.dateTo && "border-yellow-400/40 text-yellow-400")}
            value={filters.dateTo}
            onChange={(e) => set("dateTo", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
