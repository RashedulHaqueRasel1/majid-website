"use client";

import React from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Minus, Search, Trash2 } from "lucide-react";
import {
  useCreateInvoice,
  useMyInventory,
} from "../../inventory/hooks/useInventory";
import { useGetMyRepairRequests } from "@/features/customer/repairRequest/hooks/useRepairRequest";
import { useSession } from "next-auth/react";
import { pdf } from "@react-pdf/renderer";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { toast } from "sonner";
import { useMyProfile } from "../../settings/hooks/useSettings";

// টাইপ ডেফিনিশনস
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  subtitle?: string;
}

interface CartItem {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  quantity: number;
  image: string;
  priceEditable?: boolean;
  type?: "inventory" | "repair";
}

interface RepairOption {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  image: string;
}

interface ShopkeeperProfile {
  shopName?: string;
  shopAddress?: string;
  phone?: string;
  whatsappNumber?: string;
}

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const invoicePdfStyles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: "#f8fafc",
    color: "#1f2937",
    fontSize: 9,
  },
  header: {
    backgroundColor: "#0f834f",
    color: "#ffffff",
    padding: 22,
    borderRadius: 14,
    marginBottom: 18,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
  },
  shopName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  mutedOnDark: {
    fontSize: 8,
    color: "#d1fae5",
    lineHeight: 1.5,
  },
  titleBox: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  invoiceMeta: {
    marginTop: 5,
    fontSize: 8,
    color: "#d1fae5",
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#111827",
    color: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 8,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  colItem: { width: "42%" },
  colType: { width: "15%", textAlign: "center" },
  colQty: { width: "10%", textAlign: "center" },
  colUnit: { width: "16%", textAlign: "right" },
  colTotal: { width: "17%", textAlign: "right" },
  itemName: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#111827",
  },
  itemMeta: {
    fontSize: 7.5,
    color: "#64748b",
    marginTop: 3,
    lineHeight: 1.4,
  },
  badge: {
    fontSize: 7,
    textTransform: "uppercase",
    color: "#0f834f",
    fontWeight: "bold",
  },
  amount: {
    fontWeight: "bold",
    color: "#111827",
  },
  summaryWrap: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  summary: {
    width: 230,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    color: "#64748b",
    fontWeight: "bold",
  },
  summaryValue: {
    color: "#111827",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f834f",
  },
  footer: {
    position: "absolute",
    left: 36,
    right: 36,
    bottom: 24,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    textAlign: "center",
    fontSize: 7.5,
    color: "#94a3b8",
  },
});

const currency = (value: number) => `£${Number(value || 0).toFixed(2)}`;

const CheckoutInvoicePDF = ({
  cart,
  shopkeeper,
  subtotal,
  depositPaid,
  totalDue,
}: {
  cart: CartItem[];
  shopkeeper?: ShopkeeperProfile;
  subtotal: number;
  depositPaid: number;
  totalDue: number;
}) => (
  <Document>
    <Page size="A4" style={invoicePdfStyles.page}>
      <View style={invoicePdfStyles.header}>
        <View style={invoicePdfStyles.headerTop}>
          <View>
            <Text style={invoicePdfStyles.shopName}>
              {shopkeeper?.shopName || "Majid Shop"}
            </Text>
            <Text style={invoicePdfStyles.mutedOnDark}>
              {shopkeeper?.shopAddress || "Repair and inventory checkout"}
            </Text>
            <Text style={invoicePdfStyles.mutedOnDark}>
              {shopkeeper?.phone || shopkeeper?.whatsappNumber || ""}
            </Text>
          </View>
          <View style={invoicePdfStyles.titleBox}>
            <Text style={invoicePdfStyles.invoiceTitle}>CHECKOUT INVOICE</Text>
            <Text style={invoicePdfStyles.invoiceMeta}>
              Date: {new Date().toLocaleDateString("en-GB")}
            </Text>
            <Text style={invoicePdfStyles.invoiceMeta}>
              Items: {cart.length}
            </Text>
          </View>
        </View>
      </View>

      <View style={invoicePdfStyles.section}>
        <Text style={invoicePdfStyles.sectionTitle}>Checkout Items</Text>
        <View style={invoicePdfStyles.tableHeader}>
          <Text style={invoicePdfStyles.colItem}>Item</Text>
          <Text style={invoicePdfStyles.colType}>Type</Text>
          <Text style={invoicePdfStyles.colQty}>Qty</Text>
          <Text style={invoicePdfStyles.colUnit}>Unit</Text>
          <Text style={invoicePdfStyles.colTotal}>Total</Text>
        </View>

        {cart.map((item) => (
          <View key={item.id} style={invoicePdfStyles.row}>
            <View style={invoicePdfStyles.colItem}>
              <Text style={invoicePdfStyles.itemName}>{item.name}</Text>
              {item.subtitle && (
                <Text style={invoicePdfStyles.itemMeta}>{item.subtitle}</Text>
              )}
            </View>
            <Text style={[invoicePdfStyles.colType, invoicePdfStyles.badge]}>
              {item.type === "repair" ? "Repair" : "Inventory"}
            </Text>
            <Text style={invoicePdfStyles.colQty}>
              {item.type === "repair" ? "-" : item.quantity}
            </Text>
            <Text style={invoicePdfStyles.colUnit}>{currency(item.price)}</Text>
            <Text style={[invoicePdfStyles.colTotal, invoicePdfStyles.amount]}>
              {currency(item.price * item.quantity)}
            </Text>
          </View>
        ))}
      </View>

      <View style={invoicePdfStyles.summaryWrap}>
        <View style={invoicePdfStyles.summary}>
          <View style={invoicePdfStyles.summaryRow}>
            <Text style={invoicePdfStyles.summaryLabel}>Subtotal</Text>
            <Text style={invoicePdfStyles.summaryValue}>
              {currency(subtotal)}
            </Text>
          </View>
          <View style={invoicePdfStyles.summaryRow}>
            <Text style={invoicePdfStyles.summaryLabel}>Deposit Paid</Text>
            <Text style={invoicePdfStyles.summaryValue}>
              -{currency(depositPaid)}
            </Text>
          </View>
          <View style={invoicePdfStyles.totalRow}>
            <Text style={invoicePdfStyles.totalLabel}>Total Due</Text>
            <Text style={invoicePdfStyles.totalValue}>
              {currency(totalDue)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={invoicePdfStyles.footer}>
        Thank you for your business. This invoice was generated from selected
        repair and inventory checkout items.
      </Text>
    </Page>
  </Document>
);

export default function CheckoutModal({
  open,
  onOpenChange,
}: CheckoutModalProps) {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [repairSearch, setRepairSearch] = React.useState("");
  const [isRepairSearchOpen, setIsRepairSearchOpen] = React.useState(false);
  const session = useSession();
  const shopkeeperId = session?.data?.user?.id;
  const { mutate: createInvoice, isPending } = useCreateInvoice();

  const { data: inventoryData, isLoading, isError } = useMyInventory();
  const { data: profileData } = useMyProfile();
  const { data: myRepairRequestsData, isLoading: isRepairRequestsLoading } =
    useGetMyRepairRequests();

  const repairRequests = myRepairRequestsData?.data || [];

  const products = React.useMemo<Product[]>(() => {
    return (inventoryData?.data || [])
      .filter((item) => item.type === "inventory")
      .map((item) => ({
        id: item._id,
        name: item.itemName || "Unnamed item",
        price: Number(item.expectedPrice || 0),
        image: item.image?.url || "/placeholder.png",
        subtitle:
          item.imeiNumber ||
          item.currentState ||
          item.brand ||
          item.productDetails ||
          undefined,
      }));
  }, [inventoryData]);

  const completedRepairs = React.useMemo<RepairOption[]>(() => {
    return repairRequests
      .filter((request) => request.status === "completed")
      .map((request) => {
        const notes = request.shopkeeperNotes || [];
        const price = notes.reduce(
          (sum, note) => sum + Number(note.cost || 0),
          0,
        );
        const firstImage = notes
          .flatMap((note) => note.images || [])
          .find((image) => image?.url)?.url;

        return {
          id: `repair:${request._id}`,
          name: `Repair - ${request.deviceModel || "Unknown device"}`,
          subtitle:
            request.firstName ||
            request.email ||
            request.IMEINumber ||
            request.description ||
            undefined,
          price,
          image: firstImage || "/placeholder.png",
        };
      });
  }, [repairRequests]);

  const selectedProductIds = React.useMemo(
    () => new Set(cart.map((item) => item.id)),
    [cart],
  );

  const filteredRepairs = React.useMemo(() => {
    const search = repairSearch.trim().toLowerCase();
    const selectedIds = new Set(cart.map((item) => item.id));

    return completedRepairs.filter((repair) => {
      if (selectedIds.has(repair.id)) return false;
      if (!search) return true;

      return [repair.name, repair.subtitle]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(search));
    });
  }, [cart, completedRepairs, repairSearch]);

  const depositPaid = 30.0;

  const updateQuantity = (id: string, amount: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id && item.type !== "repair"
            ? { ...item, quantity: Math.max(0, item.quantity + amount) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const toggleProduct = (product: Product) => {
    setCart((prev) => {
      const isSelected = prev.some((item) => item.id === product.id);

      if (isSelected) {
        return prev.filter((item) => item.id !== product.id);
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          subtitle: product.subtitle,
          price: product.price,
          quantity: 1,
          image: product.image,
          priceEditable: true,
          type: "inventory",
        },
      ];
    });
  };

  const updatePrice = (id: string, price: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.priceEditable
          ? { ...item, price: Math.max(0, price) }
          : item,
      ),
    );
  };

  const addRepairToCart = (repair: RepairOption) => {
    setCart((prev) => {
      const inventoryItems = prev.filter((item) => item.type !== "repair");

      return [
        ...inventoryItems,
        {
          id: repair.id,
          name: repair.name,
          subtitle: repair.subtitle,
          price: repair.price,
          quantity: 1,
          image: repair.image,
          priceEditable: false,
          type: "repair",
        },
      ];
    });
    setRepairSearch("");
    setIsRepairSearchOpen(false);
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalDue = Math.max(0, subtotal - depositPaid);

  const handleCreateInvoice = async () => {
    if (!cart.length) {
      toast.error("Please select at least one checkout item");
      return;
    }

    if (!shopkeeperId) {
      toast.error("Shopkeeper session not found");
      return;
    }

    try {
      const doc = (
        <CheckoutInvoicePDF
          cart={cart}
          shopkeeper={profileData?.data}
          subtotal={subtotal}
          depositPaid={depositPaid}
          totalDue={totalDue}
        />
      );
      const blob = await pdf(doc).toBlob();
      const file = new File([blob], `checkout_invoice_${Date.now()}.pdf`, {
        type: "application/pdf",
      });

      createInvoice(
        {
          shopkeeperId,
          type: "Checkout Invoice",
          invoice: file,
          itemsIds: cart
            .filter((item) => item.type === "inventory")
            .map((item) => item.id),
          dueAmount: totalDue,
        },
        {
          onSuccess: () => {
            toast.success("Checkout invoice created successfully");
            setCart([]);
            onOpenChange(false);
          },
          onError: () => toast.error("Failed to create checkout invoice"),
        },
      );
    } catch {
      toast.error("Failed to generate checkout PDF");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1200px] w-[1200px] max-h-[90vh] p-0 overflow-scroll bg-slate-50 gap-0 rounded-xl">
        <div className="flex h-full w-full divide-x divide-gray-200">
          {/* LEFT SIDE: PRODUCT GRID */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 bg-white">
            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isLoading ? (
                <div className="col-span-full py-16 text-center text-sm font-medium text-gray-500">
                  Loading inventory...
                </div>
              ) : isError ? (
                <div className="col-span-full py-16 text-center text-sm font-medium text-red-500">
                  Failed to load inventory.
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full py-16 text-center text-sm font-medium text-gray-500">
                  No inventory items found.
                </div>
              ) : (
                products.map((product) => {
                  const isSelected = selectedProductIds.has(product.id);

                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleProduct(product)}
                      className={`relative border rounded-xl p-4 flex flex-col items-center text-center justify-between bg-white hover:shadow-sm transition cursor-pointer group ${
                        isSelected
                          ? "border-[#0f834f] ring-1 ring-[#0f834f]"
                          : "border-gray-100"
                      }`}
                    >
                      <div
                        className="absolute left-3 top-3"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleProduct(product)}
                          aria-label={`Select ${product.name}`}
                        />
                      </div>
                      <div className="w-24 h-24 relative mb-3 flex items-center justify-center">
                        <Image
                          width={96}
                          height={96}
                          src={product.image}
                          alt={product.name}
                          className="object-contain max-h-full max-w-full mix-blend-multiply"
                        />
                      </div>
                      <div>
                        <h4 className="text-gray-800 text-sm font-medium mb-1 line-clamp-2">
                          {product.name}
                        </h4>
                        {product.subtitle && (
                          <p className="text-[11px] text-gray-400 line-clamp-1 mb-1">
                            {product.subtitle}
                          </p>
                        )}
                        <p className="text-[#0f834f] font-bold text-sm">
                          £{product.price}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT SIDE: CHECKOUT CART */}
          <div className="w-[420px] bg-white p-6 flex flex-col justify-between h-full">
            <div>
              {/* Checkout Title */}
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
                <span className="text-[#0f834f] text-xl">🛒</span>
                <h2 className="text-xl font-bold text-gray-800">Checkout</h2>
              </div>

              <div className="relative mb-4">
                <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 focus-within:border-[#0f834f] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0f834f]">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    value={repairSearch}
                    onChange={(event) => {
                      setRepairSearch(event.target.value);
                      setIsRepairSearchOpen(true);
                    }}
                    onFocus={() => setIsRepairSearchOpen(true)}
                    onBlur={() => setIsRepairSearchOpen(false)}
                    placeholder="Search completed repairs"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  />
                </div>

                {isRepairSearchOpen && (
                  <div className="absolute left-0 right-0 top-11 z-20 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {isRepairRequestsLoading ? (
                      <div className="px-3 py-3 text-sm text-gray-500">
                        Loading repairs...
                      </div>
                    ) : filteredRepairs.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-gray-500">
                        No completed repairs found.
                      </div>
                    ) : (
                      filteredRepairs.map((repair) => (
                        <button
                          key={repair.id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => addRepairToCart(repair)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-emerald-50"
                        >
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-emerald-50">
                            <Image
                              width={36}
                              height={36}
                              src={repair.image}
                              alt={repair.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-xs font-bold text-gray-800">
                              {repair.name}
                            </p>
                            {repair.subtitle && (
                              <p className="line-clamp-1 text-[11px] text-gray-400">
                                {repair.subtitle}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 text-xs font-bold text-[#0f834f]">
                            £{repair.price.toFixed(2)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Table Headers */}
              <div className="grid grid-cols-12 text-xs font-semibold text-gray-400 mb-2 px-1">
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-4 text-right">Price</div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-sm font-medium text-gray-400">
                    Select inventory items to checkout.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 items-center gap-2 border-b border-gray-50 pb-3"
                    >
                      {/* Item Details */}
                      <div className="col-span-6 flex gap-2 items-start">
                        <div className="w-9 h-9 relative bg-emerald-50 rounded flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                          <Image
                            width={36}
                            height={36}
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-800 line-clamp-1">
                            {item.name}
                          </h4>
                          {item.subtitle && (
                            <p className="text-[11px] text-gray-400 line-clamp-1">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="col-span-2 flex items-center justify-center gap-1">
                        {item.type === "repair" ? (
                          <span className="text-[11px] font-semibold text-gray-400">
                            -
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Price & Delete */}
                      <div className="col-span-4 flex items-center justify-end gap-2 text-right">
                        <div className="min-w-0">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            readOnly={!item.priceEditable}
                            onChange={(event) =>
                              updatePrice(
                                item.id,
                                Number(event.target.value || 0),
                              )
                            }
                            className={`h-8 w-20 rounded-md border px-2 text-right text-xs font-bold outline-none ${
                              item.priceEditable
                                ? "border-gray-200 text-gray-700 focus:border-[#0f834f] focus:ring-1 focus:ring-[#0f834f]"
                                : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-500"
                            }`}
                          />
                          <p className="mt-0.5 text-[10px] font-semibold text-gray-400">
                            £{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations Section */}
            <div className=" pt-4 mt-auto space-y-3">
              <div className="flex justify-between items-center text-sm border-t border-dashed border-gray-200 pt-2">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-gray-700 font-semibold">
                  £{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-gray-800">
                  Total Due
                </span>
                <span className="text-xl font-black text-[#0f834f]">
                  £{totalDue.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCreateInvoice}
                disabled={!cart.length || isPending}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0f834f] text-sm font-bold text-white shadow-sm transition hover:bg-[#0c6f43] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Invoice...
                  </>
                ) : (
                  "Create Invoice"
                )}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
