import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  getSuppliers,
  updateSupplier,
} from "../api/supplier.api";
import type { SupplierInput, SupplierListParams } from "../types";

export const SUPPLIER_KEYS = {
  all: ["suppliers"] as const,
  list: (params: SupplierListParams) =>
    [...SUPPLIER_KEYS.all, "list", params] as const,
  detail: (id: string) => [...SUPPLIER_KEYS.all, "detail", id] as const,
};

export function useSuppliers(params: SupplierListParams = {}) {
  return useQuery({
    queryKey: SUPPLIER_KEYS.list(params),
    queryFn: () => getSuppliers(params),
  });
}

export function useSupplier(id?: string) {
  return useQuery({
    queryKey: SUPPLIER_KEYS.detail(id || ""),
    queryFn: () => getSupplier(id || ""),
    enabled: Boolean(id),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SupplierInput) => createSupplier(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_KEYS.all });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<SupplierInput>;
    }) => updateSupplier({ id, input }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: SUPPLIER_KEYS.detail(variables.id),
      });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_KEYS.all });
    },
  });
}
