import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getShopkeeperNotificationsApi,
  getUserNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from "../api/notifications.api";

export const useShopkeeperNotifications = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["notifications", "shopkeeper", page, limit],
    queryFn: () => getShopkeeperNotificationsApi(page, limit),
  });
};

export const useUserNotifications = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["notifications", "user", page, limit],
    queryFn: () => getUserNotificationsApi(page, limit),
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationAsReadApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsAsReadApi(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
