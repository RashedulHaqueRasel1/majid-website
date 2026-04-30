import type { UserProfile } from "@/features/shopkeeper/settings/types";

export const DEFAULT_SHOPKEEPER_PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop";

export function getShopkeeperDisplayName(user?: UserProfile) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return fullName || user?.shopName || "Shopkeeper";
}

export function getShopkeeperImage(user?: UserProfile) {
  return user?.image?.url || DEFAULT_SHOPKEEPER_PROFILE_IMAGE;
}

export function getShopkeeperSubtitle(user?: UserProfile) {
  if (user?.shopName) {
    return user.shopName;
  }

  if (user?.role) {
    return user.role
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return "Store Owner";
}
