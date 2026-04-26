"use client";

import React from "react";
import {
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

const paymentData = [
  {
    id: "#INV-8858",
    amount: "$1,650.00",
    status: "PAID",
    created: "Nov 05, 2023",
    order: "App Development",
  },
  {
    id: "#INV-8842",
    amount: "$1,200.00",
    status: "PAID",
    created: "Oct 12, 2023",
    order: "IMEI Check Credits",
  },
  {
    id: "#INV-8843",
    amount: "$2,500.00",
    status: "PENDING",
    created: "Oct 15, 2023",
    order: "Device Repair Services",
  },
  {
    id: "#INV-8844",
    amount: "$750.00",
    status: "PAID",
    created: "Oct 10, 2023",
    order: "Software License Renewal",
  },
  {
    id: "#INV-8845",
    amount: "$3,000.00",
    status: "OVERDUE",
    created: "Sep 30, 2023",
    order: "Annual Maintenance Fee",
  },
  {
    id: "#INV-8846",
    amount: "$1,500.00",
    status: "PAID",
    created: "Oct 18, 2023",
    order: "Cloud Storage Subscription",
  },
  {
    id: "#INV-8847",
    amount: "$980.00",
    status: "PENDING",
    created: "Oct 20, 2023",
    order: "Consultation Services",
  },
  {
    id: "#INV-8848",
    amount: "$400.00",
    status: "PAID",
    created: "Oct 14, 2023",
    order: "Website Hosting",
  },
  {
    id: "#INV-8849",
    amount: "$2,200.00",
    status: "OVERDUE",
    created: "Sep 29, 2023",
    order: "Product Development",
  },
  {
    id: "#INV-8850",
    amount: "$675.00",
    status: "PAID",
    created: "Oct 21, 2023",
    order: "IT Support Services",
  },
];

export default function PaymentHistory() {
  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-8 font-poppins">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            Payment History
          </h1>
          <p className="text-[#64748B] font-medium mt-1">
            Track your payment status and invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#84CC16] transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search invoices..."
              className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold w-full md:w-[300px] shadow-sm"
            />
          </div>
          <button className="p-3.5 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition shadow-sm group">
            <Filter
              size={18}
              className="text-[#64748B] group-hover:text-[#0F172A]"
            />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] border border-gray-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-[#FBFDFB]">
                <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                  Transaction ID
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                  Amount
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                  Status
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                  Created
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                  Order
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paymentData.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-[#F8FAFC]/50 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-[#3B82F6] cursor-pointer hover:underline">
                      {row.id}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-[#0F172A]">
                      {row.amount}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${
                        row.status === "PAID"
                          ? "bg-[#DCFCE7] text-[#166534] ring-1 ring-[#84CC16]/20"
                          : row.status === "PENDING"
                            ? "bg-[#FEF9C3] text-[#854D0E] ring-1 ring-yellow-500/20"
                            : "bg-[#FEE2E2] text-[#991B1B] ring-1 ring-red-500/20"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-[#64748B]">
                    {row.created}
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-[#475569]">
                    {row.order}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-3">
                      <button className="px-5 py-2.5 bg-[#84CC16] text-white text-[11px] font-black rounded-xl hover:bg-[#76b813] hover:scale-105 transition-all shadow-lg shadow-lime-500/20 active:scale-95 flex items-center gap-2 uppercase tracking-widest">
                        <Eye size={14} strokeWidth={3} />
                        View
                      </button>
                      <button className="px-5 py-2.5 bg-white border-2 border-gray-100 text-[#64748B] text-[11px] font-black rounded-xl hover:border-[#84CC16] hover:text-[#84CC16] hover:bg-[#84CC16]/5 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest">
                        <Download size={14} strokeWidth={3} />
                        Download PDF
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="px-8 py-8 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FBFDFB]/50">
          <p className="text-sm font-bold text-[#64748B]">
            Showing <span className="text-[#0F172A] font-black">1 - 10</span> of{" "}
            <span className="text-[#0F172A] font-black">58</span> results
          </p>

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-[#64748B] hover:text-[#84CC16] hover:border-[#84CC16] transition-all disabled:opacity-50 shadow-sm active:scale-90">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1.5 px-1">
              {[1, 2, 3, "...", 6].map((page, i) => (
                <button
                  key={i}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all shadow-sm active:scale-90 ${
                    page === 2
                      ? "bg-[#84CC16] text-white shadow-lg shadow-lime-500/20"
                      : page === "..."
                        ? "bg-transparent text-gray-400 cursor-default shadow-none"
                        : "bg-white border border-gray-100 text-[#64748B] hover:text-[#0F172A] hover:border-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#84CC16]/10 border border-[#84CC16]/20 text-[#84CC16] hover:bg-[#84CC16] hover:text-white transition-all shadow-sm active:scale-90">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
