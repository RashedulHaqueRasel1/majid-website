import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMySoldProducts,
  createSoldProduct,
  deleteSoldProduct,
} from "../api/sold-product.api";
import { CreateSoldProductInput } from "../types";

export const useMySoldProducts = () => {
  return useQuery({
    queryKey: ["sold-products"],
    queryFn: getMySoldProducts,
  });
};

export const useCreateSoldProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSoldProductInput) => createSoldProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sold-products"] });
    },
  });
};

export const useDeleteSoldProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSoldProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sold-products"] });
    },
  });
};
