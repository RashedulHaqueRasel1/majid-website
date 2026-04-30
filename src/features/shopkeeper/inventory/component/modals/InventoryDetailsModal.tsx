"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Smartphone,
  Cpu,
  Layers,
  DollarSign,
  Tag,
  Info,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import type { InventoryItem } from "../../types";

interface InventoryDetailsModalProps {
  item: InventoryItem | null;
  onClose: () => void;
}

export function InventoryDetailsModal({
  item,
  onClose,
}: InventoryDetailsModalProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white flex flex-col md:flex-row"
      >
        {/* Product Image Section */}
        <div className="w-full md:w-[280px] h-[280px] md:h-auto relative bg-gray-50 flex-shrink-0">
          {item.image?.url ? (
            <Image
              src={item.image.url}
              alt={item.itemName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <Smartphone className="w-16 h-16 text-slate-300" />
            </div>
          )}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <span className="px-4 py-1.5 rounded-full bg-[#84CC16] text-white text-[10px] font-black tracking-widest uppercase shadow-lg shadow-lime-500/20">
              In Stock
            </span>
            <span className="px-4 py-1.5 rounded-full bg-white text-[#0F172A] text-[10px] font-black tracking-widest uppercase shadow-md">
              {item.currentState}
            </span>
          </div>
        </div>

        {/* Product Info Section */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-between overflow-y-auto max-h-[80vh]">
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight leading-tight">
                  {item.itemName}
                </h2>
                <p className="text-[13px] font-bold text-[#94A3B8] mt-1">
                  {item.imeiNumber || "No IMEI recorded"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-[#94A3B8]">
                  <Smartphone size={14} />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Screen
                  </span>
                </div>
                <p className="text-[13px] font-black text-[#0F172A]">
                  {item.specs?.screen || "6.7-inch OLED"}
                </p>
              </div>
              <div className="space-y-1.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-[#94A3B8]">
                  <Cpu size={14} />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Processor
                  </span>
                </div>
                <p className="text-[13px] font-black text-[#0F172A]">
                  {item.specs?.processor || "Octa-core Chip"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3 text-[#64748B]">
                  <Layers size={16} />
                  <span className="text-sm font-bold">IMEI / Serial</span>
                </div>
                <span className="text-sm font-black text-[#0F172A]">
                  {item.imeiNumber || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3 text-[#64748B]">
                  <DollarSign size={16} />
                  <span className="text-sm font-bold">Purchase Price</span>
                </div>
                <span className="text-sm font-black text-[#0F172A]">
                  ${item.purchasePrice?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3 text-[#64748B]">
                  <Tag size={16} />
                  <span className="text-sm font-bold">Expected Sale</span>
                </div>
                <span className="text-lg font-black text-[#84CC16]">
                  ${item.expectedPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3 text-[#64748B]">
                  <Calendar size={16} />
                  <span className="text-sm font-bold">Added Date</span>
                </div>
                <span className="text-sm font-black text-[#0F172A]">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Info size={16} />
              </div>
              <p className="text-[12px] font-bold text-blue-900/60 leading-relaxed">
                This device record is verified in your inventory and ready for
                sale.
              </p>
            </div>
          </div>

          <div className="mt-10 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-[#0F172A] text-white font-black text-[13px] rounded-2xl hover:bg-gray-800 transition shadow-xl active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
