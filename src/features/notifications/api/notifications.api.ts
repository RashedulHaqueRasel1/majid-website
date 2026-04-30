import { api } from "@/lib/api";
import {
  NotificationResponse,
  SingleNotificationResponse,
} from "../types/notifications.types";

export const getShopkeeperNotificationsApi = async (page = 1, limit = 10) => {
  const response = await api.get<NotificationResponse>(
    `/notification/shopkeeper?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const getUserNotificationsApi = async (page = 1, limit = 10) => {
  const response = await api.get<NotificationResponse>(
    `/notification/user?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const getAdminNotificationsApi = async (page = 1, limit = 10) => {
  const response = await api.get<NotificationResponse>(
    `/notification/admin?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const getSingleNotificationApi = async (id: string) => {
  const response = await api.get<SingleNotificationResponse>(
    `/notification/${id}`,
  );
  return response.data;
};

export const markNotificationAsReadApi = async (id: string) => {
  const response = await api.patch<SingleNotificationResponse>(
    `/notification/read/${id}`,
  );
  return response.data;
};

export const markAllNotificationsAsReadApi = async () => {
  const response = await api.patch("/notification/read/all");
  return response.data;
};
