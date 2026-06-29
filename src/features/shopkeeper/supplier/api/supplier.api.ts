import { api } from "@/lib/api";
import type {
  SupplierInput,
  SupplierListParams,
  SupplierListResponse,
  SupplierSingleResponse,
} from "../types";

const BASE = "/suppliers";

export const getSuppliers = async (
  params: SupplierListParams = {},
): Promise<SupplierListResponse> => {
  const response = await api.get(BASE, { params });
  return response.data;
};

export const getSupplier = async (
  id: string,
): Promise<SupplierSingleResponse> => {
  const response = await api.get(`${BASE}/${id}`);
  return response.data;
};

export const createSupplier = async (
  input: SupplierInput,
): Promise<SupplierSingleResponse> => {
  const response = await api.post(`${BASE}/create`, input);
  return response.data;
};

export const updateSupplier = async ({
  id,
  input,
}: {
  id: string;
  input: Partial<SupplierInput>;
}): Promise<SupplierSingleResponse> => {
  const response = await api.patch(`${BASE}/${id}`, input);
  return response.data;
};

export const deleteSupplier = async (id: string) => {
  const response = await api.delete(`${BASE}/${id}`);
  return response.data;
};
