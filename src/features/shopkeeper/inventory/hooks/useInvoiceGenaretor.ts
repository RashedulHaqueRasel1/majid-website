import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInvoiceUser, getMyInvoiceUser } from "../api/invoiceGenaretor";
import { INVENTORY_KEYS } from "./useInventory";

export function useCreateInvoiceUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      shopkeeperId: string;
      paymentType?: string;
      alreadyPaid?: number;
      customerId?: string;
    }) => createInvoiceUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useMyInvoiceGet(id: string) {
  return useQuery({
    queryKey: ["my-invoice", id],
    queryFn: () => getMyInvoiceUser(id),
  });
}
