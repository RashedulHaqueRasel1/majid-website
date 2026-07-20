"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, Package, Mail, Phone, MapPin, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInventoryBySupplier } from "../../../inventory/hooks/useInventory";
import type { Supplier } from "../../types";
import { useCurrency } from "@/hooks/useCurrency";

interface SupplierItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

export default function SupplierItemsModal({
  isOpen,
  onClose,
  supplier,
}: SupplierItemsModalProps) {
  const { formatCurrency } = useCurrency();
  const { data: inventoryResponse, isLoading } = useInventoryBySupplier(
    supplier?._id || "",
  );

  const items = inventoryResponse?.data || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-3xl p-0 font-poppins">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-lime-100 to-lime-50 text-lg font-black text-[#65A30D] dark:from-lime-900/50 dark:to-lime-800/30 dark:text-lime-400">
                {supplier?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                  {supplier?.name}
                </DialogTitle>
                <div className="flex items-center gap-3 mt-0.5">
                  {supplier?.email && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Mail size={10} /> {supplier.email}
                    </span>
                  )}
                  {supplier?.phone && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Phone size={10} /> {supplier.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-foreground transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#84CC16]" />
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {items.length} item{items.length !== 1 && "s"} from this
                supplier
              </p>
              {items.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  {/* Image */}
                  <div className="relative h-14 w-14 shrink-0 overflow-xl rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                    {item.image?.url ? (
                      <Image
                        src={item.image.url}
                        alt={item.itemName}
                        fill
                        className="object-cover rounded-xl"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {item.itemName}
                      </p>
                      {item.brand && (
                        <span className="shrink-0 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          {item.brand}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] font-bold text-slate-400">
                      {item.color && <span>{item.color}</span>}
                      {item.storage && <span>{item.storage}</span>}
                      {item.imeiNumber && (
                        <span className="font-mono">
                          IMEI: {item.imeiNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Qty */}
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {formatCurrency(item.expectedPrice || 0)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400">
                      Qty: {item.quantity ?? 0}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Package className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                No items found
              </h3>
              <p className="mt-1 text-sm font-bold text-slate-500">
                No inventory items have been added from this supplier yet.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
