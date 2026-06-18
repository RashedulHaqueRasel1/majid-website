"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Info,
  TrendingUp,
  Package,
  Star,
  FileText,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  Percent,
  Wallet,
  ChevronDown,
  Banknote,
  BadgeDollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// Types
type Period = "daily" | "weekly" | "monthly" | "yearly";

interface SalesTrendPoint {
  name: string;
  date: string;
  thisMonth: number;
  lastMonth: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: SalesTrendPoint;
  }>;
}

// Sales Trend Data mapping
const salesTrendByPeriod: Record<Period, SalesTrendPoint[]> = {
  daily: [
    { name: "9 AM", date: "9:00 AM", thisMonth: 120, lastMonth: 90 },
    { name: "12 PM", date: "12:00 PM", thisMonth: 340, lastMonth: 210 },
    { name: "3 PM", date: "3:00 PM", thisMonth: 450, lastMonth: 380 },
    { name: "6 PM", date: "6:00 PM", thisMonth: 580, lastMonth: 410 },
    { name: "9 PM", date: "9:00 PM", thisMonth: 210, lastMonth: 180 },
  ],
  weekly: [
    { name: "Mon", date: "Monday", thisMonth: 1200, lastMonth: 900 },
    { name: "Tue", date: "Tuesday", thisMonth: 1800, lastMonth: 1400 },
    { name: "Wed", date: "Wednesday", thisMonth: 1500, lastMonth: 1200 },
    { name: "Thu", date: "Thursday", thisMonth: 2100, lastMonth: 1700 },
    { name: "Fri", date: "Friday", thisMonth: 2400, lastMonth: 1900 },
    { name: "Sat", date: "Saturday", thisMonth: 2800, lastMonth: 2200 },
    { name: "Sun", date: "Sunday", thisMonth: 1900, lastMonth: 1500 },
  ],
  monthly: [
    { name: "1", date: "1 May", thisMonth: 5200, lastMonth: 3500 },
    { name: "7", date: "7 May", thisMonth: 11500, lastMonth: 6200 },
    { name: "14", date: "14 May", thisMonth: 13000, lastMonth: 8800 },
    { name: "18", date: "18 May", thisMonth: 16240, lastMonth: 10500 },
    { name: "21", date: "21 May", thisMonth: 18200, lastMonth: 12100 },
    { name: "28", date: "28 May", thisMonth: 19500, lastMonth: 14200 },
    { name: "30", date: "30 May", thisMonth: 15800, lastMonth: 12500 },
  ],
  yearly: [
    { name: "Jan", date: "January", thisMonth: 35000, lastMonth: 28000 },
    { name: "Mar", date: "March", thisMonth: 42000, lastMonth: 32000 },
    { name: "May", date: "May", thisMonth: 48000, lastMonth: 38000 },
    { name: "Jul", date: "July", thisMonth: 52000, lastMonth: 41000 },
    { name: "Sep", date: "September", thisMonth: 49000, lastMonth: 43000 },
    { name: "Nov", date: "November", thisMonth: 56000, lastMonth: 48000 },
  ],
};

// Top stats mapping
const statsByPeriod = {
  daily: [
    {
      label: "Total Sales",
      value: "£1,580",
      trend: "↑ 4%",
      icon: TrendingUp,
      color:
        "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Profit",
      value: "£480",
      trend: "↑ 6%",
      icon: Wallet,
      color:
        "bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400",
    },
    {
      label: "Total Orders",
      value: "22",
      trend: "↑ 8%",
      icon: ShoppingBag,
      color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Avg Order Value",
      value: "£71.82",
      trend: "↑ 2%",
      icon: Percent,
      color:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400",
    },

    {
      label: "Avg Order Value",
      value: "£71.82",
      trend: "↑ 2%",
      icon: Percent,
      color:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400",
    },
  ],
  weekly: [
    {
      label: "Total Sales",
      value: "£11,200",
      trend: "↑ 12%",
      icon: TrendingUp,
      color:
        "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Profit",
      value: "£3,410",
      trend: "↑ 15%",
      icon: Wallet,
      color:
        "bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400",
    },
    {
      label: "Total Orders",
      value: "148",
      trend: "↑ 10%",
      icon: ShoppingBag,
      color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Avg Order Value",
      value: "£75.68",
      trend: "↑ 3%",
      icon: Percent,
      color:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400",
    },
    {
      label: "Cash in Drawer",
      value: "$2,350",
      trend: "↑ 2%",
      icon: BadgeDollarSign,
      color:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400",
    },
    {
      label: "Banked",
      value: "$8,250",
      trend: "↑ 2%",
      icon: Banknote,
      color:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400",
    },
  ],
  monthly: [
    {
      label: "Total Sales",
      value: "£48,200",
      trend: "↑ 17%",
      icon: TrendingUp,
      color:
        "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Profit",
      value: "£14,650",
      trend: "↑ 21%",
      icon: Wallet,
      color:
        "bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400",
    },
    {
      label: "Total Orders",
      value: "642",
      trend: "↑ 14%",
      icon: ShoppingBag,
      color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Avg Order Value",
      value: "£75.08",
      trend: "↑ 5%",
      icon: Percent,
      color:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400",
    },
    {
      label: "Cash in Drawer",
      value: "$2,350",
      trend: "↑ 2%",
      icon: BadgeDollarSign,
      color:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400",
    },
    {
      label: "Banked",
      value: "$8,250",
      trend: "↑ 2%",
      icon: Banknote,
      color:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400",
    },
  ],
  yearly: [
    {
      label: "Total Sales",
      value: "£542,000",
      trend: "↑ 24%",
      icon: TrendingUp,
      color:
        "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Profit",
      value: "£165,400",
      trend: "↑ 28%",
      icon: Wallet,
      color:
        "bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400",
    },
    {
      label: "Total Orders",
      value: "7,180",
      trend: "↑ 19%",
      icon: ShoppingBag,
      color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Avg Order Value",
      value: "£75.48",
      trend: "↑ 4%",
      icon: Percent,
      color:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400",
    },
    {
      label: "Cash in Drawer",
      value: "$2,350",
      trend: "↑ 2%",
      icon: BadgeDollarSign,
      color:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400",
    },
    {
      label: "Banked",
      value: "$8,250",
      trend: "↑ 2%",
      icon: Banknote,
      color:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400",
    },
  ],
};

export default function DashboardOverview() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [startingCash, setStartingCash] = useState("");
  const [cashInDrawer, setCashInDrawer] = useState("$2,350");

  const handleStartingCashSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const cashValue = Number(startingCash);

    if (!startingCash || Number.isNaN(cashValue)) {
      return;
    }

    setCashInDrawer(
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(cashValue),
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 font-poppins bg-[#F8FAFC] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Real-time business performance analytics and AI-powered insights.
          </p>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div className="gap-8 ">
        <div className=" grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CashManagementScore />
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 flex-shrink-0">
                  <BadgeDollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Starting Day Cash
                </span>

                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
                    {cashInDrawer}
                  </span>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                      ↑ 2%
                    </span>

                    <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                      vs last month
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={handleStartingCashSubmit}
                  className="mt-4 flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={startingCash}
                    onChange={(event) => setStartingCash(event.target.value)}
                    placeholder="Enter starting cash"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-950/40"
                  />

                  <button
                    type="submit"
                    className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-600"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 flex-shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Banked
                </span>

                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
                    $8,250
                  </span>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                      ↑ 2%
                    </span>

                    <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                      vs last month
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid mt-10 grid-cols-1 lg:grid-cols-2 gap-8">
          <BusinessHealthScore />
          <ScoreBreakdown />
          <AIInsightSummary />
          <SalesByCategory />
        </div>

        {/* Right Column (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Timeframe selector + Stats Grid */}
          <div>
            <div className="flex justify-end mb-6">
              <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900 p-1 rounded-2xl w-max shadow-sm border border-slate-200/50 dark:border-slate-800">
                {(["daily", "weekly", "monthly", "yearly"] as Period[]).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-4.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        period === p
                          ? "bg-violet-600 text-white shadow-md shadow-violet-600/15"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      {p === "daily"
                        ? "Daily"
                        : p === "weekly"
                          ? "Weekly"
                          : p === "monthly"
                            ? "Monthly"
                            : "Yearly"}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {statsByPeriod[period].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-2.5 rounded-2xl ${stat.color} flex-shrink-0`}
                    >
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
                        {stat.value}
                      </span>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                          {stat.trend}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                          vs last month
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SalesTrend period={period} />
          <TopSellingProducts />
          <AIInsightsCarousel />
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   SUBCOMPONENTS
   ========================================== */

function BusinessHealthScore() {
  const score = 92;
  const radius = 75;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius * (240 / 360);
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const needleRotation = (score - 50) * 2.4;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <button className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-slate-800 dark:text-white text-sm">
          Business Health Score
        </span>
        <button className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400">
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Gauge SVG */}
      <div className="relative w-64 h-44 flex items-center justify-center mt-2">
        <svg className="w-full h-full" viewBox="0 0 200 160">
          <defs>
            <linearGradient
              id="gauge-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#84CC16" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter
              id="needle-shadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="1.5"
                floodOpacity="0.15"
              />
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d="M 35 130 A 75 75 0 1 1 165 130"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="stroke-slate-100 dark:stroke-slate-800"
          />

          {/* Active Arc */}
          <path
            d="M 35 130 A 75 75 0 1 1 165 130"
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />

          {/* Needle Pointer pointing inwards from outer edge */}
          <g transform={`rotate(${needleRotation}, 100, 100)`}>
            <path
              d="M 96 12 L 104 12 L 100 24 Z"
              fill="#0F172A"
              className="fill-slate-900 dark:fill-white"
              filter="url(#needle-shadow)"
            />
          </g>

          {/* Labels for 0 and 100 */}
          <text
            x="32"
            y="146"
            textAnchor="middle"
            className="text-[10px] font-bold fill-slate-400"
          >
            0
          </text>
          <text
            x="168"
            y="146"
            textAnchor="middle"
            className="text-[10px] font-bold fill-slate-400"
          >
            100
          </text>
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">
            92
          </span>
          <span className="text-xs font-semibold text-slate-400 mt-0.5">
            /100
          </span>
        </div>
      </div>

      {/* Excellent Badge */}
      <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-3.5 py-1 rounded-full text-xs font-bold mt-2 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
        <Star className="w-3.5 h-3.5 fill-emerald-600 stroke-emerald-600 dark:fill-emerald-400 dark:stroke-emerald-400" />
        <span>Excellent</span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium mt-4 max-w-[220px] leading-relaxed">
        Your business is performing better than{" "}
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
          84%
        </span>{" "}
        of similar shops using imoscan.
      </p>
    </div>
  );
}

function CashManagementScore() {
  const score = 92;
  const radius = 75;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius * (240 / 360);
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const needleRotation = (score - 50) * 2.4;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <button className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-slate-800 dark:text-white text-sm">
          Cash Management Score
        </span>
        <button className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400">
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Gauge SVG */}
      <div className="relative w-64 h-44 flex items-center justify-center mt-2">
        <svg className="w-full h-full" viewBox="0 0 200 160">
          <defs>
            <linearGradient
              id="gauge-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#84CC16" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter
              id="needle-shadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="1.5"
                floodOpacity="0.15"
              />
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d="M 35 130 A 75 75 0 1 1 165 130"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="stroke-slate-100 dark:stroke-slate-800"
          />

          {/* Active Arc */}
          <path
            d="M 35 130 A 75 75 0 1 1 165 130"
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />

          {/* Needle Pointer pointing inwards from outer edge */}
          <g transform={`rotate(${needleRotation}, 100, 100)`}>
            <path
              d="M 96 12 L 104 12 L 100 24 Z"
              fill="#0F172A"
              className="fill-slate-900 dark:fill-white"
              filter="url(#needle-shadow)"
            />
          </g>

          {/* Labels for 0 and 100 */}
          <text
            x="32"
            y="146"
            textAnchor="middle"
            className="text-[10px] font-bold fill-slate-400"
          >
            0
          </text>
          <text
            x="168"
            y="146"
            textAnchor="middle"
            className="text-[10px] font-bold fill-slate-400"
          >
            100
          </text>
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">
            92
          </span>
          <span className="text-xs font-semibold text-slate-400 mt-0.5">
            /100
          </span>
        </div>
      </div>

      {/* Excellent Badge */}
      <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-3.5 py-1 rounded-full text-xs font-bold mt-2 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
        <Star className="w-3.5 h-3.5 fill-emerald-600 stroke-emerald-600 dark:fill-emerald-400 dark:stroke-emerald-400" />
        <span>Excellent</span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium mt-4 max-w-[220px] leading-relaxed">
        Your business is performing better than{" "}
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
          84%
        </span>{" "}
        of similar shops using imoscan.
      </p>
    </div>
  );
}

function ScoreBreakdown() {
  const metrics = [
    {
      name: "Sales Growth",
      score: 95,
      color: "bg-emerald-500",
      icon: TrendingUp,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/20",
    },
    {
      name: "Profit Margin",
      score: 88,
      color: "bg-emerald-500",
      icon: Wallet,
      iconColor: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-50 dark:bg-violet-950/20",
    },
    {
      name: "Stock Management",
      score: 90,
      color: "bg-emerald-500",
      icon: Package,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      name: "Customer Satisfaction",
      score: 93,
      color: "bg-emerald-500",
      icon: Star,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/20",
    },
    {
      name: "Outstanding Payments",
      score: 85,
      color: "bg-amber-500",
      icon: FileText,
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-50 dark:bg-rose-950/20",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="font-bold text-slate-800 dark:text-white text-base">
          Score Breakdown
        </span>
        <button className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5 cursor-pointer">
          See Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.name} className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${m.iconBg} ${m.iconColor} flex-shrink-0`}
            >
              <m.icon className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {m.name}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-white flex-shrink-0">
                  {m.score}
                  <span className="text-slate-400 dark:text-slate-500 font-medium">
                    /100
                  </span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${m.color} rounded-full`}
                  style={{ width: `${m.score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIInsightSummary() {
  return (
    <div className="bg-violet-50/70 dark:bg-violet-950/15 border border-violet-100/50 dark:border-violet-900/30 rounded-3xl p-5 shadow-sm hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all duration-200 cursor-pointer flex items-start">
      <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-3.5 leading-relaxed flex-1">
        Great job! Your profit margin improved by 12% this month. Keep
        maintaining your stock turnover to stay ahead.
      </p>
      <ChevronRight className="text-slate-400 dark:text-slate-600 w-5 h-5 flex-shrink-0 ml-2 mt-0.5" />
    </div>
  );
}

function SalesByCategory() {
  const categoryData = [
    { name: "Mobile Phones", value: 20164, color: "#7C3AED", percent: "42%" },
    { name: "Accessories", value: 11066, color: "#3B82F6", percent: "23%" },
    { name: "Repairs", value: 7230, color: "#10B981", percent: "15%" },
    { name: "Tablets", value: 4820, color: "#F59E0B", percent: "10%" },
    { name: "Others", value: 4920, color: "#EC4899", percent: "10%" },
  ];

  return (
    <div className="bg-white mb-10 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-slate-800 dark:text-white text-base">
          Sales by Category
        </span>
        <button className="text-xs font-semibold text-slate-500 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-lg flex items-center gap-1 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-300">
          This Month <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="w-40 h-40 flex-shrink-0 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2.5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5 w-full">
          {categoryData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-500 dark:text-slate-400 truncate">
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-slate-800 dark:text-white flex-shrink-0">
                £{item.value.toLocaleString()}{" "}
                <span className="text-slate-400 dark:text-slate-500 font-medium ml-0.5">
                  ({item.percent})
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="bg-slate-955 dark:bg-slate-900 text-white px-3.5 py-2 rounded-2xl shadow-xl text-xs border border-slate-800 backdrop-blur-md">
        <p className="font-medium text-slate-400">{point.date}</p>
        <p className="text-violet-400 font-black text-sm mt-0.5">
          £{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

function SalesTrend({ period }: { period: Period }) {
  const data = salesTrendByPeriod[period];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-slate-800 dark:text-white text-base">
          Sales Trend
        </span>
        <button className="text-xs font-semibold text-slate-500 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-lg flex items-center gap-1 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-300">
          Monthly <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-semibold mb-6">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
          <span className="text-slate-600 dark:text-slate-300">This Month</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="text-slate-400 dark:text-slate-500">Last Month</span>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F1F5F9"
              className="stroke-slate-100 dark:stroke-slate-800/50"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }}
              dx={-5}
              tickFormatter={(value) =>
                value >= 1000 ? `${value / 1000}K` : value
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="lastMonth"
              stroke="#CBD5E1"
              className="stroke-slate-300 dark:stroke-slate-700"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="thisMonth"
              stroke="#7C3AED"
              strokeWidth={3}
              dot={{
                stroke: "#7C3AED",
                strokeWidth: 2,
                fill: "#FFFFFF",
                r: 3.5,
              }}
              activeDot={{
                stroke: "#7C3AED",
                strokeWidth: 2,
                fill: "#FFFFFF",
                r: 5,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TopSellingProducts() {
  const products = [
    {
      rank: 1,
      name: "iPhone 15 Pro (256GB)",
      sold: 128,
      width: "w-[85%]",
      img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=100&auto=format&fit=crop",
    },
    {
      rank: 2,
      name: "Samsung S24 Ultra",
      sold: 97,
      width: "w-[65%]",
      img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=100&auto=format&fit=crop",
    },
    {
      rank: 3,
      name: "AirPods Pro 2",
      sold: 86,
      width: "w-[58%]",
      img: "https://images.unsplash.com/photo-1588449668365-d15e397f6787?q=80&w=100&auto=format&fit=crop",
    },
    {
      rank: 4,
      name: "iPhone 14 (128GB)",
      sold: 72,
      width: "w-[48%]",
      img: "https://images.unsplash.com/photo-1663499482523-1c0c1ebe4cc2?q=80&w=100&auto=format&fit=crop",
    },
    {
      rank: 5,
      name: "Samsung A54",
      sold: 61,
      width: "w-[38%]",
      img: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?q=80&w=100&auto=format&fit=crop",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="font-bold text-slate-800 dark:text-white text-base">
          Top Selling Products
        </span>
        <button className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5 cursor-pointer">
          View All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-4">
        {products.map((p) => (
          <div key={p.rank} className="flex items-center">
            {/* Rank badge */}
            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0 mr-3">
              {p.rank}
            </div>

            {/* Product Image */}
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-800 flex-shrink-0 mr-3 relative">
              <img
                src={p.img}
                alt={p.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 mr-4">
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mb-1.5">
                {p.name}
              </span>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-violet-600 rounded-full ${p.width}`}
                />
              </div>
            </div>

            {/* Sold Count */}
            <div className="text-right flex-shrink-0">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                {p.sold}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                Sold
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIInsightsCarousel() {
  const [index, setIndex] = useState(0);

  const insights = [
    {
      text: "iPhone 15 Pro sales increased by 42% this month. Consider increasing stock!",
      type: "increase",
    },
    {
      text: "Your profit margin improved by 12% due to rising repair service orders.",
      type: "profit",
    },
    {
      text: "Stock levels for AirPods Pro 2 are low. Reorder to avoid missing out on 15+ potential sales.",
      type: "stock",
    },
    {
      text: "Outstanding payments dropped by 8% this week. Great job following up with customers!",
      type: "payment",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % insights.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [insights.length]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <span className="font-bold text-slate-800 dark:text-white text-base">
            AI Insights
          </span>
        </div>
        <button className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5 cursor-pointer">
          View All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Slide Container */}
      <div className="bg-violet-50/50 dark:bg-violet-950/15 border border-violet-100/50 dark:border-violet-900/30 rounded-2xl p-5 min-h-[96px] flex items-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
            className="flex items-start gap-4 w-full"
          >
            {/* Chart icon box */}
            <div className="bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 p-3 rounded-2xl flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>

            {/* Description */}
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed flex-1 pt-0.5 select-none">
              {insights[index].text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {insights.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
              i === index
                ? "bg-violet-600 w-4.5"
                : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
