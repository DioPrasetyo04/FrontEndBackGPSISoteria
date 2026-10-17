import { routeGlobalInstance } from "@/lib/config_backend";
import type { BaseResponse } from "@/types/BaseResponse";
import type { DashboardStats } from "./types/dashboard";

export const getDashboardStats = async (): Promise<
  BaseResponse<DashboardStats>
> => {
  const response = await routeGlobalInstance.get("/dashboard/stats");
  return response.data;
};
