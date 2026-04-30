"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { INotification } from "../types/notifications.types";

interface NotificationDetailModalProps {
  notification: INotification | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDetailModal({
  notification,
  isOpen,
  onClose,
}: NotificationDetailModalProps) {
  if (!notification) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <div className="fixed inset-0 flex items-center justify-center p-4 z-[120] pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden pointer-events-auto border border-gray-100"
                >
                  {/* Header Decoration */}
                  <div className="h-32 bg-gradient-to-br from-[#84CC16] to-[#65A30D] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                    </div>

                    <button
                      onClick={onClose}
                      className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors outline-none"
                    >
                      <X size={20} />
                    </button>

                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                      <div className="w-20 h-20 bg-white rounded-[24px] shadow-xl flex items-center justify-center text-[#84CC16]">
                        <Bell size={36} strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-10 pt-16 pb-10 flex flex-col items-center text-center">
                    <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#F7FEE7] text-[#84CC16] rounded-full text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 size={12} />
                      {notification.type.replace(/_/g, " ")}
                    </div>

                    <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mb-4">
                      {notification.title}
                    </h2>

                    <div className="w-full p-6 bg-gray-50 rounded-2xl mb-8">
                      <p className="text-[15px] leading-relaxed text-[#475569] font-medium">
                        {notification.message}
                      </p>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4 mb-8">
                      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <Clock size={18} className="text-[#94A3B8] mb-2" />
                        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
                          Time
                        </span>
                        <span className="text-sm font-black text-[#0F172A]">
                          {format(new Date(notification.createdAt), "hh:mm a")}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <Calendar size={18} className="text-[#94A3B8] mb-2" />
                        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
                          Date
                        </span>
                        <span className="text-sm font-black text-[#0F172A]">
                          {format(
                            new Date(notification.createdAt),
                            "MMM dd, yyyy",
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="w-full py-4 bg-[#0F172A] text-white font-black rounded-2xl hover:bg-[#1E293B] transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
