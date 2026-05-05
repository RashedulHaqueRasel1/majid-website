"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
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
  Barcode,
  Camera,
  CheckCircle2,
  Search,
  FileUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";

import {
  CreateInventorySchema,
  type CreateInventoryInput,
  type InventoryItem,
  type ScanResultData,
} from "../../types";
import {
  useCreateInventory,
  useUpdateInventory,
  useCreateFromBarcode,
  useCreateFromBarcodeBulk,
} from "../../hooks/useInventory";
import { ScanResultModal } from "./ScanResultModal";

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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const barcodeImageInputRef = useRef<HTMLInputElement>(null);
  const fileUploadInputRef = useRef<HTMLInputElement>(null);
  const [barcodeImagePreview, setBarcodeImagePreview] = useState<string | null>(
    null,
  );
  const [bulkFile, setBulkFile] = useState<File | null>(null);

  const { mutate: createItem, isPending: isCreating } = useCreateInventory();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateInventory();
  const { mutate: handleCreateFromBarcode, isPending: isCreatingFromBarcode } =
    useCreateFromBarcode();
  const {
    mutate: handleCreateFromBarcodeBulk,
    isPending: isCreatingFromBarcodeBulk,
  } = useCreateFromBarcodeBulk();
  const { data: session } = useSession();
  const [scanResultModalData, setScanResultModalData] =
    useState<ScanResultData | null>(null);

  const isPending =
    isCreating ||
    isUpdating ||
    isCreatingFromBarcode ||
    isCreatingFromBarcodeBulk;

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

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("barcode-reader");
      html5QrCodeRef.current = html5QrCode;
      setIsCameraActive(true);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (session?.user?.id) {
            handleCreateFromBarcode(
              { code: decodedText, userId: session.user.id },
              {
                onSuccess: (data) => {
                  setScanResultModalData(data);
                  toast.success("Device found and added successfully");
                  stopScanning();
                },
                onError: (error: unknown) => {
                  const apiError = error as {
                    response?: { data?: { message?: string } };
                  };
                  toast.error(
                    apiError?.response?.data?.message ||
                      "Failed to process barcode",
                  );
                },
              },
            );
          } else {
            toast.error("User not authenticated");
          }
        },
        (errorMessage) => {
          // ignore scan errors
        },
      );
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Could not access camera");
      setIsCameraActive(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanning", err);
      }
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopScanning();
    }
  }, [isOpen]);

  const handleBarcodeImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setBarcodeImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Use a temporary scanner instance for file scanning
    const html5QrCode = new Html5Qrcode("barcode-reader-hidden");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      if (session?.user?.id) {
        handleCreateFromBarcode(
          { code: decodedText, userId: session.user.id },
          {
            onSuccess: (data) => {
              setScanResultModalData(data);
              toast.success("Device found and added successfully");
              setTimeout(() => setBarcodeImagePreview(null), 2000);
            },
            onError: (error: unknown) => {
              const apiError = error as {
                response?: { data?: { message?: string } };
              };
              toast.error(
                apiError?.response?.data?.message ||
                  "Failed to process barcode image",
              );
              setBarcodeImagePreview(null);
            },
          },
        );
      } else {
        toast.error("User not authenticated");
        setBarcodeImagePreview(null);
      }
    } catch (err) {
      console.error("Scan error", err);
      toast.error("No barcode found in image. Please try a clearer photo.");
      setBarcodeImagePreview(null);
    } finally {
      // Cleanup
      html5QrCode.clear();
    }
  };

  const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
  };

  const renderFormContent = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col gap-y-8">
          {/* Left Column: Basic Details */}
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 mb-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">
                Device Details
              </h4>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Primary device information
              </p>
            </div>

            {/* Item Name */}
            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">
                    Item Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                        <Smartphone className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                      </div>
                      <Input
                        placeholder="e.g. iPhone 15 Pro Max"
                        className="pl-14 pr-4 bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-[20px] h-[56px] font-bold text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] uppercase tracking-wider font-bold" />
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
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">
                      IMEI / Serial Number{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                          <Hash className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                        </div>
                        <Input
                          placeholder="Enter 15-digit code"
                          className="pl-14 pr-4 bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-[20px] h-[56px] font-bold text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase tracking-wider font-bold" />
                  </FormItem>
                )}
              />
            )}

            {/* Condition */}
            <FormField
              control={form.control}
              name="currentState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">
                    Device Condition <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="group bg-slate-50/80 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-[20px] h-[56px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm px-2">
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-10 h-10 bg-white rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus:border-[#84CC16]/30 group-focus:bg-[#84CC16]/5 transition-all shrink-0">
                            <Activity className="w-4 h-4 text-slate-400 group-focus:text-[#84CC16] transition-colors" />
                          </div>
                          <SelectValue placeholder="Select condition" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl p-1">
                      <SelectItem
                        value="new"
                        className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3"
                      >
                        Brand New
                      </SelectItem>
                      <SelectItem
                        value="good condition"
                        className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3"
                      >
                        Good Condition
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px] uppercase tracking-wider font-bold" />
                </FormItem>
              )}
            />
          </div>

          {/* Right Column: Pricing & Media */}
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 mb-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">
                Pricing & Media
              </h4>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Set margins and upload photo
              </p>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              {!isEditMode && (
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">
                        Cost Price ($)
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <DollarSign className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="pl-14 pr-4 bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-[20px] h-[56px] font-bold text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase tracking-wider font-bold" />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="expectedPrice"
                render={({ field }) => (
                  <FormItem
                    className={isEditMode ? "col-span-2" : "col-span-1"}
                  >
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">
                      Selling Price ($)
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                          <DollarSign className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                        </div>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="pl-14 pr-4 bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-[20px] h-[56px] font-bold text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase tracking-wider font-bold" />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">
                Product Image
              </label>
              <div
                className="relative border-2 border-dashed border-slate-200 rounded-[24px] p-4 cursor-pointer hover:border-[#84CC16] hover:bg-[#84CC16]/5 transition-all flex flex-col items-center justify-center gap-3 h-[154px] group overflow-hidden bg-slate-50/50"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative w-full h-full rounded-[16px] overflow-hidden shadow-sm">
                    <NextImage
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/20 transition-colors" />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-slate-900 rounded-full p-1.5 hover:bg-white hover:text-red-500 transition-all shadow-md transform hover:scale-110"
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
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#84CC16] group-hover:scale-110 transition-all duration-300">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                        Click to Upload
                      </span>
                      <span className="block text-[10px] font-semibold text-slate-400">
                        PNG, JPG up to 5MB
                      </span>
                    </div>
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

        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 hidden sm:block">
            Please ensure all <span className="text-red-400">*</span> fields are
            filled correctly.
          </p>
          <div className="flex justify-end gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-2xl px-8 h-14 font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-10 h-14 font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all w-full sm:w-auto"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Smartphone className="w-4 h-4 mr-2" />
              )}
              {isEditMode ? "Save Details" : "Add Device"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl bg-white rounded-[32px] border border-slate-100 shadow-2xl p-0 overflow-hidden max-h-[95vh] flex flex-col">
          <div className="relative bg-slate-900 p-8 text-white shrink-0 overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#84CC16] rounded-full mix-blend-multiply filter blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 translate-y-1/2 -translate-x-1/2" />

            <DialogHeader className="relative z-10">
              <DialogTitle className="flex items-center gap-3 text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {isEditMode ? (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <Smartphone className="w-5 h-5 text-[#84CC16]" />
                    </div>
                    Edit Device
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <Upload className="w-5 h-5 text-[#84CC16]" />
                    </div>
                    Add New Device
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-slate-300 font-medium text-sm mt-2 ml-[52px]">
                {isEditMode
                  ? "Update your inventory record details below."
                  : "Enter device details to track it in your shop inventory."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 bg-white overflow-y-auto flex-1 custom-scrollbar">
            {!isEditMode ? (
              <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full max-w-lg grid-cols-3 bg-slate-100/70 p-1.5 h-[56px] rounded-[20px] mb-8 mx-auto relative z-10">
                  <TabsTrigger
                    value="single"
                    className="rounded-[14px] font-bold uppercase tracking-wider text-[11px] h-full data-[state=active]:bg-white data-[state=active]:text-[#84CC16] data-[state=active]:shadow-sm transition-all"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Manual Entry</span>
                    <span className="sm:hidden">Manual</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="barcode"
                    className="rounded-[14px] font-bold uppercase tracking-wider text-[11px] h-full data-[state=active]:bg-white data-[state=active]:text-[#84CC16] data-[state=active]:shadow-sm transition-all"
                  >
                    <Barcode className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Scan Barcode</span>
                    <span className="sm:hidden">Scan</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="upload"
                    className="rounded-[14px] font-bold uppercase tracking-wider text-[11px] h-full data-[state=active]:bg-white data-[state=active]:text-[#84CC16] data-[state=active]:shadow-sm transition-all"
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">File Upload</span>
                    <span className="sm:hidden">Upload</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="single"
                  className="mt-0 border-none p-0 outline-none focus-visible:ring-0"
                >
                  {renderFormContent()}
                </TabsContent>

                <TabsContent
                  value="barcode"
                  className="mt-0 border-none p-0 outline-none focus-visible:ring-0"
                >
                  <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/50 relative overflow-hidden min-h-[400px]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#84CC16]/5 rounded-full blur-[80px] pointer-events-none" />

                    {!isCameraActive ? (
                      <>
                        {barcodeImagePreview ? (
                          <div className="relative w-64 h-48 rounded-[24px] overflow-hidden shadow-2xl mb-8 z-10 border-4 border-white group">
                            <NextImage
                              src={barcodeImagePreview}
                              alt="Barcode Preview"
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors" />
                            <button
                              type="button"
                              onClick={() => setBarcodeImagePreview(null)}
                              className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-slate-900 rounded-full p-1.5 hover:bg-white hover:text-red-500 transition-all shadow-md z-20"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#84CC16] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse z-20 whitespace-nowrap">
                              Scanning...
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-24 h-24 rounded-[28px] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center mb-8 border border-slate-100 z-10">
                            <Barcode className="w-10 h-10 text-[#84CC16]" />
                            <div className="absolute inset-0 border-2 border-[#84CC16] rounded-[28px] opacity-0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                          </div>
                        )}

                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-3 z-10">
                          {barcodeImagePreview
                            ? "Analyzing Image"
                            : "Scan Barcode"}
                        </h3>
                        <p className="text-slate-500 font-medium text-center max-w-[320px] text-sm leading-relaxed mb-8 z-10">
                          {barcodeImagePreview
                            ? "Please wait while we extract the barcode data from your uploaded photo."
                            : "Choose to scan via live camera or upload a clear photo of the barcode."}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 z-10">
                          <Button
                            onClick={startScanning}
                            type="button"
                            className="px-8 py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-[20px] font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-3"
                          >
                            <Camera className="w-5 h-5" />
                            Open Camera
                          </Button>
                          <div className="relative">
                            <Button
                              onClick={() =>
                                barcodeImageInputRef.current?.click()
                              }
                              type="button"
                              variant="outline"
                              className="px-8 py-6 border-2 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-900 rounded-[20px] font-black text-[12px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3"
                            >
                              <Upload className="w-5 h-5" />
                              Upload Image
                            </Button>
                            <input
                              ref={barcodeImageInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleBarcodeImageUpload}
                            />
                          </div>
                        </div>
                        {/* Hidden div for file scanning */}
                        <div id="barcode-reader-hidden" className="hidden" />
                      </>
                    ) : (
                      <div className="flex flex-col items-center w-full z-10 px-8">
                        <div className="relative w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl border-4 border-slate-900 mb-6 bg-black">
                          <div
                            id="barcode-reader"
                            className="w-full min-h-[300px]"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[80%] h-[100px] border-2 border-[#84CC16] rounded-xl relative opacity-50">
                              <div className="absolute top-0 left-0 w-full h-[2px] bg-[#84CC16] shadow-[0_0_10px_#84CC16] animate-[scan_2s_ease-in-out_infinite]" />
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={stopScanning}
                          type="button"
                          variant="ghost"
                          className="font-black text-[12px] uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl h-12 px-8"
                        >
                          Stop Scanning
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent
                  value="upload"
                  className="mt-0 border-none p-0 outline-none focus-visible:ring-0"
                >
                  <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/50 relative overflow-hidden min-h-[400px]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#84CC16]/5 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative w-24 h-24 rounded-[28px] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center mb-8 border border-slate-100 z-10 group">
                      <FileUp className="w-10 h-10 text-slate-400 group-hover:text-[#84CC16] transition-colors" />
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#84CC16] rounded-[28px] transition-all" />
                    </div>

                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-3 z-10">
                      Upload Inventory File
                    </h3>
                    <p className="text-slate-500 font-medium text-center max-w-[320px] text-sm leading-relaxed mb-8 z-10">
                      Upload a CSV or Excel file containing multiple inventory
                      items to add them in bulk.
                    </p>

                    {bulkFile ? (
                      <div className="flex flex-col items-center gap-4 z-10 w-full max-w-sm px-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-[20px] border border-slate-200 w-full shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-[12px] bg-[#84CC16]/10 flex items-center justify-center shrink-0">
                              <FileUp className="w-5 h-5 text-[#84CC16]" />
                            </div>
                            <div className="truncate">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {bulkFile.name}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-400">
                                {(bulkFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setBulkFile(null)}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors shrink-0 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-3 w-full">
                          <Button
                            type="button"
                            disabled={isCreatingFromBarcodeBulk}
                            onClick={() => {
                              if (!bulkFile) return;
                              handleCreateFromBarcodeBulk(bulkFile, {
                                onSuccess: (data) => {
                                  toast.success("Bulk upload successful");
                                  setBulkFile(null);
                                  onClose();
                                },
                                onError: (error: unknown) => {
                                  const apiError = error as {
                                    response?: { data?: { message?: string } };
                                  };
                                  toast.error(
                                    apiError?.response?.data?.message ||
                                      "Failed to process bulk file",
                                  );
                                },
                              });
                            }}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-[16px] h-12 font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
                          >
                            {isCreatingFromBarcodeBulk ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              "Process File"
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10">
                        <Button
                          onClick={() => fileUploadInputRef.current?.click()}
                          type="button"
                          className="px-8 py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-[20px] font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-3"
                        >
                          <Upload className="w-5 h-5" />
                          Choose File
                        </Button>
                        <input
                          ref={fileUploadInputRef}
                          type="file"
                          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          className="hidden"
                          onChange={handleBulkFileUpload}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              renderFormContent()
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ScanResultModal
        isOpen={!!scanResultModalData}
        onClose={() => {
          setScanResultModalData(null);
          onClose();
        }}
        data={scanResultModalData}
      />
    </>
  );
}
