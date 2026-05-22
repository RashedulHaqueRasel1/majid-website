import { api } from "@/lib/api";
import { CustomersResponse } from "../types";

export const createInvoiceUser = async (input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  shopkeeperId: string;
  paymentType?: string;
  alreadyPaid?: number;
  customerId?: string;
}) => {
  const response = await api.post(`/customer/create`, input, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

export const getMyInvoiceUser = async (
  id: string,
): Promise<CustomersResponse> => {
  const response = await api.get(`/customer/shopkeeper/${id}`);
  return response.data;
};
