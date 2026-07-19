import { redirect } from "next/navigation";

export const metadata = {
  title: "Account Settings | Shopkeeper Dashboard",
  description: "Manage your profile information and account security settings.",
};

export default function SettingsPage() {
  redirect("/shopkeeper/settings/profile");
}
