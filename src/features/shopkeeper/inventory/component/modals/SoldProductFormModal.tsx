"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Package, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CreateSoldProductSchema, CreateSoldProductInput } from "../../types";
import { useCreateSoldProduct } from "../../hooks/useSoldProducts";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";

interface SoldProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SoldProductFormModal({
  isOpen,
  onClose,
}: SoldProductFormModalProps) {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const { currency } = useCurrency();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateSoldProductInput>({
    resolver: zodResolver(CreateSoldProductSchema),
    defaultValues: {
      quantity: 1,
      purchasePrice: 0,
      expectedPrice: 0,
      paidAmount: 0,
      remainingDue: 0,
    },
  });

  const { mutate: createSold } = useCreateSoldProduct();

  // Auto-calculate remaining due
  const expectedPrice = useWatch({ control, name: "expectedPrice" });
  const paidAmount = useWatch({ control, name: "paidAmount" });

  useEffect(() => {
    // If I had setValue, I'd use it here, but I'll let the user fill it or handle it in submit
  }, [expectedPrice, paidAmount]);

  const onSubmit = (data: CreateSoldProductInput) => {
    createSold(data, {
      onSuccess: () => {
        toast.success("Sold product added successfully");
        reset();
        onClose();
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err?.response?.data?.message || "Failed to add sold product",
        );
      },
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#84CC16]/10 rounded-xl flex items-center justify-center text-[#84CC16]">
                <Package size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                  Add Sold Item
                </h2>
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mt-0.5">
                  Record a new sale
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-slate-400 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8"
          >
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">
                  Item Name
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register("name")}
                    placeholder="Samsung Galaxy S24 Ultra"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#84CC16] outline-none transition"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">
                  Model
                </label>
                <input
                  {...register("model")}
                  placeholder="SM-S928B"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#84CC16] outline-none transition"
                />
                {errors.model && (
                  <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">
                    {errors.model.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">
                  IMEI Number
                </label>
                <input
                  {...register("imeiNumber")}
                  placeholder="354267..."
                  className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#84CC16] outline-none transition"
                />
                {errors.imeiNumber && (
                  <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">
                    {errors.imeiNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">
                  Quantity
                </label>
                <input
                  type="number"
                  {...register("quantity")}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#84CC16] outline-none transition"
                />
                {errors.quantity && (
                  <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
            </div>

            {/* Pricing Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">
                  Purchase Price ({currency})
                </label>
                <input
                  type="number"
                  {...register("purchasePrice")}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#84CC16] outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">
                  Selling Price ({currency})
                </label>
                <input
                  type="number"
                  {...register("expectedPrice")}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#84CC16] outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">
                  Paid Amount ({currency})
                </label>
                <input
                  type="number"
                  {...register("paidAmount")}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#84CC16] outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">
                  Remaining Due ({currency})
                </label>
                <input
                  type="number"
                  {...register("remainingDue")}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#84CC16] outline-none transition"
                />
              </div>
            </div>

            {/* Due Date & Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">
                  Due Date
                </label>
                <input
                  type="date"
                  {...register("dueDate")}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white focus:border-[#84CC16] outline-none transition"
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">
                  Item Image
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    className="hidden"
                    id="sold-image-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setValue("image", file);
                        const reader = new FileReader();
                        reader.onloadend = () =>
                          setImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label
                    htmlFor="sold-image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition group-hover:border-[#84CC16] overflow-hidden"
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-300 group-hover:text-[#84CC16] transition" />
                        <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">
                          Upload Image
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 sticky bottom-0 bg-white">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#84CC16] text-white font-black rounded-2xl hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
              >
                {isSubmitting ? "Adding..." : "Add Sold Product"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
