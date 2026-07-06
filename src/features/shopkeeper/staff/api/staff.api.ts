import { api } from "@/lib/api";
import { registerUserApi } from "@/features/auth/api/auth.api";
import { ApiResponse, RegisterPayload } from "@/features/auth/types/auth.types";

export interface StaffUser {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  role?: string;
  image?: {
    url?: string;
  } | null;
  isVerified?: boolean;
  createdAt?: string;
}

export const getAllUsersApi = async (): Promise<ApiResponse<StaffUser[]>> => {
  const response = await api.get("/user/all-users");
  return response.data;
};

export const createStaffApi = async (
  payload: Omit<RegisterPayload, "role"> & { phone?: string },
) => {
  return registerUserApi({
    ...payload,
    role: "staff",
  });
};
