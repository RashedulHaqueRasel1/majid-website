"use client";

import React from "react";
import {
  FileText,
  DollarSign,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Smartphone,
  CheckCircle2,
  Package,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";
import Image from "next/image";

// Demo Data
const chartData = [
  { name: "Jan", revenue: 32000, expenses: 21000 },
  { name: "Feb", revenue: 38000, expenses: 24000 },
  { name: "Mar", revenue: 35000, expenses: 22000 },
  { name: "Apr", revenue: 42000, expenses: 28000 },
  { name: "May", revenue: 39000, expenses: 26000 },
  { name: "Jun", revenue: 48000, expenses: 31000 },
  { name: "Jul", revenue: 45210, expenses: 29000 },
];

const customerSummary = [
  {
    name: "Alex Smith",
    outstanding: "$1,450.00",
    lastPayment: "Oct 14, 2024",
    status: "GOOD STANDING",
    initial: "AS",
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Briana Roberts",
    outstanding: "$2,300.50",
    lastPayment: "Nov 20, 2024",
    status: "GOOD STANDING",
    initial: "BR",
    color: "bg-lime-100 text-lime-600",
  },
  {
    name: "Carlos Johnson",
    outstanding: "$1,875.75",
    lastPayment: "Dec 05, 2024",
    status: "GOOD STANDING",
    initial: "CJ",
    color: "bg-orange-100 text-orange-600",
  },
];

const upcomingDueDates = [
  {
    id: "INV-4521",
    amount: "$1,200",
    client: "Alex Smith",
    date: "22",
    month: "OCT",
  },
  {
    id: "INV-452B",
    amount: "$450",
    client: "Sarah Connor",
    date: "24",
    month: "OCT",
  },
  {
    id: "INV-4528",
    amount: "$450",
    client: "Sarah Connor",
    date: "27",
    month: "OCT",
  },
];

const inventoryItems = [
  {
    name: "Premium Smartwatch Series 7",
    price: "$399.00",
    stock: "24 Units",
    badge: "NEW",
    img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=300&auto=format&fit=crop",
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    price: "$249.99",
    stock: "2 Units",
    badge: "GOOD",
    img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=300&auto=format&fit=crop",
  },
  {
    name: "Google Pixel 8 Pro 128GB",
    price: "$1,099.00",
    stock: "15 Units",
    badge: "NEW",
    img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=300&auto=format&fit=crop",
  },
  {
    name: "iPhone 15 Pro Max 256GB",
    price: "$120.00",
    stock: "8 Units",
    badge: "FAIR",
    img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=300&auto=format&fit=crop",
  },
];

export default function DashboardOverview() {
  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-10 font-poppins bg-[#FBFDFB]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-[#64748B] font-medium mt-1">
            Real-time device integrity metrics and verification health.
          </p>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Invoices",
            value: "1,284",
            icon: <FileText className="text-[#10B981]" />,
            trend: "+14.2%",
            trendUp: true,
            color: "bg-[#F0FDF4]",
          },
          {
            label: "Paid Amount",
            value: "$45,210.00",
            icon: <DollarSign className="text-[#3B82F6]" />,
            trend: "+8.4%",
            trendUp: true,
            color: "bg-[#EFF6FF]",
          },
          {
            label: "Pending Payments",
            value: "$12,840.50",
            icon: <Clock className="text-[#F59E0B]" />,
            trend: "-2.1%",
            trendUp: false,
            color: "bg-[#FFFBEB]",
          },
          {
            label: "Past Due Balance",
            value: "$3,420.00",
            icon: <AlertCircle className="text-[#EF4444]" />,
            trend: "+12.5%",
            trendUp: false,
            color: "bg-[#FEF2F2]",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div
                className={`${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}
              >
                {stat.icon}
              </div>
              <div
                className={`px-3 py-1 rounded-full text-[10px] font-black ${stat.trendUp ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"}`}
              >
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                {stat.label}
              </p>
              <h3 className="text-2xl font-black text-[#0F172A]">
                {stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Overview Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-xl font-black text-[#0F172A]">
              Revenue Overview
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-[#84CC16]" />
              <span className="text-xs font-bold text-[#64748B]">
                Monthly Revenue
              </span>
            </div>
          </div>
          <div className="flex bg-[#F1F5F9] p-1 rounded-xl">
            {["30 Days", "6 Months", "12 Months"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-[11px] font-black rounded-lg transition-all ${tab === "30 Days" ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#84CC16" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#84CC16" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 900 }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 900 }}
                dx={-15}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  padding: "12px",
                }}
                itemStyle={{ fontSize: "12px", fontWeight: 900 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#84CC16"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#3B82F6"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorExpenses)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Tables & Upcoming Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-8 flex items-center justify-between border-b border-gray-50">
            <h2 className="text-xl font-black text-[#0F172A]">
              Customer Summary
            </h2>
            <button className="text-[#84CC16] font-black text-xs hover:underline uppercase tracking-widest">
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                    Customer Name
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                    Outstanding
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                    Last Payment
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                    Status
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customerSummary.map((customer) => (
                  <tr
                    key={customer.name}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl ${customer.color} flex items-center justify-center font-black text-xs`}
                        >
                          {customer.initial}
                        </div>
                        <span className="text-sm font-bold text-[#0F172A]">
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-[#0F172A]">
                      {customer.outstanding}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-[#64748B]">
                      {customer.lastPayment}
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-[#F0FDF4] text-[#166534] text-[10px] font-black rounded-full uppercase tracking-wider">
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#94A3B8] hover:text-[#0F172A]">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Upcoming Due Dates */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-[#0F172A]">
              Upcoming Due Dates
            </h2>
            <div className="p-2 bg-gray-50 rounded-lg">
              <CalendarIcon size={18} className="text-[#64748B]" />
            </div>
          </div>
          <div className="space-y-6">
            {upcomingDueDates.map((due) => (
              <div
                key={due.id}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
              >
                <div className="w-14 h-14 bg-[#F0FDF4] rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border border-[#DCFCE7]">
                  <span className="text-[10px] font-black text-[#166534] uppercase">
                    {due.month}
                  </span>
                  <span className="text-xl font-black text-[#166534]">
                    {due.date}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-[14px] font-black text-[#0F172A]">
                      {due.id}
                    </h4>
                    <span className="text-[13px] font-black text-[#0F172A]">
                      {due.amount}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#64748B] mt-0.5">
                    • {due.client}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 bg-white border-2 border-[#84CC16] text-[#84CC16] font-black text-sm rounded-2xl hover:bg-[#84CC16] hover:text-white transition-all shadow-sm">
            View Full Calendar
          </button>
        </motion.div>
      </div>

      {/* Recent Inventory */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#0F172A]">
            Recent Inventory
          </h2>
          <button className="text-sm font-black text-[#3B82F6] hover:underline">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {inventoryItems.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm group hover:shadow-xl transition-all"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-black rounded-full shadow-sm">
                  {item.badge}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-[15px] font-black text-[#0F172A] line-clamp-1">
                  {item.name}
                </h3>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">
                      Price
                    </p>
                    <p className="text-lg font-black text-[#84CC16]">
                      {item.price}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">
                      In Stock
                    </p>
                    <p className="text-sm font-black text-[#0F172A]">
                      {item.stock}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
