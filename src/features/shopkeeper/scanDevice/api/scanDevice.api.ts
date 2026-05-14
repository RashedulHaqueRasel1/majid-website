// src/features/shopkeeper/scanDevice/api/scanDevice.api.ts

import axiosInstance from "@/lib/instance/axios-instance";
import { ApiResponse } from "@/features/auth/types/auth.types";
import {
  BatchImeiResponse,
  IMEICheckApiResponse,
  ServiceListResponse,
  FavouriteIMEIResponse,
} from "../types/scanDevice.types";

export const checkIMEIApi = async (
  imei: string | string[],
  serviceId: number = 6,
): Promise<IMEICheckApiResponse> => {
  const payload = Array.isArray(imei)
    ? { imei, serviceId }
    : { imei, serviceId };

  console.log("📤 API Payload:", payload);

  const response = await axiosInstance.post("/imei/check", payload);
  return response.data;
};

// নতুন API for favourite services (v2)
export const checkFavouriteIMEIApi = async (
  imei: string,
  serviceId: number,
): Promise<FavouriteIMEIResponse> => {
  const payload = { imei, serviceId };
  console.log("⭐ Favourite API Payload:", payload);

  const response = await axiosInstance.post("/imei/check-v2", payload);
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
