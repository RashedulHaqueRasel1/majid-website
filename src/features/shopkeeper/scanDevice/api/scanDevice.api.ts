// src/features/shopkeeper/scanDevice/api/scanDevice.api.ts

import axiosInstance from "@/lib/instance/axios-instance";
import { ApiResponse } from "@/features/auth/types/auth.types";
import {
  BatchImeiResponse,
  IMEIResult,
  ServiceListResponse,
} from "../types/scanDevice.types";

export const checkIMEIApi = async (
  imei: string,
  serviceId: number = 6,
): Promise<ApiResponse<IMEIResult>> => {
  const response = await axiosInstance.post("/imei/check", { imei, serviceId });
  return response.data;
};

export const checkImeiBatchApi = async (
  file: File,
  serviceId: number = 6,
): Promise<BatchImeiResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("serviceId", String(serviceId));

  const response = await axiosInstance.post("/imei/check-batch", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getServicesApi = async (): Promise<
  ApiResponse<ServiceListResponse["data"]>
> => {
  const response = await axiosInstance.get("/imei/services");
  return response.data;
};
