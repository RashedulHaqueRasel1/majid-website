// src/features/shoopkeeper/scanDevice/api/scanDevice.api.ts

import axiosInstance from "@/lib/instance/axios-instance";
import { ApiResponse } from "@/features/auth/types/auth.types";
import { IMEIResult } from "../types/scanDevice.types";

export const checkIMEIApi = async (
  imei: string,
  serviceId: number = 6,
): Promise<ApiResponse<IMEIResult>> => {
  const response = await axiosInstance.post("/imei/check", { imei, serviceId });
  return response.data;
};
