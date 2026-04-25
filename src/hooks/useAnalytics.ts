"use client";

import { useState, useEffect } from "react";
import { AnalyticsSummary } from "@/types";
import { api } from "@/lib/apiClient";

export function useAnalytics() {
  const [data,    setData]    = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    api.get<{ data: AnalyticsSummary }>("/api/analytics")
      .then((res) => setData(res.data))
      .catch((e)  => setError(e.message))
      .finally(()  => setLoading(false));
  }, []);

  return { data, loading, error };
}
