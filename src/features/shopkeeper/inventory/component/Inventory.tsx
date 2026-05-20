"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  MoreVertical,
  Search,
  Eye,
  Trash2,
  Edit2,
  Package,
  ShoppingCart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  INVENTORY_KEYS,
  useMyInventory,
  useDeleteInventory,
  useShopkeeperCart,
} from "../hooks/useInventory";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/instance/axios-instance";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { InventorySkeleton } from "./skeletons/InventorySkeleton";
import { InventoryFormModal } from "./modals/InventoryFormModal";
import { InventoryDetailsModal } from "./modals/InventoryDetailsModal";
import type { InventoryItem } from "../types";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SELL_QUANTITY = 1;

export default function Inventory() {
  const { data: inventoryData, isLoading, isError } = useMyInventory();
  const { mutate: deleteItem } = useDeleteInventory();
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const shopkeeperId = (session?.user as { id?: string })?.id;
  const { data: cartData } = useShopkeeperCart(shopkeeperId);

  const cartItems = cartData?.data || [];
  const cartQuantity = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );

  const handleSell = async (item: InventoryItem) => {
    try {
      if (!shopkeeperId) {
        toast.error("Session not found");
        return;
      }

      const payload = {
        shopkeeperId,
        itemId: item._id,
        quantity: SELL_QUANTITY,
      };

      await axiosInstance.post("/add-to-cart/create", payload);
      queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.shopkeeperCart(shopkeeperId),
      });
      toast.success("Added for sale successfully");
    } catch (error) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to process sell action",
      );
    }
  };

  console.log(inventoryData);

  const items = useMemo(() => {
    return (inventoryData?.data || []).filter(
      (item: InventoryItem) => item.type === "inventory",
    );
  }, [inventoryData]);

  // Calculate total stock quantity
  const totalQuantity = useMemo(() => {
    return items.reduce(
      (sum: number, item: InventoryItem) => sum + (item.quantity || 0),
      0,
    );
  }, [items]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formForceType, setFormForceType] = useState<
    "inventory" | "sold" | undefined
  >(undefined);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter(
      (item: InventoryItem) =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.imeiNumber?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [items, searchQuery]);

  const stockItems = filteredItems;

  const totalValue = useMemo(() => {
    return items.reduce(
      (sum: number, item: InventoryItem) => sum + item.expectedPrice,
      0,
    );
  }, [items]);

  const handleDelete = (id: string) => {
    deleteItem(id, {
      onSuccess: () => toast.success("Item deleted"),
      onError: () => toast.error("Delete failed"),
    });
  };

  if (isLoading) return <InventorySkeleton />;
  if (isError)
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-red-500">
          Failed to load inventory
        </h2>
        <p className="text-slate-500">
          Please check your connection or login again.
        </p>
      </div>
    );

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-16 font-poppins relative dark:bg-background">
      {/* Inventory Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black dark:text-white text-[#0F172A] tracking-tight">
            Inventory
          </h1>
          <p className="text-[#64748B] font-bold text-sm dark:text-white ">
            {totalQuantity} Units in Stock ({items.length} Models) - $
            {totalValue.toLocaleString()} Total Revenue Potential
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/shopkeeper/cart")}
            className="relative flex h-12 items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 text-[#0F172A] shadow-sm transition hover:border-[#84CC16]/50 hover:bg-[#84CC16]/5 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
            aria-label="Open cart"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#84CC16]/10 text-[#84CC16] cursor-pointer">
              <ShoppingCart size={19} strokeWidth={2.6} />
              {cartQuantity > 0 && (
                <span className="absolute -right-2 -top-2 flex min-w-5 items-center justify-center rounded-full bg-[#84CC16] px-1.5 text-[10px] font-black leading-5 text-white shadow shadow-lime-500/30">
                  {cartQuantity}
                </span>
              )}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-black">Cart</span>
              <span className="block text-[10px] font-bold text-slate-400">
                {cartItems.length} item{cartItems.length === 1 ? "" : "s"}
              </span>
            </span>
          </button>
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 w-64 bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-600 dark:text-white rounded-xl font-bold text-sm focus:ring-[#84CC16] focus:border-[#84CC16] outline-none transition"
            />
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setFormForceType("inventory");
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#84CC16] text-white font-black rounded-xl hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 active:scale-95 cursor-pointer"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {stockItems.length > 0 ? (
          stockItems.map((item: InventoryItem, i: number) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[32px] p-6 border border-border shadow-sm dark:bg-card transition-all group relative "
            >
              <div className="flex gap-6">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50 bg-slate-50">
                  {item.image?.url ? (
                    <Image
                      src={item.image.url}
                      alt={item.itemName}
                      fill
                      className="object-cover transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Package size={40} />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[15px] font-black text-[#0F172A] leading-tight dark:text-white">
                        {item.itemName}
                      </h3>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                        {item.brand && (
                          <span className="text-[11px] font-bold text-[#84CC16]">
                            {item.brand}
                          </span>
                        )}
                        {item.storage && (
                          <span className="text-[11px] font-bold text-slate-400">
                            • {item.storage}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-[11px] font-bold text-slate-400">
                            • {item.color}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-[#94A3B8] mt-1 dark:text-gray-400">
                        {item.imeiNumber || item.sku || "No IMEI/SKU"}
                      </p>
                      {/* <p className="text-[10px] font-medium text-[#CBD5E1] line-clamp-1">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </p> */}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 bg-gray-50 text-gray-400 hover:text-[#84CC16] hover:bg-[#84CC16]/10 rounded-lg transition cursor-pointer"
                      >
                        <Eye size={16} strokeWidth={2.5} />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 text-gray-400 hover:text-[#0F172A] transition cursor-pointer">
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-xl border-slate-100 p-2 shadow-xl"
                        >
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingItem(item);
                              setFormForceType("inventory");
                              setIsFormOpen(true);
                            }}
                            className="flex items-center gap-2 p-3 font-bold text-xs rounded-lg cursor-pointer"
                          >
                            <Edit2 size={14} />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item._id)}
                            className="flex items-center gap-2 p-3 font-bold text-xs rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 size={14} />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-500">
                      {item.currentState}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#84CC16] text-white">
                      In Stock
                    </span>
                    <button
                      onClick={() => handleSell(item)}
                      className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#84CC16] text-white hover:bg-[#76b813] transition shadow shadow-lime-500/20 active:scale-95 cursor-pointer"
                    >
                      Sell
                    </button>
                  </div>

                  <div className="flex items-end justify-between pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] font-bold text-gray-300 line-through">
                        ${(item.expectedPrice * 1.2).toFixed(0)}
                      </span>
                      <span className="text-xl font-black text-[#0F172A] dark:text-white">
                        ${item.expectedPrice.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#64748B] dark:text-gray-400">
                      Qty : {item.quantity || 0}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-900">
              No items found
            </h3>
            <p className="text-slate-500 font-bold text-sm">
              Add your first item to get started
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <InventoryDetailsModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>

      {/* Form Modals */}
      <InventoryFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
          setFormForceType(undefined);
        }}
        item={editingItem}
        forceType={formForceType}
      />
    </div>
  );
}
