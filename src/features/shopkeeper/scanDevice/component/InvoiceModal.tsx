/* eslint-disable @typescript-eslint/no-explicit-any */
// components/InvoiceModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  DollarSign,
  Landmark,
  RefreshCw,
  User,
  MapPin,
  Phone,
  CreditCard,
  Mail,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { IMEIResult } from "../../scanDevice/types/scanDevice.types";
import axiosInstance from "@/lib/instance/axios-instance";
import { useSession } from "next-auth/react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (invoiceData: InvoiceFormData) => void;
  scanResult?: IMEIResult;
  isGenerating: boolean;
  defaultPrice?: number;
}

export interface InvoiceFormData {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone: string;
  price: number;
  paymentMethod: "cash" | "bank" | "tradein";
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    maskedNumber: string;
  };
  tradeInDetails?: {
    tradeInValue: number;
    deviceName: string;
    remainingAmount: number;
    isReceiving: boolean;
  };
  customerId?: string;
}

// Field error type
interface FieldError {
  field: string;
  message: string;
}

export const InvoiceModal = ({
  isOpen,
  onClose,
  onGenerate,
  scanResult,
  isGenerating,
  defaultPrice,
}: InvoiceModalProps) => {
  const { data: session } = useSession();
  const marketValue = scanResult?.marketValue?.amount || defaultPrice || 599;
  const deviceName = scanResult?.deviceName || "Unknown Device";

  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);

  const [formData, setFormData] = useState<InvoiceFormData>({
    customerName: "",
    customerEmail: "",
    customerAddress: "",
    customerPhone: "",
    price: marketValue,
    paymentMethod: "cash",
  });
  const [tradeInValue, setTradeInValue] = useState<number>(0);
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  // Clear field error for a specific field
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => prev.filter((e) => e.field !== field));
  };

  // Parse customer name into first and last name
  const parseCustomerName = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    return { firstName, lastName };
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: FieldError[] = [];

    if (!formData.customerName.trim()) {
      errors.push({
        field: "customerName",
        message: "Customer name is required",
      });
    }
    if (!formData.customerEmail.trim()) {
      errors.push({ field: "customerEmail", message: "Email is required" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      errors.push({ field: "customerEmail", message: "Invalid email format" });
    }
    if (!formData.customerAddress.trim()) {
      errors.push({ field: "customerAddress", message: "Address is required" });
    }
    if (!formData.customerPhone.trim()) {
      errors.push({
        field: "customerPhone",
        message: "Phone number is required",
      });
    }
    if (formData.price <= 0) {
      errors.push({ field: "price", message: "Price must be greater than 0" });
    }
    if (formData.paymentMethod === "bank" && !bankAccountNumber.trim()) {
      errors.push({
        field: "bankAccount",
        message: "Bank account number is required",
      });
    }

    setFieldErrors(errors);
    return errors.length === 0;
  };

  // Create customer API call
  const createCustomer = async (): Promise<{
    success: boolean;
    customerId?: string;
    error?: string;
  }> => {
    const { firstName, lastName } = parseCustomerName(formData.customerName);

    const payload = {
      firstName,
      lastName,
      email: formData.customerEmail,
      phone: formData.customerPhone,
      address: formData.customerAddress,
      shopkeeperId:
        (session?.user as any)?.shopkeeperId || (session?.user as any)?.id,
    };

    try {
      const response = await axiosInstance.post("/customer/create", payload);

      if (response.data?.success || response.data?.data?._id) {
        const customerId = response.data.data?._id || response.data?.data?.id;
        return { success: true, customerId };
      }

      if (response.data?.message?.includes("already exists")) {
        return {
          success: false,
          error:
            "Customer with this email already exists. Please use a different email.",
        };
      }

      return {
        success: false,
        error: response.data?.message || "Failed to create customer",
      };
    } catch (error: any) {
      if (
        error.response?.data?.message?.includes("already exists") ||
        error.response?.data?.errorSources?.[0]?.message?.includes(
          "already exists",
        )
      ) {
        return {
          success: false,
          error:
            "Customer with this email already exists. Please use a different email address.",
        };
      }

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create customer. Please try again.",
      };
    }
  };

  const handlePaymentMethodChange = (
    method: InvoiceFormData["paymentMethod"],
  ) => {
    setFormData({ ...formData, paymentMethod: method });
    setCustomerError(null);
  };

  const handleTradeInChange = (value: number) => {
    setTradeInValue(value);
    const remaining = formData.price - value;
    setFormData({
      ...formData,
      tradeInDetails: {
        tradeInValue: value,
        deviceName: deviceName,
        remainingAmount: Math.abs(remaining),
        isReceiving: remaining < 0,
      },
    });
  };

  const handleBankDetailsChange = (accountNumber: string) => {
    setBankAccountNumber(accountNumber);
    const maskedNumber =
      accountNumber.length > 4 ? `****${accountNumber.slice(-4)}` : "****";
    setFormData({
      ...formData,
      bankDetails: {
        accountName: formData.customerName,
        accountNumber: accountNumber,
        maskedNumber: maskedNumber,
      },
    });
    clearFieldError("bankAccount");
  };

  const handleInputChange = (
    field: keyof InvoiceFormData,
    value: string | number,
  ) => {
    setFormData({ ...formData, [field]: value });
    clearFieldError(field as string);
    setCustomerError(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCreatingCustomer(true);
    setCustomerError(null);

    try {
      const result = await createCustomer();

      if (result.success && result.customerId) {
        const invoiceData: InvoiceFormData = {
          ...formData,
          customerId: result.customerId,
        };
        onGenerate(invoiceData);
        onClose();
      } else {
        setCustomerError(
          result.error || "Failed to create customer. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error in customer creation:", error);
      setCustomerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const remainingAmount = formData.tradeInDetails?.remainingAmount || 0;
  const isReceiving = formData.tradeInDetails?.isReceiving || false;

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors.find((e) => e.field === field)?.message;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#84CC16]/10 rounded-xl">
                  <DollarSign size={20} className="text-[#84CC16]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Smart Invoice
                  </h2>
                  <p className="text-xs text-gray-500">
                    Fill customer & payment details
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Error Message */}
            {customerError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle
                  size={16}
                  className="text-red-500 mt-0.5 shrink-0"
                />
                <p className="text-sm text-red-600">{customerError}</p>
              </div>
            )}

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Customer Information */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                  Customer Information
                </label>
                <div className="space-y-3">
                  <div>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={formData.customerName}
                        onChange={(e) =>
                          handleInputChange("customerName", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#84CC16]/20 outline-none transition ${
                          getFieldError("customerName")
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 focus:border-[#84CC16]"
                        }`}
                      />
                    </div>
                    {getFieldError("customerName") && (
                      <p className="text-xs text-red-500 mt-1">
                        {getFieldError("customerName")}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        placeholder="Email Address *"
                        value={formData.customerEmail}
                        onChange={(e) =>
                          handleInputChange("customerEmail", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#84CC16]/20 outline-none transition ${
                          getFieldError("customerEmail")
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 focus:border-[#84CC16]"
                        }`}
                      />
                    </div>
                    {getFieldError("customerEmail") && (
                      <p className="text-xs text-red-500 mt-1">
                        {getFieldError("customerEmail")}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <MapPin
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Address *"
                        value={formData.customerAddress}
                        onChange={(e) =>
                          handleInputChange("customerAddress", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#84CC16]/20 outline-none transition ${
                          getFieldError("customerAddress")
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 focus:border-[#84CC16]"
                        }`}
                      />
                    </div>
                    {getFieldError("customerAddress") && (
                      <p className="text-xs text-red-500 mt-1">
                        {getFieldError("customerAddress")}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        value={formData.customerPhone}
                        onChange={(e) =>
                          handleInputChange("customerPhone", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#84CC16]/20 outline-none transition ${
                          getFieldError("customerPhone")
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 focus:border-[#84CC16]"
                        }`}
                      />
                    </div>
                    {getFieldError("customerPhone") && (
                      <p className="text-xs text-red-500 mt-1">
                        {getFieldError("customerPhone")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                  Price Details
                </label>
                <div>
                  <div className="relative">
                    <DollarSign
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", Number(e.target.value))
                      }
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#84CC16]/20 outline-none transition ${
                        getFieldError("price")
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-200 focus:border-[#84CC16]"
                      }`}
                    />
                  </div>
                  {getFieldError("price") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("price")}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handlePaymentMethodChange("cash")}
                    className={`py-2.5 rounded-xl border-2 flex items-center justify-center gap-2 transition ${
                      formData.paymentMethod === "cash"
                        ? "border-[#84CC16] bg-[#84CC16]/5 text-[#84CC16]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard size={16} />
                    <span className="text-sm font-semibold">Cash</span>
                  </button>
                  <button
                    onClick={() => handlePaymentMethodChange("bank")}
                    className={`py-2.5 rounded-xl border-2 flex items-center justify-center gap-2 transition ${
                      formData.paymentMethod === "bank"
                        ? "border-[#84CC16] bg-[#84CC16]/5 text-[#84CC16]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Landmark size={16} />
                    <span className="text-sm font-semibold">Bank</span>
                  </button>
                  <button
                    onClick={() => handlePaymentMethodChange("tradein")}
                    className={`py-2.5 rounded-xl border-2 flex items-center justify-center gap-2 transition ${
                      formData.paymentMethod === "tradein"
                        ? "border-[#84CC16] bg-[#84CC16]/5 text-[#84CC16]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <RefreshCw size={16} />
                    <span className="text-sm font-semibold">Trade-In</span>
                  </button>
                </div>
              </div>

              {/* Bank Transfer Details */}
              {formData.paymentMethod === "bank" && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-xs font-bold text-blue-700 mb-2">
                    Bank Transfer Details
                  </p>
                  <input
                    type="text"
                    placeholder="Account Number *"
                    value={bankAccountNumber}
                    onChange={(e) => handleBankDetailsChange(e.target.value)}
                    className={`w-full px-4 py-2 bg-white border rounded-lg focus:border-[#84CC16] outline-none text-sm ${
                      getFieldError("bankAccount")
                        ? "border-red-500"
                        : "border-blue-200"
                    }`}
                  />
                  {getFieldError("bankAccount") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("bankAccount")}
                    </p>
                  )}
                  <p className="text-[10px] text-blue-600 mt-2">
                    Account Name: {formData.customerName || "Customer Name"}
                  </p>
                </div>
              )}

              {/* Trade-In Details */}
              {formData.paymentMethod === "tradein" && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-xs font-bold text-amber-700 mb-2">
                    Trade-In Details
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-amber-700">
                        Device Being Traded
                      </label>
                      <input
                        type="text"
                        value={deviceName}
                        disabled
                        className="w-full px-4 py-2 bg-white border border-amber-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-amber-700">
                        Trade-In Value ($)
                      </label>
                      <input
                        type="number"
                        placeholder="Enter trade-in value"
                        value={tradeInValue}
                        onChange={(e) =>
                          handleTradeInChange(Number(e.target.value))
                        }
                        className="w-full px-4 py-2 bg-white border border-amber-200 rounded-lg focus:border-[#84CC16] outline-none text-sm"
                      />
                    </div>
                    {tradeInValue > 0 && (
                      <div
                        className={`p-3 rounded-lg ${isReceiving ? "bg-green-100" : "bg-yellow-100"}`}
                      >
                        <p className="text-sm font-semibold">
                          {isReceiving
                            ? `💰 Customer receives: $${remainingAmount}`
                            : `💵 Customer pays: $${remainingAmount}`}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Device Price: ${formData.price} - Trade-In: $
                          {tradeInValue} = ${remainingAmount}{" "}
                          {isReceiving ? "(refund)" : "(to pay)"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isGenerating || isCreatingCustomer}
                className="flex-1 py-2.5 rounded-xl bg-[#84CC16] text-white font-semibold text-sm hover:bg-[#76b813] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isCreatingCustomer || isGenerating ? (
                  <Loader2 size={16} className="animate-spin " />
                ) : (
                  <DollarSign size={16} className="" />
                )}
                {isCreatingCustomer
                  ? "Creating Customer..."
                  : isGenerating
                    ? "Generating..."
                    : "Generate Invoice"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
