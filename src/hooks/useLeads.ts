"use client";

import { useState, useEffect, useCallback } from "react";
import { ILead } from "@/types";
import { api } from "@/lib/apiClient";

interface LeadFilters {
  status?:   string;
  priority?: string;
  search?:   string;
  page?:     number;
}

interface LeadsResponse {
  leads: ILead[];
  total: number;
  page:  number;
  pages: number;
}

export function useLeads(filters: LeadFilters = {}) {
  const [data,    setData]    = useState<LeadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.status)   params.set("status",   filters.status);
      if (filters.priority) params.set("priority", filters.priority);
      if (filters.search)   params.set("search",   filters.search);
      if (filters.page)     params.set("page",     String(filters.page));

      const res = await api.get<{ data: LeadsResponse }>(`/api/leads?${params}`);
      setData(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.priority, filters.search, filters.page]); // eslint-disable-line

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  return { data, loading, error, refetch: fetchLeads };
}

export function useAgents() {
  const [agents,  setAgents]  = useState<{ _id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: typeof agents }>("/api/agents")
      .then((res) => setAgents(res.data))
      .catch(() => setAgents([]))
      .finally(() => setLoading(false));
  }, []);

  return { agents, loading };
}
