/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Wrench,
  Search,
  Package,
  ShoppingCart,
  User,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  Check,
  X,
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  UserPlus,
  AlertCircle,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";

// Hooks
import {
  useCategories,
  useMyInventory,
  useShopkeeperCart,
  useDeleteCartItem,
  useDeleteAllShopkeeperCartItems,
  useCreateInvoice,
  useCustomersByShopkeeper,
  useCreateCustomer,
  INVENTORY_KEYS,
} from "../../inventory/hooks/useInventory";
import { useGetMyRepairRequests } from "@/features/customer/repairRequest/hooks/useRepairRequest";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import { useCurrency } from "@/hooks/useCurrency";

// API instance
import { api } from "@/lib/api";

// PDF Document
import CheckoutInvoicePDF from "./CheckoutInvoicePDF";
import ReturnInvoiceModal from "./ReturnInvoiceModal";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Checkout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const shopkeeperId = (session?.user as { id?: string })?.id;

  // Data fetching queries
  const { data: profileData } = useMyProfile();
  const { currency, formatCurrency } = useCurrency();
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategories();
  const { data: inventoryData, isLoading: isInventoryLoading } =
    useMyInventory();
  const { data: cartData, isLoading: isCartLoading } =
    useShopkeeperCart(shopkeeperId);
  const { data: repairRequestsData } = useGetMyRepairRequests();
  const { data: customersResponse } = useCustomersByShopkeeper(
    shopkeeperId || "",
  );

  // Mutations
  const { mutateAsync: deleteCartItem } = useDeleteCartItem(shopkeeperId);
  const { mutateAsync: deleteAllCartItems } =
    useDeleteAllShopkeeperCartItems(shopkeeperId);
  const { mutateAsync: createInvoice } = useCreateInvoice();
  const createCustomerMutation = useCreateCustomer();

  // Local States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [checkoutMode, setCheckoutMode] = useState<
    "walk-in" | "repair" | "delivery" | "online" | "return"
  >("walk-in");
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isCustomerSelectorOpen, setIsCustomerSelectorOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [customerDiscount, setCustomerDiscount] = useState<{
    id?: string;
    discountName?: string;
    percentage: number;
  } | null>(null);
  const [onlineOrderDetails, setOnlineOrderDetails] = useState({
    marketplace: "",
    orderNumber: "",
    paymentMethod: "online" as "cash" | "online" | "card",
  });
  const [deliveryDetails, setDeliveryDetails] = useState({
    from: "",
    deliveryTo: "",
    paymentMethod: "cash-on-delivery" as
      | "cash-on-delivery"
      | "cash"
      | "online"
      | "card",
    selectedCartItemIds: [] as string[],
  });

  // Local item quantities (for Browse Inventory cards)
  const [localQuantities, setLocalQuantities] = useState<
    Record<string, number>
  >({});
  const [addingItemId, setAddingItemId] = useState<string | null>(null);

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // ─── Data parsing ─────────────────────────────────────────────────────────
  const categories = useMemo(
    () => categoriesData?.data || [],
    [categoriesData],
  );
  const inventoryItems = useMemo(() => {
    return (inventoryData?.data || []).filter(
      (item: any) => item.type === "inventory",
    );
  }, [inventoryData]);

  const cartItems = useMemo(() => cartData?.data || [], [cartData]);

  const cartItemIds = useMemo(
    () => cartItems.map((item: any) => item._id).filter(Boolean),
    [cartItems],
  );

  useEffect(() => {
    setDeliveryDetails((prev) => {
      const existingSelectedIds = prev.selectedCartItemIds.filter((id) =>
        cartItemIds.includes(id),
      );
      const newCartItemIds = cartItemIds.filter(
        (id) => !prev.selectedCartItemIds.includes(id),
      );
      const nextSelectedCartItemIds = [
        ...existingSelectedIds,
        ...newCartItemIds,
      ];

      if (
        nextSelectedCartItemIds.length === prev.selectedCartItemIds.length &&
        nextSelectedCartItemIds.every(
          (id, index) => id === prev.selectedCartItemIds[index],
        )
      ) {
        return prev;
      }

      return {
        ...prev,
        selectedCartItemIds: nextSelectedCartItemIds,
      };
    });
  }, [cartItemIds]);

  const repairRequests = useMemo(() => {
    return (repairRequestsData?.data || []).filter(
      (req: any) => req.status === "completed" || req.status === "approved",
    );
  }, [repairRequestsData]);

  const customers = useMemo(
    () => customersResponse?.data || [],
    [customersResponse],
  );

  const selectedCustomerId =
    selectedCustomer?._id || selectedCustomer?.id || "";

  const { data: customerDiscountsResponse } = useQuery({
    queryKey: ["customer-discounts", selectedCustomerId],
    queryFn: async () => {
      const response = await api.get(
        `/customer-discounts/customer/${selectedCustomerId}`,
      );
      return response.data;
    },
    enabled: !!selectedCustomerId,
  });

  // Filters for Browse Inventory
  const filteredInventory = useMemo(() => {
    let items = inventoryItems;

    // Filter by selected category pill
    if (selectedCategory) {
      if (selectedCategory === "repairing") {
        // filter repairing items (case insensitive currentState or category check)
        items = items.filter(
          (item: any) =>
            item.categoryId?.name?.toLowerCase() === "repairing" ||
            item.categoryId?._id === "repairing" ||
            item.currentState === "repairing",
        );
      } else {
        items = items.filter(
          (item: any) => item.categoryId?._id === selectedCategory,
        );
      }
    }

    // Filter by search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      items = items.filter(
        (item: any) =>
          item.itemName?.toLowerCase().includes(q) ||
          item.brand?.toLowerCase().includes(q) ||
          item.imeiNumber?.toLowerCase().includes(q) ||
          item.sku?.toLowerCase().includes(q),
      );
    }

    return items;
  }, [inventoryItems, selectedCategory, searchQuery]);

  // Filtered customer list for combobox
  const filteredCustomers = useMemo(() => {
    const q = customerSearchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c: any) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q),
    );
  }, [customers, customerSearchQuery]);

  // ─── Calculations ──────────────────────────────────────────────────────────
  const orderCartItems = useMemo(() => {
    if (checkoutMode !== "delivery") return cartItems;

    return cartItems.filter((item: any) =>
      deliveryDetails.selectedCartItemIds.includes(item._id),
    );
  }, [cartItems, checkoutMode, deliveryDetails.selectedCartItemIds]);

  const subtotal = useMemo(() => {
    return orderCartItems.reduce((sum, item) => {
      const price = item.itemId?.expectedPrice || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [orderCartItems]);

  const selectedCustomerDiscount = useMemo(() => {
    const discounts = customerDiscountsResponse?.data || [];

    if (!Array.isArray(discounts)) return null;

    const activeDiscounts = discounts.filter((discount: any) => {
      if (discount.status !== "active") return false;
      if ((discount.usageLimit ?? 1) <= 0) return false;

      const validFrom = discount.validFrom
        ? new Date(discount.validFrom)
        : null;
      const validUntil = discount.until ? new Date(discount.until) : null;
      const now = new Date();

      if (validFrom && validFrom > now) return false;
      if (validUntil && validUntil < now) return false;

      return true;
    });

    if (!activeDiscounts.length) return null;

    return activeDiscounts.reduce((best: any, current: any) => {
      if (!best || Number(current.percentage) > Number(best.percentage)) {
        return current;
      }
      return best;
    }, null);
  }, [customerDiscountsResponse]);

  useEffect(() => {
    if (!selectedCustomerDiscount) {
      setCustomerDiscount(null);
      return;
    }

    setCustomerDiscount({
      id: selectedCustomerDiscount._id,
      discountName: selectedCustomerDiscount.discountName,
      percentage: Number(selectedCustomerDiscount.percentage || 0),
    });
  }, [selectedCustomerDiscount]);

  const discountAmount = useMemo(() => {
    if (!customerDiscount?.percentage) return 0;
    return subtotal * (customerDiscount.percentage / 100);
  }, [customerDiscount, subtotal]);

  const discountedSubtotal = useMemo(() => {
    return Math.max(subtotal - discountAmount, 0);
  }, [subtotal, discountAmount]);

  const tax = useMemo(() => discountedSubtotal * 0.085, [discountedSubtotal]); // 8.5% tax
  const totalPayment = useMemo(
    () => discountedSubtotal + tax,
    [discountedSubtotal, tax],
  );
  const totalCartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  // ─── Cart Action Handlers ──────────────────────────────────────────────────
  const handleAddToCart = async (itemId: string, qtyToAdd: number) => {
    if (!shopkeeperId) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    try {
      setAddingItemId(itemId);
      await api.post("/add-to-cart/create", {
        shopkeeperId,
        itemId,
        quantity: qtyToAdd,
      });

      // Invalidate query to refetch cart
      queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.shopkeeperCart(shopkeeperId),
      });

      toast.success("Added to cart");
      // Reset local quantity count
      setLocalQuantities((prev) => ({ ...prev, [itemId]: 1 }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to add item to cart");
    } finally {
      setAddingItemId(null);
    }
  };

  const handleUpdateCartQty = async (
    cartItemId: string,
    itemId: string,
    currentQty: number,
    delta: number,
  ) => {
    if (!shopkeeperId) return;

    if (currentQty + delta <= 0) {
      // Delete item
      try {
        await deleteCartItem(cartItemId);
        toast.success("Item removed from cart");
      } catch (err) {
        toast.error("Failed to remove item");
      }
      return;
    }

    try {
      await api.post("/add-to-cart/create", {
        shopkeeperId,
        itemId,
        quantity: delta,
      });

      queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.shopkeeperCart(shopkeeperId),
      });
    } catch (err) {
      toast.error("Failed to adjust quantity");
    }
  };

  const handleDeleteCartItem = async (cartItemId: string) => {
    try {
      await deleteCartItem(cartItemId);
      toast.success("Item removed from cart");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handleClearOrder = async () => {
    if (cartItems.length === 0) return;
    if (!confirm("Are you sure you want to clear the current order?")) return;

    try {
      await deleteAllCartItems();
      setSelectedCustomer(null);
      toast.success("Order details cleared");
    } catch (err) {
      toast.error("Failed to clear order");
    }
  };

  // ─── Customer Helpers ──────────────────────────────────────────────────────
  const handleRegisterCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.firstName || !newCustomer.phone) {
      toast.error("First Name and Phone are required");
      return;
    }
    if (!shopkeeperId) return;

    try {
      const res = await createCustomerMutation.mutateAsync({
        ...newCustomer,
        shopkeeperId,
      });

      if (res?.data) {
        setSelectedCustomer(res.data);
        setIsNewCustomerModalOpen(false);
        setIsCustomerSelectorOpen(false);
        setNewCustomer({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
        });
        toast.success("Customer registered successfully");
      }
    } catch (err) {
      toast.error("Failed to register customer");
    }
  };

  // ─── Ready for Collection Handler ──────────────────────────────────────────
  const handlePullRepairOrder = (req: any) => {
    // Set customer
    const requestCustomer = {
      firstName: req.firstName || "Customer",
      lastName: req.lastName || "",
      email: req.email || "",
      phone: req.phoneNumber || "",
      address: req.description || "",
    };
    setSelectedCustomer(requestCustomer);
    setCheckoutMode("repair");

    // Add service to checkout list
    // Find if we have a service item in our inventory
    const serviceItem = inventoryItems.find(
      (item: any) =>
        item.itemName?.toLowerCase().includes("repair") ||
        item.categoryId?.name?.toLowerCase() === "repairing",
    );

    if (serviceItem) {
      handleAddToCart(serviceItem._id, 1);
      toast.success(`Pulled Order #${req._id.slice(-8)} into checkout`);
    } else {
      toast.info(
        `Pulled Customer ${req.firstName} into checkout. Add items manually.`,
      );
    }
  };

  // ─── Place Order (Receipt Generation & Completion) ─────────────────────────
  const handlePlaceOrder = async () => {
    if (checkoutMode === "return") {
      setIsReturnModalOpen(true);
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Cannot place order. Cart is empty!");
      return;
    }
    if (!shopkeeperId) {
      toast.error("Session expired");
      return;
    }
    if (checkoutMode === "online") {
      if (!onlineOrderDetails.marketplace.trim()) {
        toast.error("Marketplace name is required for online orders");
        return;
      }
      if (!onlineOrderDetails.orderNumber.trim()) {
        toast.error("Order number is required for online orders");
        return;
      }
    }
    if (checkoutMode === "delivery") {
      if (!deliveryDetails.from.trim()) {
        toast.error("Delivery from location is required");
        return;
      }
      if (!deliveryDetails.deliveryTo.trim()) {
        toast.error("Delivery to location is required");
        return;
      }
      if (orderCartItems.length === 0) {
        toast.error("Select at least one item for delivery");
        return;
      }
    }

    try {
      setIsPlacingOrder(true);
      const invoiceNumber = `REC-${Date.now().toString().slice(-6)}`;
      const onlineOrderMeta =
        checkoutMode === "online"
          ? {
              marketplace: onlineOrderDetails.marketplace.trim(),
              orderNumber: onlineOrderDetails.orderNumber.trim(),
              paymentMethod: onlineOrderDetails.paymentMethod,
            }
          : null;
      const deliveryOrderMeta =
        checkoutMode === "delivery"
          ? {
              from: deliveryDetails.from.trim(),
              deliveryTo: deliveryDetails.deliveryTo.trim(),
              paymentMethod: deliveryDetails.paymentMethod,
              selectedCartItemIds: deliveryDetails.selectedCartItemIds,
            }
          : null;
      const fallbackCustomer = {
        firstName: checkoutMode === "delivery" ? "Delivery" : "Online",
        lastName: "Customer",
        email: "",
        phone: "",
        address: "",
      };
      const customerInfoPayload =
        onlineOrderMeta || deliveryOrderMeta
          ? JSON.stringify({
              ...(selectedCustomer || fallbackCustomer),
              onlineOrder: onlineOrderMeta,
              deliveryOrder: deliveryOrderMeta,
            })
          : selectedCustomer
            ? JSON.stringify(selectedCustomer)
            : "Walk-in";
      const invoiceType = onlineOrderMeta
        ? `ONLINE Receipt - ${onlineOrderMeta.marketplace} #${onlineOrderMeta.orderNumber}`
        : deliveryOrderMeta
          ? `DELIVERY Receipt - ${deliveryOrderMeta.from} to ${deliveryOrderMeta.deliveryTo}`
          : `${checkoutMode.toUpperCase()} Receipt`;
      const paymentMethod =
        deliveryOrderMeta?.paymentMethod ||
        onlineOrderMeta?.paymentMethod ||
        checkoutMode;

      // Generate QRCode
      const qrCodeDataUrl = await QRCode.toDataURL(
        JSON.stringify({
          invoiceNumber,
          shopkeeperId,
          total: totalPayment.toFixed(2),
          items: orderCartItems.length,
          payment: paymentMethod,
          onlineOrder: onlineOrderMeta,
          deliveryOrder: deliveryOrderMeta,
        }),
        { margin: 1, width: 200 },
      );

      // Generate invoice PDF Blob
      const doc = (
        <CheckoutInvoicePDF
          cartItems={orderCartItems}
          invoiceNumber={invoiceNumber}
          qrCodeDataUrl={qrCodeDataUrl}
          shopkeeper={profileData?.data}
          customer={selectedCustomer}
          paymentMethod={paymentMethod}
          subtotal={subtotal}
          discountAmount={discountAmount}
          discountPercentage={customerDiscount?.percentage}
          discountLabel={customerDiscount?.discountName}
          tax={tax}
          total={totalPayment}
          currency={currency}
        />
      );

      const blob = await pdf(doc).toBlob();
      const fileName = `${invoiceNumber}-receipt.pdf`;
      const invoiceFile = new File([blob], fileName, {
        type: "application/pdf",
      });

      // Call createInvoice API
      const itemsIds = orderCartItems
        .map((c: any) => c.itemId?._id)
        .filter(Boolean);
      await createInvoice({
        shopkeeperId,
        type: invoiceType,
        invoice: invoiceFile,
        customerInfo: customerInfoPayload,
        itemsIds,
        dueAmount: 0, // fully paid
        discountName: customerDiscount?.discountName,
        discountPercentage: customerDiscount?.percentage,
        discountAmount,
      });

      // Download file locally
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      // Clear completed items from the shopkeeper cart.
      if (deliveryOrderMeta) {
        await Promise.all(
          orderCartItems.map((cartItem: any) => deleteCartItem(cartItem._id)),
        );
      } else {
        await deleteAllCartItems();
      }
      setSelectedCustomer(null);
      setOnlineOrderDetails({
        marketplace: "",
        orderNumber: "",
        paymentMethod: "online",
      });
      setDeliveryDetails((prev) => ({
        ...prev,
        from: "",
        deliveryTo: "",
        paymentMethod: "cash-on-delivery",
        selectedCartItemIds: [],
      }));

      toast.success("Order Placed Successfully! Receipt Downloaded.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to process checkout transaction.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Helper to adjust browse card local qty state
  const handleLocalQtyChange = (itemId: string, delta: number) => {
    setLocalQuantities((prev) => {
      const current = prev[itemId] || 1;
      const next = current + delta;
      return { ...prev, [itemId]: next < 1 ? 1 : next };
    });
  };

  // Helper buttons for Services/Products
  const handleAddProductClick = () => {
    setSelectedCategory(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    toast.info("Browse or search inventory items below!");
  };

  const handleAddServiceClick = () => {
    // Find category ID for Repairing
    const repairingCat = categories.find((cat: any) =>
      cat.name?.toLowerCase().includes("repair"),
    );
    if (repairingCat) {
      setSelectedCategory(repairingCat._id);
    } else {
      setSelectedCategory("repairing");
    }
    toast.info("Showing repair services from inventory!");
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-6 max-w-[1600px] mx-auto font-poppins min-h-[calc(100vh-80px)] bg-[#FAF9F6] text-slate-800">
      {/* ─── LEFT PANEL (Inventory & Repair Requests) ─── */}
      <div className="flex-1 space-y-6 min-w-0">
        {/* Repair Orders Ready for Collection */}
        {repairRequests.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#84CC16]/10 text-[#84CC16]">
                  <Wrench size={16} />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Orders Ready for Collection
                </h2>
                <span className="flex items-center justify-center h-6 min-w-6 px-1.5 text-xs font-black text-white bg-[#84CC16] rounded-full">
                  {repairRequests.length}
                </span>
              </div>
              <button
                onClick={() => router.push("/shopkeeper/repair-requests")}
                className="text-xs font-black text-[#84CC16] hover:underline"
              >
                View Orders
              </button>
            </div>

            <p className="text-xs font-medium text-slate-500 mb-4">
              These repair orders have been completed by technicians. Pull
              orders into checkout for customer payment.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repairRequests.slice(0, 4).map((req: any) => (
                <div
                  key={req._id}
                  onClick={() => handlePullRepairOrder(req)}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[#84CC16]/40 hover:bg-[#84CC16]/5 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 group-hover:text-[#84CC16] transition-colors">
                      <Wrench size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-950 truncate">
                        Order #{req._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-[11px] font-bold text-slate-500 truncate capitalize">
                        {req.deviceModel} ({req.firstName})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(req.updatedAt).toLocaleDateString()}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Browse Inventory */}
        <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Browse Inventory
            </h2>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, services..."
                className="w-full h-10 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all"
              />
            </div>
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 text-xs font-black rounded-full transition-all shrink-0 ${
                selectedCategory === null
                  ? "bg-[#84CC16] text-white shadow shadow-lime-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-4 py-2 text-xs font-black rounded-full transition-all shrink-0 ${
                  selectedCategory === cat._id
                    ? "bg-[#84CC16] text-white shadow shadow-lime-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
            <button
              onClick={() => setSelectedCategory("repairing")}
              className={`px-4 py-2 text-xs font-black rounded-full transition-all shrink-0 ${
                selectedCategory === "repairing"
                  ? "bg-[#84CC16] text-white shadow shadow-lime-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Repairing
            </button>
          </div>

          {/* Product Grid */}
          {isInventoryLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-44 bg-slate-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredInventory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
              {filteredInventory.map((item: any) => {
                const qty = localQuantities[item._id] || 1;
                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
                  >
                    {/* Item Image */}
                    <div className="relative w-full h-32 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                      {item.image?.url ? (
                        <Image
                          src={item.image.url}
                          alt={item.itemName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-slate-350" />
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 space-y-1">
                      <p className="text-[13px] font-black text-slate-900 leading-snug line-clamp-1">
                        {item.itemName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 capitalize">
                        {item.categoryId?.name || item.brand || "Product"}
                      </p>
                    </div>

                    {/* Price and Add Row */}
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-[15px] font-black text-slate-900">
                        {formatCurrency(item.expectedPrice)}
                      </p>

                      {/* Quantity select & Add */}
                      <div className="flex items-center gap-2">
                        {/* Qty count adjuster */}
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                          <button
                            onClick={() => handleLocalQtyChange(item._id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs font-black">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleLocalQtyChange(item._id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Add Circle button */}
                        <button
                          onClick={() => handleAddToCart(item._id, qty)}
                          disabled={addingItemId === item._id}
                          className="w-8 h-8 rounded-full bg-[#84CC16] text-white flex items-center justify-center hover:bg-[#74b313] active:scale-95 shadow shadow-lime-500/25 transition-all"
                        >
                          {addingItemId === item._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Plus size={16} strokeWidth={3} />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <Package size={36} className="text-slate-350 mb-3" />
              <p className="text-sm font-black text-slate-700">
                No inventory products found
              </p>
              <p className="text-xs font-medium text-slate-500">
                Create items in the Inventory tab or check filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT PANEL (Order Details Sidebar) ─── */}
      <div className="w-full xl:w-[420px] bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm flex flex-col shrink-0 min-h-[calc(100vh-120px)]">
        {/* Order Details Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Order Details
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {totalCartCount} items in list
            </p>
          </div>
          <button
            onClick={handleClearOrder}
            disabled={cartItems.length === 0}
            className="text-xs font-black text-red-500 hover:text-red-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Clear Order
          </button>
        </div>

        {/* Checkout Modes (Walk-In, Repair, Delivery, Online, Return) */}
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl mt-4">
          {(["walk-in", "repair", "delivery", "online", "return"] as const).map(
            (mode) => (
              <button
                key={mode}
                onClick={() => {
                  setCheckoutMode(mode);
                  if (mode === "return") {
                    setIsReturnModalOpen(true);
                  }
                }}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  checkoutMode === mode
                    ? "bg-[#84CC16] text-white shadow shadow-lime-500/20"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {mode}
              </button>
            ),
          )}
        </div>

        <ReturnInvoiceModal
          open={isReturnModalOpen}
          onOpenChange={setIsReturnModalOpen}
          shopkeeperId={shopkeeperId}
        />

        {/* Customer Select / Card */}
        <div className="mt-4">
          <div
            onClick={() => setIsCustomerSelectorOpen(true)}
            className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-200 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 text-slate-600">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-0.5">
                  Customer
                </p>
                {selectedCustomer ? (
                  <p className="text-sm font-black text-slate-950 truncate">
                    {selectedCustomer.firstName}{" "}
                    {selectedCustomer.lastName || ""}
                  </p>
                ) : (
                  <p className="text-sm font-black text-slate-400">
                    Select Customer
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {selectedCustomer && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCustomer(null);
                  }}
                  className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-355 text-slate-500 flex items-center justify-center X"
                >
                  <X size={10} />
                </button>
              )}
              <ChevronRight
                size={16}
                className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
              />
            </div>
          </div>
        </div>

        {/* Itemized Cart List */}
        <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar space-y-3 mt-6 pr-1">
          {isCartLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-slate-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : cartItems.length > 0 ? (
            cartItems.map((cartItem: any) => {
              const item = cartItem.itemId;
              const price = item?.expectedPrice || 0;
              const lineTotal = price * cartItem.quantity;
              return (
                <div
                  key={cartItem._id}
                  className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-2xl hover:shadow-sm transition-all"
                >
                  {/* Item Image and Title */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-11 h-11 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                      {item?.image?.url ? (
                        <Image
                          src={item.image.url}
                          alt={item.itemName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate leading-snug">
                        {item?.itemName || "Custom Item"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 truncate">
                        {item?.brand || "Brand"} - {item?.currentState || "New"}
                      </p>
                      <p className="text-xs font-black text-slate-950 mt-1">
                        {formatCurrency(price)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity adjustment & Remove */}
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <button
                      onClick={() => handleDeleteCartItem(cartItem._id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>

                    <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-200">
                      <button
                        onClick={() =>
                          handleUpdateCartQty(
                            cartItem._id,
                            item?._id,
                            cartItem.quantity,
                            -1,
                          )
                        }
                        className="w-5.5 h-5.5 flex items-center justify-center text-slate-500 hover:text-slate-800"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-6 text-center text-xs font-black">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateCartQty(
                            cartItem._id,
                            item?._id,
                            cartItem.quantity,
                            1,
                          )
                        }
                        className="w-5.5 h-5.5 flex items-center justify-center text-slate-500 hover:text-slate-800"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <ShoppingCart size={32} className="text-slate-300 mb-2" />
              <p className="text-xs font-black">Cart is empty</p>
              <p className="text-[10px] font-medium mt-1">
                Add items from the inventory to sell.
              </p>
            </div>
          )}
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6 border-t border-slate-100 pt-5">
          <button
            onClick={handleAddServiceClick}
            className="flex items-center justify-center gap-1.5 py-3 border border-slate-200 rounded-2xl text-xs font-black text-slate-700 hover:border-[#84CC16] hover:bg-lime-50/20 transition-all active:scale-[0.98]"
          >
            <Plus size={14} className="text-[#84CC16]" strokeWidth={3} />
            Add Service
          </button>
          <button
            onClick={handleAddProductClick}
            className="flex items-center justify-center gap-1.5 py-3 border border-slate-200 rounded-2xl text-xs font-black text-slate-700 hover:border-[#84CC16] hover:bg-lime-50/20 transition-all active:scale-[0.98]"
          >
            <Plus size={14} className="text-[#84CC16]" strokeWidth={3} />
            Add Product
          </button>
        </div>

        {checkoutMode === "delivery" && (
          <div className="mt-4 rounded-2xl border border-slate-150 bg-slate-50 p-4 space-y-3">
            <div>
              <p className="text-xs font-black text-slate-900">
                Delivery Details
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-slate-500">
                Record local delivery route, delivered items, and completed
                payment.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  From
                </label>
                <Input
                  value={deliveryDetails.from}
                  onChange={(event) =>
                    setDeliveryDetails((prev) => ({
                      ...prev,
                      from: event.target.value,
                    }))
                  }
                  placeholder="Store, warehouse, pickup address..."
                  className="h-10 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Delivery To
                </label>
                <Input
                  value={deliveryDetails.deliveryTo}
                  onChange={(event) =>
                    setDeliveryDetails((prev) => ({
                      ...prev,
                      deliveryTo: event.target.value,
                    }))
                  }
                  placeholder="Customer address or delivery destination"
                  className="h-10 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Items Being Delivered
                </label>
                <span className="text-[10px] font-black text-slate-400">
                  {deliveryDetails.selectedCartItemIds.length}/
                  {cartItems.length}
                </span>
              </div>

              <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                {cartItems.length > 0 ? (
                  cartItems.map((cartItem: any) => {
                    const item = cartItem.itemId;
                    const checked =
                      deliveryDetails.selectedCartItemIds.includes(
                        cartItem._id,
                      );

                    return (
                      <label
                        key={cartItem._id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                          checked
                            ? "border-[#84CC16] bg-lime-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setDeliveryDetails((prev) => ({
                              ...prev,
                              selectedCartItemIds: checked
                                ? prev.selectedCartItemIds.filter(
                                    (id) => id !== cartItem._id,
                                  )
                                : [...prev.selectedCartItemIds, cartItem._id],
                            }))
                          }
                          className="h-4 w-4 accent-[#84CC16]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black text-slate-900">
                            {item?.itemName || "Custom Item"}
                          </p>
                          <p className="text-[10px] font-bold text-slate-500">
                            Qty {cartItem.quantity} •{" "}
                            {formatCurrency(Number(item?.expectedPrice || 0))}
                          </p>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-center text-xs font-bold text-slate-400">
                    Add items to the cart before creating a delivery.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Payment Completed By
              </label>
              <select
                value={deliveryDetails.paymentMethod}
                onChange={(event) =>
                  setDeliveryDetails((prev) => ({
                    ...prev,
                    paymentMethod: event.target.value as
                      | "cash-on-delivery"
                      | "cash"
                      | "online"
                      | "card",
                  }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-800 outline-none focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20"
              >
                <option value="cash-on-delivery">Cash on Delivery</option>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>
        )}

        {checkoutMode === "online" && (
          <div className="mt-4 rounded-2xl border border-slate-150 bg-slate-50 p-4 space-y-3">
            <div>
              <p className="text-xs font-black text-slate-900">
                Online Order Trace
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-slate-500">
                Save marketplace and order details for later invoice history
                lookup.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Marketplace
              </label>
              <Input
                value={onlineOrderDetails.marketplace}
                onChange={(event) =>
                  setOnlineOrderDetails((prev) => ({
                    ...prev,
                    marketplace: event.target.value,
                  }))
                }
                placeholder="eBay, Amazon, Walmart..."
                className="h-10 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Order Number
              </label>
              <Input
                value={onlineOrderDetails.orderNumber}
                onChange={(event) =>
                  setOnlineOrderDetails((prev) => ({
                    ...prev,
                    orderNumber: event.target.value,
                  }))
                }
                placeholder="Marketplace order ID"
                className="h-10 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Payment
              </label>
              <select
                value={onlineOrderDetails.paymentMethod}
                onChange={(event) =>
                  setOnlineOrderDetails((prev) => ({
                    ...prev,
                    paymentMethod: event.target.value as
                      | "cash"
                      | "online"
                      | "card",
                  }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-800 outline-none focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20"
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>
        )}

        {/* Calculations / Summary */}
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2 mt-4 text-xs font-bold text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-slate-900">{formatCurrency(subtotal)}</span>
          </div>
          {customerDiscount?.percentage ? (
            <div className="flex justify-between text-emerald-600">
              <span>
                Discount ({customerDiscount.percentage}%){" "}
                {customerDiscount.discountName
                  ? `• ${customerDiscount.discountName}`
                  : ""}
              </span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span>Tax (8.5%)</span>
            <span className="text-slate-900">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200/60 pt-2 mt-2">
            <span>Total Payment</span>
            <span className="text-[#84CC16]">
              {formatCurrency(totalPayment)}
            </span>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={cartItems.length === 0 || isPlacingOrder}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#84CC16] text-white text-sm font-black shadow-lg shadow-lime-500/20 transition-all hover:bg-[#75b213] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none mt-4 w-full"
        >
          {isPlacingOrder ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <ShoppingCart size={16} strokeWidth={2.5} />
              <span>Place Order</span>
            </>
          )}
        </button>
      </div>

      {/* ─── CUSTOMER SELECTOR DIALOG ─── */}
      <Dialog
        open={isCustomerSelectorOpen}
        onOpenChange={setIsCustomerSelectorOpen}
      >
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 font-poppins border-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              Select Customer
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Choose a registered customer or add a new customer to this POS
              receipt.
            </DialogDescription>
          </DialogHeader>

          {/* Search bar & Register Button */}
          <div className="flex items-center gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                placeholder="Search customers..."
                className="w-full h-11 pl-10 pr-4 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-[#84CC16] transition-all"
              />
            </div>
            <button
              onClick={() => setIsNewCustomerModalOpen(true)}
              className="flex items-center justify-center gap-1.5 h-11 px-4 bg-[#84CC16] text-white rounded-xl text-xs font-black shadow shadow-lime-500/25 hover:bg-[#74b313] transition-all shrink-0"
            >
              <UserPlus size={14} />
              <span>New</span>
            </button>
          </div>

          {/* Customer list container */}
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar mt-4 space-y-2 pr-1">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c: any) => {
                const isSelected =
                  selectedCustomer && selectedCustomer.phone === c.phone;
                return (
                  <div
                    key={c._id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setIsCustomerSelectorOpen(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer border transition-all ${
                      isSelected
                        ? "bg-[#84CC16]/5 border-[#84CC16]"
                        : "bg-slate-50 border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-black text-slate-600 uppercase">
                        {c.firstName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 leading-tight truncate">
                          {c.firstName} {c.lastName || ""}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5 truncate">
                          {c.phone || "No phone"} • {c.email || "No email"}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check
                        size={16}
                        className="text-[#84CC16] shrink-0 ml-2"
                        strokeWidth={3}
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400">
                <AlertCircle
                  size={24}
                  className="mx-auto mb-2 text-slate-300"
                />
                <p className="text-xs font-black">No customers found</p>
                <p className="text-[10px] font-medium mt-1">
                  Register a new customer using the button above.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── REGISTER NEW CUSTOMER DIALOG ─── */}
      <Dialog
        open={isNewCustomerModalOpen}
        onOpenChange={setIsNewCustomerModalOpen}
      >
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 font-poppins border-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              Register New Customer
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Create a customer profile. They will be saved to your dashboard
              list.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterCustomer} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  First Name *
                </label>
                <Input
                  required
                  placeholder="First name"
                  value={newCustomer.firstName}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      firstName: e.target.value,
                    })
                  }
                  className="rounded-xl h-11 border-slate-200 text-xs font-bold focus-visible:ring-[#84CC16]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Last Name
                </label>
                <Input
                  placeholder="Last name"
                  value={newCustomer.lastName}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, lastName: e.target.value })
                  }
                  className="rounded-xl h-11 border-slate-200 text-xs font-bold focus-visible:ring-[#84CC16]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
                className="rounded-xl h-11 border-slate-200 text-xs font-bold focus-visible:ring-[#84CC16]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Phone Number *
              </label>
              <Input
                required
                type="text"
                placeholder="+1 234 567 8900"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                className="rounded-xl h-11 border-slate-200 text-xs font-bold focus-visible:ring-[#84CC16]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Billing Address
              </label>
              <Input
                placeholder="123 Street Name, City"
                value={newCustomer.address}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
                className="rounded-xl h-11 border-slate-200 text-xs font-bold focus-visible:ring-[#84CC16]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="rounded-xl h-11 text-xs font-black px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCustomerMutation.isPending}
                className="rounded-xl h-11 bg-[#84CC16] hover:bg-[#74b313] text-white text-xs font-black px-6 shadow shadow-lime-500/20 border-none"
              >
                {createCustomerMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Register"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
