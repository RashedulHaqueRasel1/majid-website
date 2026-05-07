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

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === "") continue;

    if (key === "image" && value instanceof File) {
      formData.append(key, value);
      continue;
    }

    if (key !== "image") {
      formData.append(key, String(value));
    }
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

export const createFromBarcode = async (input: {
  code: string;
  userId: string;
}) => {
  const response = await api.post(`${BASE}/create-from-barcode`, input);
  return response.data;
};

export const createFromBarcodeBulk = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `${BASE}/create-from-barcode/bulk`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};
