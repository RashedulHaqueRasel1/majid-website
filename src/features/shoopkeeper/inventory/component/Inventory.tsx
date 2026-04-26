"use client";

import React from "react";
import {
  Plus,
  MoreVertical,
  Search,
  Filter,
  Download,
  Package,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

const stockItems = [
  {
    id: 1,
    name: "Samsung Galaxy S24 Ultra",
    model: "Samsung SM-S928B",
    serial: "13616816841681031861",
    price: "$600",
    oldPrice: "$700",
    qty: 2,
    status: "In Stock",
    condition: "Brand New",
    img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Google Pixel 8 Pro 128GB",
    model: "Google GP4BC",
    serial: "13616816841681031861",
    price: "$600",
    oldPrice: "$700",
    qty: 4,
    status: "In Stock",
    condition: "Like New",
    img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "iPhone 15 Pro Max 256GB",
    model: "Apple A2849",
    serial: "13616816841681031861",
    price: "$600",
    oldPrice: "$700",
    qty: 1,
    status: "In Stock",
    condition: "New",
    img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "OnePlus 12 256GB",
    model: "OnePlus CPH2573",
    serial: "13616816841681031861",
    price: "$600",
    oldPrice: "$700",
    qty: 4,
    status: "Reserved",
    condition: "Fair",
    img: "https://images.unsplash.com/photo-1710313186256-419b161c3186?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "iPod Pro 11",
    model: "Space Gray",
    serial: "13616816841681031861",
    price: "$600",
    oldPrice: "$700",
    qty: 4,
    status: "In Stock",
    condition: "Brand New",
    img: "https://images.unsplash.com/photo-1544650039-2287f3945927?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "iPhone 14 Pro Max 256GB",
    model: "Apple A2849",
    serial: "13616816841681031861",
    price: "$600",
    oldPrice: "$700",
    qty: 4,
    status: "In Stock",
    condition: "Like New",
    img: "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=300&auto=format&fit=crop",
  },
];

const soldItems = [
  {
    name: "Samsung Galaxy S24 Ultra",
    imei: "4893021435",
    purchase: "$600",
    expected: "$600",
    qty: 5,
    img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=100&auto=format&fit=crop",
  },
  {
    name: "OnePlus 12",
    imei: "4893021435",
    purchase: "$400",
    expected: "$400",
    qty: 2,
    img: "https://images.unsplash.com/photo-1710313186256-419b161c3186?q=80&w=100&auto=format&fit=crop",
  },
  {
    name: "iPhone 17",
    imei: "4893021435",
    purchase: "$600",
    expected: "$600",
    qty: 8,
    img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=100&auto=format&fit=crop",
  },
  {
    name: "Google Pixel 9",
    imei: "4893021435",
    purchase: "$700",
    expected: "$700",
    qty: 1,
    img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=100&auto=format&fit=crop",
  },
  {
    name: "Sony Xperia 1V",
    imei: "4893021435",
    purchase: "$600",
    expected: "$600",
    qty: 12,
    img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
  },
  {
    name: "iPad 11",
    imei: "4893021435",
    purchase: "$800",
    expected: "$800",
    qty: 5,
    img: "https://images.unsplash.com/photo-1544650039-2287f3945927?q=80&w=100&auto=format&fit=crop",
  },
];

export default function Inventory() {
  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-12 font-poppins">
      {/* Inventory Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            Inventory
          </h1>
          <p className="text-[#64748B] font-bold text-sm">
            5 in Stock - $45,000 Total Revenue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#84CC16] text-white font-black rounded-xl hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 active:scale-95 cursor-pointer">
            <Plus size={18} strokeWidth={3} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stockItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative"
          >
            <div className="flex gap-6">
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50">
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[15px] font-black text-[#0F172A] leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-[11px] font-bold text-[#94A3B8] mt-1">
                      {item.model}
                    </p>
                    <p className="text-[10px] font-medium text-[#CBD5E1] line-clamp-1">
                      {item.serial}
                    </p>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-[#0F172A] transition">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      item.condition === "Brand New"
                        ? "bg-blue-50 text-blue-500"
                        : item.condition === "Like New"
                          ? "bg-orange-50 text-orange-500"
                          : item.condition === "New"
                            ? "bg-blue-500 text-white"
                            : "bg-lime-50 text-lime-600"
                    }`}
                  >
                    {item.condition}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      item.status === "Reserved"
                        ? "bg-orange-500 text-white"
                        : "bg-[#84CC16] text-white"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex items-end justify-between pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-bold text-gray-300 line-through">
                      {item.oldPrice}
                    </span>
                    <span className="text-xl font-black text-[#0F172A]">
                      {item.price}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#64748B]">
                    Qty : {item.qty}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sold Items Section */}
      <div className="space-y-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Sold Items
          </h2>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#84CC16] text-white font-black rounded-xl hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 active:scale-95 cursor-pointer">
            <Plus size={18} strokeWidth={3} />
            <span>Add Sold Items</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 bg-[#FBFDFB]">
                  <th className="px-8 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">
                    Item Name
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">
                    IMEI Number
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">
                    Purchase Price
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">
                    Expected Price
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] text-center">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {soldItems.map((item, i) => (
                  <tr
                    key={i}
                    className="hover:bg-[#F8FAFC]/50 transition-colors group"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                          <Image
                            src={item.img}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-[13px] font-bold text-[#0F172A]">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-[13px] font-bold text-[#64748B]">
                      {item.imei}
                    </td>
                    <td className="px-8 py-4 text-[13px] font-black text-[#0F172A]">
                      {item.purchase}
                    </td>
                    <td className="px-8 py-4 text-[13px] font-black text-[#0F172A]">
                      {item.expected}
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className="text-[13px] font-black text-[#84CC16]">
                        {item.qty}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
