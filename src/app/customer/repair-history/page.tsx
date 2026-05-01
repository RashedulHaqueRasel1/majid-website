import RepairHistoryTable from "@/features/customer/repairHistory/component/RepairHistoryTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Repair History | Imoscan",
  description: "View your repair history",
};

export default function RepairHistoryPage() {
  return <RepairHistoryTable />;
}
