import { api } from "@/lib/api";

export const getAllSubscriptions = async () => {
  const response = await api.get("/subscription/all");
  return response.data;
};
