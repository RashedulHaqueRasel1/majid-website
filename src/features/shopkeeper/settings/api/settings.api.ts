import { api } from "@/lib/api";
import { ProfileResponse } from "../types";

export const getMyProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get("/user/my-profile");
  return response.data;
};

export const updateProfile = async (
  data: FormData,
): Promise<ProfileResponse> => {
  const response = await api.put("/user/update-profile", data);
  return response.data;
};

export const changePassword = async (data: Record<string, unknown>) => {
  const response = await api.post("/auth/change-password", data);
  return response.data;
};
