import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  getMyProfile,
  updateProfile,
  changePassword,
  getMyRepairProblem,
} from "../api/settings.api";
import { toast } from "sonner";
import { ProfileResponse, RepairProblemDescriptionsResponse } from "../types";

export function useMyProfile(
  options?: Partial<UseQueryOptions<ProfileResponse>>,
) {
  return useQuery<ProfileResponse>({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    ...options,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to change password");
    },
  });
}

export function useRepairProblem(userId: string) {
  return useQuery<RepairProblemDescriptionsResponse>({
    queryKey: ["my-repair-problem", userId],
    queryFn: () => getMyRepairProblem(userId),
    enabled: Boolean(userId),
  });
}
