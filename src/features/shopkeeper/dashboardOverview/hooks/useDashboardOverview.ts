"use client";

import { useEffect, useState } from "react";
import { getShopkeeperDashboardOverview } from "../api/dashboard.api";
import { DashboardOverviewResponse } from "../types/dashboard.types";

export function useDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getShopkeeperDashboardOverview();
      setData(result);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch dashboard overview";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return { data, loading, error, refetch: fetchOverview };
}
