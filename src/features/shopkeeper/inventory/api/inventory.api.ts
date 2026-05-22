import { api } from "@/lib/api";
import type {
  CreateInventoryInput,
  UpdateInventoryInput,
  InventoryListResponse,
  CreateFromBarcodeBulkInput,
  InvoiceHistoryResponse,
  CartListResponse,
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
  imeiNumber?: string;
  purchasePrice?: number;
  currentState?: string;
  image?: File;
}) => {
  const formData = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (key === "image" && value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const response = await api.post(`${BASE}/create-from-barcode`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const createFromBarcodeBulk = async (
  input: CreateFromBarcodeBulkInput,
) => {
  const formData = new FormData();
  formData.append("userId", input.userId);
  input.barcodes.forEach((barcode, index) => {
    formData.append(`barcodes[${index}][code]`, barcode.code);
    formData.append(
      `barcodes[${index}][purchasePrice]`,
      String(barcode.purchasePrice),
    );
    formData.append(
      `barcodes[${index}][expectedPrice]`,
      String(barcode.expectedPrice),
    );
    if (barcode.supplierId)
      formData.append(`barcodes[${index}][supplierId]`, barcode.supplierId);
    formData.append(`barcodes[${index}][quantity]`, String(barcode.quantity));
    formData.append(`barcodes[${index}][currentState]`, barcode.currentState);
    if (barcode.color)
      formData.append(`barcodes[${index}][color]`, barcode.color);
    if (barcode.storage)
      formData.append(`barcodes[${index}][storage]`, barcode.storage);
    if (barcode.image)
      formData.append(`barcodes[${index}][image]`, barcode.image);
  });

  const response = await api.post(
    `${BASE}/create-from-barcode/bulk`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const createInvoice = async (input: {
  shopkeeperId: string;
  type: string;
  invoice: File;
  customerInfo?: string;
  itemsIds?: string[];
}) => {
  const formData = new FormData();

  formData.append("shopkeeperId", input.shopkeeperId);
  formData.append("type", input.type);
  formData.append("invoice", input.invoice);

  if (input.customerInfo) formData.append("customerInfo", input.customerInfo);
  if (input.itemsIds?.length) {
    input.itemsIds.forEach((id: string) => {
      formData.append("itemsIds", id);
    });
  }

  const response = await api.post(`/invoices/create`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getMyInvoiceHistory = async (
  id: string,
): Promise<InvoiceHistoryResponse> => {
  const response = await api.get(`/invoices/shopkeeper/${id}`);

  return response.data;
};

export const createCustomer = async (input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  shopkeeperId: string;
  salesMethod?: string;
  actualSalePrice?: number;
}) => {
  const response = await api.post(`/customer/create`, input);
  return response.data;
};

export const getCustomersByShopkeeper = async (shopkeeperId: string) => {
  const response = await api.get(`/customer/shopkeeper/${shopkeeperId}`);
  return response.data;
};

export const getShopkeeperCart = async (
  shopkeeperId: string,
): Promise<CartListResponse> => {
  const response = await api.get(`/add-to-cart/shopkeeper/${shopkeeperId}`);
  return response.data;
};

export const deleteCartItem = async (cartId: string) => {
  const response = await api.delete(`/add-to-cart/delete/${cartId}`);
  return response.data;
};

export const deleteAllShopkeeperCartItems = async (shopkeeperId: string) => {
  const response = await api.delete(
    `/add-to-cart/delete-all/shopkeeper/${shopkeeperId}`,
  );
  return response.data;
};
