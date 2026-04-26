"use client";

import React from "react";
import { CheckCircle2, Zap, Brain, Shield, Diamond } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    badge: "STARTER",
    price: "$0",
    period: "/month",
    features: ["2 Free Checks", "Basic Device Report", "Free AI Explanation"],
    buttonText: "Free",
    bgColor: "bg-[#E0F2FE]", // Light blue
    badgeColor: "text-purple-600 bg-white",
    btnColor: "bg-white text-[#84CC16] border-[#84CC16]",
    icon: <Shield size={20} className="text-[#3B82F6]" />,
  },
  {
    name: "Best Value",
    badge: "BEST VALUE",
    price: "$2 - $30",
    period: "",
    features: [
      "Top-up from $2 to $30",
      "Free AI explanation",
      "No subscription required",
      "Credits never expire",
    ],
    buttonText: "Top-Up",
    bgColor: "bg-[#ECFCCB]", // Light green
    badgeColor: "text-purple-600 bg-white",
    btnColor: "bg-white text-[#84CC16] border-[#84CC16]",
    isPopular: true,
    icon: <Zap size={20} className="text-[#84CC16]" />,
  },
  {
    name: "Enterprise",
    badge: null,
    price: "Enterprise",
    period: "",
    features: [
      "Top-up from $2 to $30",
      "Free AI explanation",
      "No subscription required",
    ],
    buttonText: "Contract",
    bgColor: "bg-[#F3E8FF]", // Light purple
    badgeColor: null,
    btnColor: "bg-white text-[#84CC16] border-[#84CC16]",
    bonus: {
      icon: <Diamond size={18} className="text-[#3B82F6]" />,
      text: "Diamond",
      discount: "10% Off",
    },
    icon: <Brain size={20} className="text-[#A855F7]" />,
  },
];

export default function AddFunds() {
  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto space-y-12 font-poppins">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
          Pricing Plan
        </h1>
        <p className="text-[#64748B] font-medium">
          Track your payment status and invoices.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative rounded-[40px] p-10 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl transition-all group ${plan.bgColor}`}
          >
            <div className="space-y-8 relative z-10">
              <div className="flex justify-between items-start">
                {plan.badge && (
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${plan.badgeColor}`}
                  >
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h2 className="text-[14px] font-black text-[#0F172A] uppercase tracking-wider">
                  {plan.name === "Best Value" ? "" : plan.name}
                </h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#0F172A]">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-[#64748B] font-bold text-sm">
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="p-1 rounded-full bg-white/50">
                      <CheckCircle2 size={16} className="text-[#3B82F6]" />
                    </div>
                    <span className="text-sm font-bold text-[#475569]">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {plan.bonus && (
                <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100/50">
                  <div className="flex items-center gap-3">
                    {plan.bonus.icon}
                    <span className="text-sm font-black text-[#0F172A]">
                      {plan.bonus.text}
                    </span>
                  </div>
                  <span className="text-sm font-black text-[#0F172A]">
                    {plan.bonus.discount}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-12 relative z-10">
              <button
                className={`w-full py-4 rounded-full border-2 bg-white font-black text-sm transition-all hover:bg-[#84CC16] hover:text-white hover:border-[#84CC16] shadow-md shadow-gray-200 active:scale-[0.98] cursor-pointer text-[#84CC16] border-[#84CC16]`}
              >
                {plan.buttonText}
              </button>
            </div>

            {/* Decorative Icon Background */}
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              {React.cloneElement(
                plan.icon as React.ReactElement<{ size?: number | string }>,
                { size: 120 },
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
