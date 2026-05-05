"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Barcode, CheckCircle2, Search, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { ScanResultData } from "../../types";

interface ScanResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ScanResultData | null;
}

export function ScanResultModal({
  isOpen,
  onClose,
  data,
}: ScanResultModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-[32px] border border-slate-100 shadow-2xl p-0 overflow-hidden">
        <div className="bg-[#84CC16] p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center mb-6 shadow-xl"
            >
              <CheckCircle2 className="w-10 h-10 text-[#84CC16]" />
            </motion.div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight mb-2">
              Scan Successful
            </DialogTitle>
            <DialogDescription className="text-white/90 font-bold text-sm uppercase tracking-widest">
              Device Added to Inventory
            </DialogDescription>
          </div>
        </div>

        <div className="p-8 text-center">
          <div className="space-y-4 mb-8">
            <div className="bg-slate-50 rounded-[24px] p-6 border border-slate-100 relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Barcode className="w-12 h-12 text-slate-900" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                Device Identified
              </p>
              <h4 className="text-xl font-black text-slate-900 mb-1">
                {data?.itemName || "Device Added"}
              </h4>
              {/* <p className="text-sm font-bold text-[#84CC16] uppercase tracking-wider">
                IMEI: {data?.imeiNumber || "N/A"}
              </p> */}
            </div>

            <div className="flex items-center gap-3 bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Search className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[11px] font-bold text-blue-700 text-left leading-tight">
                We&apos;ve automatically fetched the device details and updated
                your stock records.
              </p>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-[20px] h-[64px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Continue to Dashboard
            <Activity className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
