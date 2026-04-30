import { api } from "@/lib/api";
import type {
  CreateInventoryInput,
  UpdateInventoryInput,
  InventoryListResponse,
} from "../types";

const BASE = "/inventory";

export const getMyInventory = async (): Promise<InventoryListResponse> => {
  const response = await api.get(`${BASE}/my-inventory`);
  return response.data;
};

export const createInventory = async (input: CreateInventoryInput) => {
  const formData = new FormData();
  formData.append("itemName", input.itemName);
  if (input.imeiNumber) formData.append("imeiNumber", input.imeiNumber);
  if (input.purchasePrice !== undefined)
    formData.append("purchasePrice", String(input.purchasePrice));
  formData.append("expectedPrice", String(input.expectedPrice));
  formData.append("currentState", input.currentState);
  if (input.image instanceof File) {
    formData.append("image", input.image);
  }

  const response = await api.post(`${BASE}/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateInventory = async ({
  id,
  input,
}: {
  id: string;
  input: UpdateInventoryInput;
}) => {
  const formData = new FormData();
  if (input.itemName) formData.append("itemName", input.itemName);
  if (input.expectedPrice !== undefined)
    formData.append("expectedPrice", String(input.expectedPrice));
  if (input.currentState) formData.append("currentState", input.currentState);
  if (input.image instanceof File) {
    formData.append("image", input.image);
  }

  const response = await api.put(`${BASE}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteInventory = async (id: string) => {
  const response = await api.delete(`${BASE}/${id}`);
  return response.data;
};
