import { useQuery, useMutation } from "@tanstack/react-query";
import { getMyPayments, createPaymentSession } from "../api/payments.api";

export function useMyPayments() {
  return useQuery({
    queryKey: ["my-payments"],
    queryFn: getMyPayments,
  });
}

export function useCreatePaymentSession() {
  return useMutation({
    mutationFn: createPaymentSession,
  });
}
