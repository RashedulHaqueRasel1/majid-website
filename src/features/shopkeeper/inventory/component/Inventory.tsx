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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useMyInventory, useDeleteInventory } from "../hooks/useInventory";
import {
  useMySoldProducts,
  useDeleteSoldProduct,
} from "../hooks/useSoldProducts";
import { InventorySkeleton } from "./skeletons/InventorySkeleton";
import { InventoryFormModal } from "./modals/InventoryFormModal";
import { InventoryDetailsModal } from "./modals/InventoryDetailsModal";
import { SoldProductFormModal } from "./modals/SoldProductFormModal";
import type { InventoryItem, SoldProduct } from "../types";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Inventory() {
  const { data: inventoryData, isLoading, isError } = useMyInventory();
  const { mutate: deleteItem } = useDeleteInventory();

  const { data: soldData, isLoading: isSoldLoading } = useMySoldProducts();
  const { mutate: deleteSold } = useDeleteSoldProduct();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSoldFormOpen, setIsSoldFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const items = useMemo(() => inventoryData?.data || [], [inventoryData]);
  const soldItems = useMemo(() => soldData?.data || [], [soldData]);

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
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteItem(id, {
        onSuccess: () => toast.success("Item deleted"),
        onError: () => toast.error("Delete failed"),
      });
    }
  };

  const handleDeleteSold = (id: string) => {
    if (window.confirm("Are you sure you want to delete this sold record?")) {
      deleteSold(id, {
        onSuccess: () => toast.success("Sold record deleted"),
        onError: () => toast.error("Delete failed"),
      });
    }
  };

  if (isLoading || isSoldLoading) return <InventorySkeleton />;
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
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-16 font-poppins relative">
      {/* Inventory Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            Inventory
          </h1>
          <p className="text-[#64748B] font-bold text-sm">
            {items.length} Items in Stock - ${totalValue.toLocaleString()} Total
            Revenue Potential
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 w-64 bg-white border border-slate-100 rounded-xl font-bold text-sm focus:ring-[#84CC16] focus:border-[#84CC16] outline-none transition"
            />
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stockItems.length > 0 ? (
          stockItems.map((item: InventoryItem, i: number) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative"
            >
              <div className="flex gap-6">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50 bg-slate-50">
                  {item.image?.url ? (
                    <Image
                      src={item.image.url}
                      alt={item.itemName}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
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
                      <h3 className="text-[15px] font-black text-[#0F172A] leading-tight">
                        {item.itemName}
                      </h3>
                      <p className="text-[11px] font-bold text-[#94A3B8] mt-1">
                        {item.imeiNumber || "No IMEI"}
                      </p>
                      <p className="text-[10px] font-medium text-[#CBD5E1] line-clamp-1">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </p>
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
                  </div>

                  <div className="flex items-end justify-between pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] font-bold text-gray-300 line-through">
                        ${(item.expectedPrice * 1.2).toFixed(0)}
                      </span>
                      <span className="text-xl font-black text-[#0F172A]">
                        ${item.expectedPrice.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#64748B]">
                      Qty : 1
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

      {/* Sold Items Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
              Sold Items
            </h2>
            <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mt-1">
              History of your sales and pending payments
            </p>
          </div>
          <button
            onClick={() => setIsSoldFormOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#84CC16] text-white font-black rounded-xl hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 active:scale-95 cursor-pointer"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Add Sold Items</span>
          </button>
        </div>

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                  Item Name
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                  IMEI Number
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                  Due Date
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                  Purchase Price
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                  Expected Price
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest text-center">
                  Quantity
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {soldItems.length > 0 ? (
                soldItems.map((item: SoldProduct) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-gray-100 overflow-hidden relative flex-shrink-0">
                          {item.image?.url ? (
                            <Image
                              src={item.image.url}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#0F172A]">
                            {item.name}
                          </p>
                          <p className="text-[10px] font-bold text-[#94A3B8] uppercase">
                            {item.model}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-[#64748B]">
                        {item.imeiNumber}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-[#64748B]">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-xs font-black text-[#64748B]">
                        ${item.purchasePrice}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-[#84CC16]">
                        ${item.expectedPrice}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-xs font-black text-[#0F172A]">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleDeleteSold(item._id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-bold text-sm">
                      No sold items recorded yet.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
        }}
        item={editingItem}
      />

      <SoldProductFormModal
        isOpen={isSoldFormOpen}
        onClose={() => setIsSoldFormOpen(false)}
      />
    </div>
  );
}
