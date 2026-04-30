import { api } from "@/lib/api";
import type { CreateSoldProductInput, SoldProductListResponse } from "../types";

const BASE = "/sold-products";

export const getMySoldProducts = async (): Promise<SoldProductListResponse> => {
  const response = await api.get(`${BASE}/my-products`);
  return response.data;
};

export const createSoldProduct = async (input: CreateSoldProductInput) => {
  const formData = new FormData();
  formData.append("name", input.name);
  formData.append("imeiNumber", input.imeiNumber);
  formData.append("model", input.model);
  formData.append("quantity", String(input.quantity));
  formData.append("purchasePrice", String(input.purchasePrice));
  formData.append("expectedPrice", String(input.expectedPrice));
  formData.append("paidAmount", String(input.paidAmount));
  formData.append("remainingDue", String(input.remainingDue));
  formData.append("dueDate", input.dueDate);

  if (input.image instanceof File) {
    formData.append("image", input.image);
  }

  const response = await api.post(`${BASE}/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteSoldProduct = async (id: string) => {
  const response = await api.delete(`${BASE}/delete/${id}`);
  return response.data;
};
