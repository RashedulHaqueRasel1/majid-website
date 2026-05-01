import RepairHistoryDetails from "@/features/customer/repairHistory/component/RepairHistoryDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Repair Details | Imoscan",
  description: "View details of your repair request",
};

export default async function RepairHistoryDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return <RepairHistoryDetails id={resolvedParams.slug} />;
}
