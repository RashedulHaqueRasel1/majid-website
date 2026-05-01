"use client";

import { Loader2, Search, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { useMyRepairRequests } from "../hooks/useRepairRequest";

const statusLabels: Record<string, string> = {
  request_submitted: "Submitted",
  in_review: "In Review",
  quote_sent: "Quote Sent",
  quote_accepted: "Quote Accepted",
  quote_rejected: "Quote Rejected",
  rejected: "Rejected",
  repair_in_progress: "In Progress",
  completed: "Completed",
};

export default function RepairHistory() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useMyRepairRequests(1, 20);

  const requests = useMemo(() => {
    const rows = data?.data || [];
    if (!search) return rows;

    const normalizedSearch = search.toLowerCase();
    return rows.filter((request) =>
      [request.deviceModel, request.IMEINumber, request.description]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch)),
    );
  }, [data, search]);

  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto space-y-7 font-poppins">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A]">
            Repair History
          </h1>
          <p className="mt-1 text-sm font-medium text-[#64748B]">
            Track requests, quotes, and service progress.
          </p>
        </div>

        <label className="relative w-full md:w-[340px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/10"
            placeholder="Search repair requests"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#84CC16]" />
          </div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-[#FBFDFB]">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
                    Device
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
                    Shop
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
                    IMEI
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
                    Status
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((request) => {
                  const shop =
                    typeof request.shopkeeperId === "object"
                      ? request.shopkeeperId.shopName
                      : "Repair shop";

                  return (
                    <tr key={request._id} className="hover:bg-[#F8FAFC]">
                      <td className="px-6 py-5">
                        <div className="font-semibold text-[#0F172A]">
                          {request.deviceModel}
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm text-[#64748B]">
                          {request.description}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-[#475569]">
                        {shop || "Repair shop"}
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-[#64748B]">
                        {request.IMEINumber || "Not provided"}
                      </td>
                      <td className="px-6 py-5">
                        <span className="rounded-full bg-[#F1FBE3] px-3 py-1.5 text-xs font-bold text-[#65A30D]">
                          {statusLabels[request.status] || request.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-[#64748B]">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1FBE3] text-[#84CC16]">
              <Wrench size={26} />
            </div>
            <p className="font-semibold text-[#0F172A]">
              No repair requests yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
