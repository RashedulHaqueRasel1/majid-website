"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Upload,
  X,
  Smartphone,
  Hash,
  DollarSign,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import {
  CreateInventorySchema,
  type CreateInventoryInput,
  type InventoryItem,
} from "../../types";
import {
  useCreateInventory,
  useUpdateInventory,
} from "../../hooks/useInventory";

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
}

export function InventoryFormModal({
  isOpen,
  onClose,
  item,
}: InventoryFormModalProps) {
  const isEditMode = !!item;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { mutate: createItem, isPending: isCreating } = useCreateInventory();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateInventory();
  const isPending = isCreating || isUpdating;

  const form = useForm<CreateInventoryInput>({
    resolver: zodResolver(CreateInventorySchema),
    defaultValues: {
      itemName: "",
      imeiNumber: "",
      purchasePrice: undefined,
      expectedPrice: undefined,
      currentState: "new",
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        itemName: item.itemName,
        imeiNumber: item.imeiNumber ?? "",
        purchasePrice: item.purchasePrice,
        expectedPrice: item.expectedPrice,
        currentState: item.currentState,
      });
    } else {
      form.reset({
        itemName: "",
        imeiNumber: "",
        purchasePrice: undefined,
        expectedPrice: undefined,
        currentState: "new",
      });
    }
  }, [item, form, isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (item) {
        setImagePreview(item.image?.url ?? null);
      } else {
        setImagePreview(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [item, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    form.setValue("image", file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = (values: CreateInventoryInput) => {
    if (isEditMode && item) {
      updateItem(
        {
          id: item._id,
          input: {
            itemName: values.itemName,
            expectedPrice: values.expectedPrice,
            currentState: values.currentState,
            image: values.image,
          },
        },
        {
          onSuccess: () => {
            toast.success("Inventory updated");
            onClose();
          },
          onError: () => toast.error("Update failed"),
        },
      );
    } else {
      createItem(values, {
        onSuccess: () => {
          toast.success("Item added to inventory");
          onClose();
        },
        onError: () => toast.error("Addition failed"),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white rounded-[40px] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-[#84CC16] p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              {isEditMode ? "Edit Item" : "Add New Item"}
            </DialogTitle>
            <DialogDescription className="text-white/80 font-bold">
              {isEditMode
                ? "Update your inventory record"
                : "Enter device details to track in your shop"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Item Name */}
                  <FormField
                    control={form.control}
                    name="itemName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Item Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              placeholder="iPhone 15 Pro Max"
                              className="pl-12 bg-slate-50 border-none rounded-2xl h-12 font-bold focus-visible:ring-[#84CC16]"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* IMEI Number */}
                  {!isEditMode && (
                    <FormField
                      control={form.control}
                      name="imeiNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            IMEI Number
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                placeholder="15-digit code"
                                className="pl-12 bg-slate-50 border-none rounded-2xl h-12 font-bold focus-visible:ring-[#84CC16]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="currentState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Condition
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-50 border-none rounded-2xl h-12 font-bold focus:ring-[#84CC16]">
                              <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-slate-400" />
                                <SelectValue placeholder="Select condition" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                            <SelectItem
                              value="new"
                              className="font-bold rounded-xl"
                            >
                              New
                            </SelectItem>
                            <SelectItem
                              value="good condition"
                              className="font-bold rounded-xl"
                            >
                              Good Condition
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  {/* Prices */}
                  <div className="grid grid-cols-1 gap-6">
                    {!isEditMode && (
                      <FormField
                        control={form.control}
                        name="purchasePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Purchase Price ($)
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="pl-12 bg-slate-50 border-none rounded-2xl h-12 font-bold focus-visible:ring-[#84CC16]"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="expectedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Expected Sale Price ($)
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                type="number"
                                placeholder="0.00"
                                className="pl-12 bg-slate-50 border-none rounded-2xl h-12 font-bold focus-visible:ring-[#84CC16]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Product Image
                    </label>
                    <div
                      className="border-2 border-dashed border-slate-100 rounded-3xl p-4 cursor-pointer hover:border-[#84CC16] hover:bg-lime-50 transition-all flex flex-col items-center justify-center gap-2 h-[132px]"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <div className="relative w-full h-full rounded-2xl overflow-hidden">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-slate-900 rounded-full p-1 hover:bg-white transition shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImagePreview(null);
                              form.setValue("image", undefined);
                              if (fileInputRef.current)
                                fileInputRef.current.value = "";
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#84CC16] transition">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                            Upload Photo
                          </span>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="rounded-2xl px-8 h-14 font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#84CC16] hover:bg-[#76b813] text-white rounded-2xl px-12 h-14 font-black uppercase tracking-widest shadow-xl shadow-lime-500/20 active:scale-95 transition"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : null}
                  {isEditMode ? "Save Changes" : "Add to Stock"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
