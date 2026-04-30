import { useQuery } from "@tanstack/react-query";
import { getAllSubscriptions } from "../api/subscriptions.api";

export function useSubscriptions() {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: getAllSubscriptions,
  });
}
