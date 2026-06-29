export type Supplier = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SupplierInput = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
};

export type SupplierListParams = {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
};

export type SupplierListResponse = {
  success: boolean;
  message: string;
  statusCode: number;
  data: Supplier[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
    totalPages?: number;
  };
};

export type SupplierSingleResponse = {
  success: boolean;
  message: string;
  statusCode: number;
  data: Supplier;
};
