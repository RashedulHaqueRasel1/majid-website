"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useMyRepairRequests } from "@/features/customer/repairRequest/hooks/useRepairRequest";
import { RepairRequest } from "@/features/customer/repairRequest/types/repair-request.types";

const getStatusStyles = (status: string) => {
  switch (status) {
    case "submitted":
    case "request_submitted":
    case "quote_sent":
    case "pending":
      return "bg-[#FEF9C3] text-[#CA8A04]"; // Yellow
    case "in_review":
    case "reviewing":
    case "quote_accepted":
    case "approved":
      return "bg-[#DBEAFE] text-[#2563EB]"; // Blue
    case "repair_in_progress":
    case "in_progress":
    case "repairing":
      return "bg-[#F3E8FF] text-[#9333EA]"; // Purple
    case "completed":
      return "bg-[#DCFCE7] text-[#16A34A]"; // Green
    case "rejected":
    case "quote_rejected":
      return "bg-[#FEE2E2] text-[#DC2626]"; // Red
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "submitted":
    case "request_submitted":
      return "Pending";
    case "in_review":
      return "Reviewing";
    case "quote_sent":
      return "Pending Quote";
    case "quote_accepted":
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "repair_in_progress":
      return "Repairing";
    case "completed":
      return "Completed";
    default:
      return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
};

export default function RepairHistoryTable() {
  const { data: historyData, isLoading } = useMyRepairRequests();
  const repairRequests = historyData?.data || [];

  return (
    <div className="px-4 py-8 md:px-8 lg:px-12 font-poppins min-h-screen bg-background">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Repair History
          </h1>
        </div>

        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs font-black uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-5">Shop Name</th>
                  <th className="px-6 py-5">Device</th>
                  <th className="px-6 py-5">Issue Summary</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </td>
                  </tr>
                ) : repairRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-muted-foreground font-medium text-base">
                        No repair history found.
                      </p>
                    </td>
                  </tr>
                ) : (
                  repairRequests.map((request: RepairRequest) => {
                    const shopName =
                      typeof request.shopkeeperId === "object"
                        ? request.shopkeeperId.shopName
                        : "Unknown Shop";

                    return (
                      <tr
                        key={request._id}
                        className="group transition-colors hover:bg-surface/50"
                      >
                        <td className="px-6 py-5 font-bold text-foreground">
                          {shopName}
                        </td>
                        <td className="px-6 py-5 font-medium text-foreground">
                          {request.deviceModel}
                        </td>
                        <td className="px-6 py-5 font-medium text-muted-foreground max-w-[200px] truncate">
                          {request.description}
                        </td>
                        <td className="px-6 py-5 font-medium text-muted-foreground">
                          {format(new Date(request.createdAt), "MMM dd, yyyy")}
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusStyles(
                              request.status,
                            )}`}
                          >
                            {getStatusLabel(request.status)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/customer/repair-history/${request._id}`}
                            className="inline-flex h-9 items-center justify-center rounded-full border-2 border-primary bg-transparent px-4 text-xs font-bold text-primary transition-all hover:bg-primary/5 active:scale-[0.98]"
                          >
                            View Report
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
