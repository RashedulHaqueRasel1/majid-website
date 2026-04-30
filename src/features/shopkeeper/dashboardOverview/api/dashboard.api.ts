import { api } from "@/lib/api";
import { DashboardOverviewResponse } from "../types/dashboard.types";

export const getShopkeeperDashboardOverview =
  async (): Promise<DashboardOverviewResponse> => {
    const response = await api.get("/dashboard/shopkeeper-overview");
    return response.data.data;
  };
