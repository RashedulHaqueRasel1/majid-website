import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  createFromBarcode,
  createFromBarcodeBulk,
  createInvoice,
  getMyInvoiceHistory,
  createCustomer,
  getCustomersByShopkeeper,
  getShopkeeperCart,
  deleteCartItem,
  deleteAllShopkeeperCartItems,
} from "../api/inventory.api";
import type {
  CreateInventoryInput,
  UpdateInventoryInput,
  CreateFromBarcodeBulkInput,
  InvoiceHistoryResponse,
  CartListResponse,
} from "../types";

export const INVENTORY_KEYS = {
  all: ["inventory"] as const,
  myInventory: () => [...INVENTORY_KEYS.all, "my-inventory"] as const,
  shopkeeperCart: (shopkeeperId: string) =>
    [...INVENTORY_KEYS.all, "shopkeeper-cart", shopkeeperId] as const,
};

export function useMyInventory() {
  return useQuery({
    queryKey: INVENTORY_KEYS.myInventory(),
    queryFn: getMyInventory,
  });
}

export function useCreateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInventoryInput) => createInventory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateInventoryInput }) =>
      updateInventory({ id, input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useDeleteInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInventory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useCreateFromBarcode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      code: string;
      userId: string;
      imeiNumber?: string;
      purchasePrice?: number;
      currentState?: string;
      image?: File;
    }) => createFromBarcode(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}
export const useCreateFromBarcodeBulk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFromBarcodeBulkInput) =>
      createFromBarcodeBulk(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
};

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      shopkeeperId: string;
      type: string;
      invoice: File;
      customerInfo?: string;
      itemsIds?: string[];
    }) => createInvoice(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useMyInvoiceHistory(id: string) {
  return useQuery<InvoiceHistoryResponse>({
    queryKey: [...INVENTORY_KEYS.myInventory(), id],

    queryFn: () => getMyInvoiceHistory(id),

    enabled: !!id,
  });
}

export function useCreateCustomer() {
  return useMutation({
    mutationFn: (input: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      shopkeeperId: string;
      salesMethod?: string;
      actualSalePrice?: number;
    }) => createCustomer(input),
  });
}

export function useCustomersByShopkeeper(shopkeeperId: string) {
  return useQuery({
    queryKey: ["customers", shopkeeperId],
    queryFn: () => getCustomersByShopkeeper(shopkeeperId),
    enabled: !!shopkeeperId,
  });
}

export function useShopkeeperCart(shopkeeperId?: string) {
  return useQuery<CartListResponse>({
    queryKey: INVENTORY_KEYS.shopkeeperCart(shopkeeperId || ""),
    queryFn: () => getShopkeeperCart(shopkeeperId || ""),
    enabled: !!shopkeeperId,
  });
}

export function useDeleteCartItem(shopkeeperId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartId: string) => deleteCartItem(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.shopkeeperCart(shopkeeperId || ""),
      });
    },
  });
}

export function useDeleteAllShopkeeperCartItems(shopkeeperId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAllShopkeeperCartItems(shopkeeperId || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.shopkeeperCart(shopkeeperId || ""),
      });
    },
  });
}
