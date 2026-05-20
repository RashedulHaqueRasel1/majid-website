/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useRef, useState } from "react";

import {
  User,
  Store,
  Package,
  Loader2,
  Upload,
  Trash2,
  Plus,
  Search,
  ScanLine,
} from "lucide-react";

import { useSession } from "next-auth/react";

import { toast } from "sonner";

import { pdf } from "@react-pdf/renderer";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Card, CardContent } from "@/components/ui/card";

import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";

import {
  useCreateInvoice,
  useMyInventory,
} from "@/features/shopkeeper/inventory/hooks/useInventory";

// --------------------------------------------------
// PDF STYLES
// --------------------------------------------------
const pdfStyles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: "#ffffff",
    fontSize: 10,
    color: "#0f172a",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 16,
  },

  logo: {
    width: 120,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  section: {
    marginBottom: 20,
  },

  infoRow: {
    flexDirection: "row",
    gap: 16,
  },

  infoBox: {
    flex: 1,
    border: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
  },

  label: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 3,
  },

  value: {
    marginBottom: 8,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 6,
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 10,
    alignItems: "center",
  },

  col1: {
    width: "35%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  col2: {
    width: "15%",
    textAlign: "center",
  },

  col3: {
    width: "50%",
  },

  productImage: {
    width: 35,
    height: 35,
    borderRadius: 6,
  },

  footer: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 8,
    color: "#64748b",
  },
});

// --------------------------------------------------
// PDF COMPONENT
// --------------------------------------------------
const PurchaseReceiptPDF = ({ customer, items, shopkeeper, idImages }: any) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* HEADER */}
      <View style={pdfStyles.header}>
        <Image src={shopkeeper.image?.url} style={pdfStyles.logo} />

        <View>
          <Text style={pdfStyles.title}>PURCHASE RECEIPT</Text>

          <Text>Date: {new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      {/* CUSTOMER + STORE */}
      <View style={[pdfStyles.section, pdfStyles.infoRow]}>
        <View style={pdfStyles.infoBox}>
          <Text style={pdfStyles.sectionTitle}>Customer Information</Text>

          <Text style={pdfStyles.label}>Customer Name</Text>

          <Text style={pdfStyles.value}>
            {customer.firstName} {customer.lastName}
          </Text>

          <Text style={pdfStyles.label}>Email</Text>

          <Text style={pdfStyles.value}>{customer.email || "N/A"}</Text>

          <Text style={pdfStyles.label}>Phone</Text>

          <Text style={pdfStyles.value}>{customer.phone || "N/A"}</Text>

          <Text style={pdfStyles.label}>Address</Text>

          <Text style={pdfStyles.value}>{customer.address || "N/A"}</Text>

          <Text style={pdfStyles.label}>ID Number</Text>

          <Text style={pdfStyles.value}>{customer.idNumber || "N/A"}</Text>
        </View>

        <View style={pdfStyles.infoBox}>
          <Text style={pdfStyles.sectionTitle}>Shop Information</Text>

          <Text style={pdfStyles.value}>{shopkeeper?.shopName || "N/A"}</Text>

          <Text style={pdfStyles.value}>
            {shopkeeper?.shopAddress || "N/A"}
          </Text>

          <Text style={pdfStyles.value}>{shopkeeper?.email || "N/A"}</Text>

          <Text style={pdfStyles.value}>{shopkeeper?.phone || "N/A"}</Text>
        </View>
      </View>

      {/* ITEMS */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Purchased Items</Text>

        <View style={pdfStyles.tableHeader}>
          <Text style={pdfStyles.col1}>Product</Text>

          <Text style={pdfStyles.col2}>Qty</Text>

          <Text style={pdfStyles.col3}>IMEI / Serial Numbers</Text>
        </View>

        {items.map((item: any, index: number) => (
          <View key={index} style={pdfStyles.row}>
            <View style={pdfStyles.col1}>
              <Image src={item.image} style={pdfStyles.productImage} />

              <Text>{item.name}</Text>
            </View>

            <Text style={pdfStyles.col2}>{item.quantity}</Text>

            <View style={pdfStyles.col3}>
              {item.serials.map((serial: string, idx: number) => (
                <Text key={idx}>{serial}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* ID IMAGES */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Customer ID Images</Text>

        <View
          style={{
            flexDirection: "row",
            gap: 10,
          }}
        >
          {idImages.map((img: string, index: number) => (
            <Image
              key={index}
              src={img}
              style={{
                width: 180,
                height: 120,
                borderRadius: 8,
                objectFit: "cover",
              }}
            />
          ))}
        </View>
      </View>

      <Text style={pdfStyles.footer}>
        This document confirms the purchase of products from the customer.
      </Text>
    </Page>
  </Document>
);

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------
export default function CreatePurchaseReceipt() {
  const { data: profileData } = useMyProfile();

  const session = useSession();

  const shopkeeperId = session?.data?.user?.id;

  const { mutate: createInvoice, isPending } = useCreateInvoice();

  const { data: inventoryData, isLoading, isError } = useMyInventory();

  // --------------------------------------------------
  // CUSTOMER STATE
  // --------------------------------------------------
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    idNumber: "",
  });

  // --------------------------------------------------
  // ITEM STATE
  // --------------------------------------------------
  const [items, setItems] = useState<any[]>([]);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");

  // --------------------------------------------------
  // ID IMAGES
  // --------------------------------------------------
  const [idImages, setIdImages] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --------------------------------------------------
  // INVENTORY ITEMS
  // --------------------------------------------------
  const inventoryItems = useMemo(() => {
    return (inventoryData?.data || []).filter(
      (item: any) => item.type === "inventory",
    );
  }, [inventoryData]);

  // --------------------------------------------------
  // FILTER INVENTORY
  // --------------------------------------------------
  const filteredInventory = useMemo(() => {
    return inventoryItems.filter(
      (item: any) =>
        item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.imeiNumber?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [inventoryItems, searchQuery]);

  // --------------------------------------------------
  // ADD ITEM
  // --------------------------------------------------
  const addInventoryItem = (device: any) => {
    const alreadyExists = items.some((item) => item.inventoryId === device._id);

    if (alreadyExists) {
      toast.error("Item already added");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        inventoryId: device._id,
        name: device.itemName,
        quantity: 1,
        image: device.image?.url || "/placeholder.png",
        serials: device.imeiNumber ? [device.imeiNumber] : [""],
      },
    ]);

    toast.success("Item added");
  };

  // --------------------------------------------------
  // REMOVE ITEM
  // --------------------------------------------------
  const removeItem = (index: number) => {
    const updated = [...items];

    updated.splice(index, 1);

    setItems(updated);
  };

  // --------------------------------------------------
  // UPDATE ITEM
  // --------------------------------------------------
  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];

    updated[index][field] = value;

    setItems(updated);
  };

  // --------------------------------------------------
  // ADD SERIAL
  // --------------------------------------------------
  const addSerial = (itemIndex: number) => {
    const updated = [...items];

    updated[itemIndex].serials.push("");

    setItems(updated);
  };

  // --------------------------------------------------
  // UPDATE SERIAL
  // --------------------------------------------------
  const updateSerial = (
    itemIndex: number,
    serialIndex: number,
    value: string,
  ) => {
    const updated = [...items];

    updated[itemIndex].serials[serialIndex] = value;

    setItems(updated);
  };

  // --------------------------------------------------
  // REMOVE SERIAL
  // --------------------------------------------------
  const removeSerial = (itemIndex: number, serialIndex: number) => {
    const updated = [...items];

    updated[itemIndex].serials.splice(serialIndex, 1);

    setItems(updated);
  };

  // --------------------------------------------------
  // UPLOAD ID IMAGES
  // --------------------------------------------------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    setIdImages((prev) => [...prev, ...files]);
  };

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------
  const isFormValid = useMemo(() => {
    return (
      customer.firstName &&
      customer.phone &&
      customer.idNumber &&
      idImages.length >= 2 &&
      items.length > 0
    );
  }, [customer, idImages, items]);

  // --------------------------------------------------
  // CREATE RECEIPT
  // --------------------------------------------------
  const handleCreateReceipt = async () => {
    if (!isFormValid) {
      toast.error("Please complete all required fields");

      return;
    }

    const imageUrls = idImages.map((file) => URL.createObjectURL(file));

    const doc = (
      <PurchaseReceiptPDF
        customer={customer}
        items={items}
        shopkeeper={profileData?.data}
        idImages={imageUrls}
      />
    );

    const blob = await pdf(doc).toBlob();

    const file = new File(
      [blob],
      `purchase_receipt_${customer.firstName}.pdf`,
      {
        type: "application/pdf",
      },
    );

    createInvoice(
      {
        shopkeeperId: shopkeeperId || "",
        type: "Purchase Invoice",
        invoice: file,
      },
      {
        onSuccess: () => {
          toast.success("Purchase receipt created successfully");
        },

        onError: () => {
          toast.error("Failed to create purchase receipt");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Purchase Receipt Generator
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              Manual purchase invoicing system
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3 bg-orange-50 text-orange-600 px-5 py-3 rounded-2xl font-bold">
            <Package size={18} />
            {items.length} Items Added
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="xl:col-span-2 space-y-6">
            {/* CUSTOMER CARD */}
            <Card className="rounded-[28px] border-0 shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <User size={22} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black">
                      Customer Information
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      Customer details & ID verification
                    </p>
                  </div>
                </div>

                {/* INPUTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    placeholder="First Name"
                    className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                    value={customer.firstName}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        firstName: e.target.value,
                      })
                    }
                  />

                  <Input
                    placeholder="Last Name"
                    className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                    value={customer.lastName}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        lastName: e.target.value,
                      })
                    }
                  />

                  <Input
                    placeholder="Email Address"
                    className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        email: e.target.value,
                      })
                    }
                  />

                  <Input
                    placeholder="Phone Number"
                    className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        phone: e.target.value,
                      })
                    }
                  />

                  <div className="md:col-span-2">
                    <Textarea
                      placeholder="Customer Address"
                      className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                      value={customer.address}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* ID SECTION */}
                <div className="border rounded-3xl p-6 bg-muted/30 space-y-5">
                  <div>
                    <h3 className="text-xl font-black">
                      Customer ID Verification
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Upload minimum 2 ID images
                    </p>
                  </div>

                  <Input
                    placeholder="Manual ID Number"
                    className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                    value={customer.idNumber}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        idNumber: e.target.value,
                      })
                    }
                  />

                  {/* FILE INPUT */}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl h-12 border-primary hover:text-foreground !bg-background font-bold focus-visible:ring-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={18} className="mr-2" />
                    Upload ID Images
                  </Button>

                  {/* PREVIEW */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {idImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative rounded-2xl overflow-hidden border"
                      >
                        <img
                          src={URL.createObjectURL(img)}
                          alt="id"
                          className="w-full h-32 object-cover"
                        />

                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          onClick={() =>
                            setIdImages((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* INVENTORY SECTION */}
            <Card className="rounded-[28px] border-0 shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-black">
                    Select Inventory Items
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Choose products from inventory
                  </p>
                </div>

                {/* SEARCH */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                  <Input
                    placeholder="Search by item or IMEI..."
                    className="h-12 rounded-2xl pl-11 border-primary bg-background font-bold focus-visible:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-3xl border">
                  <table className="w-full">
                    <thead className="bg-surface border-b">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                          Product
                        </th>

                        <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                          IMEI
                        </th>

                        <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                          Price
                        </th>

                        <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center py-10 font-bold text-muted-foreground"
                          >
                            Loading inventory...
                          </td>
                        </tr>
                      ) : isError ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center py-10 font-bold text-red-500"
                          >
                            Failed to load inventory
                          </td>
                        </tr>
                      ) : filteredInventory.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center py-10 font-bold text-muted-foreground"
                          >
                            No products found
                          </td>
                        </tr>
                      ) : (
                        filteredInventory.map((device: any) => (
                          <tr
                            key={device?._id}
                            className="border-b border-border hover:bg-accent/10 transition"
                          >
                            {/* PRODUCT */}
                            <td className="px-6 py-5  ">
                              <div className="flex items-center gap-4">
                                <img
                                  src={device?.image?.url || "/placeholder.png"}
                                  alt={device?.itemName}
                                  className="w-14 h-14 rounded-2xl object-cover border"
                                />

                                <div>
                                  <p className="font-black">
                                    {device?.itemName}
                                  </p>

                                  <p className="text-xs font-bold text-muted-foreground">
                                    #{device?._id.slice(-6)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* IMEI */}
                            <td className="px-6 py-5">{device?.imeiNumber}</td>
                            <td className="px-6 py-5">
                              {device?.expectedPrice}
                            </td>
                            {/* ACTION */}
                            <td className="px-6 py-5 text-right">
                              <Button
                                className="rounded-2xl"
                                onClick={() => addInventoryItem(device)}
                              >
                                <Plus size={16} className="mr-2" />
                                Add
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* SELECTED ITEMS */}
            <Card className="rounded-[28px] border-0 shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-black">
                    Selected Purchase Items
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Edit quantities & serial numbers
                  </p>
                </div>

                <div className="space-y-5">
                  {items.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground font-bold">
                      No items selected
                    </div>
                  ) : (
                    items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="border rounded-3xl p-6 bg-muted/20"
                      >
                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-4">
                            <img
                              src={item.image}
                              className="w-16 h-16 rounded-2xl object-cover border"
                              alt={item.name}
                            />

                            <div>
                              <h3 className="text-lg font-black">
                                {item.name}
                              </h3>

                              <p className="text-sm text-muted-foreground">
                                Inventory Item
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="destructive"
                            size="icon"
                            className="rounded-2xl"
                            onClick={() => removeItem(itemIndex)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>

                        {/* QUANTITY */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                              Quantity
                            </label>

                            <Input
                              type="number"
                              className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  itemIndex,
                                  "quantity",
                                  Number(e.target.value),
                                )
                              }
                            />
                          </div>
                        </div>

                        {/* SERIALS */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-black">
                                IMEI / Serial Numbers
                              </h4>

                              <p className="text-xs text-muted-foreground">
                                Multiple serials supported
                              </p>
                            </div>

                            <Button
                              variant="outline"
                              className="rounded-2xl"
                              onClick={() => addSerial(itemIndex)}
                            >
                              <Plus size={16} className="mr-2" />
                              Add Serial
                            </Button>
                          </div>

                          {item.serials.map(
                            (serial: string, serialIndex: number) => (
                              <div
                                key={serialIndex}
                                className="flex gap-3 items-center"
                              >
                                <div className="relative flex-1">
                                  <Input
                                    className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                                    placeholder="Enter serial number"
                                    value={serial}
                                    onChange={(e) =>
                                      updateSerial(
                                        itemIndex,
                                        serialIndex,
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                {item.serials.length > 1 && (
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="rounded-2xl h-12 w-12"
                                    onClick={() =>
                                      removeSerial(itemIndex, serialIndex)
                                    }
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* STORE CARD */}
            <Card className="rounded-[28px] overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <CardContent className="p-8 space-y-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-sky-400">
                  <img
                    src={profileData?.data?.image?.url}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-black">
                    {profileData?.data?.shopName || "N/A"}
                  </h2>

                  <p className="text-slate-300 mt-2">
                    {profileData?.data?.email || "N/A"}
                  </p>

                  <p className="text-slate-300">
                    {profileData?.data?.phone || "N/A"}
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-300 font-black mb-1">
                    Store Address
                  </p>

                  <p className="text-sm">
                    {profileData?.data?.shopAddress || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SUMMARY */}
            <Card className="rounded-[28px] border-0 shadow-sm">
              <CardContent className="p-8 space-y-5">
                <div>
                  <h2 className="text-2xl font-black">Receipt Summary</h2>

                  <p className="text-sm text-muted-foreground">
                    Purchase receipt overview
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">
                      Total Items
                    </p>

                    <p className="text-3xl font-black">{items.length}</p>
                  </div>

                  <div className="bg-muted rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">
                      Total Serials
                    </p>

                    <p className="text-3xl font-black">
                      {items.reduce(
                        (acc, item) => acc + item.serials.length,
                        0,
                      )}
                    </p>
                  </div>

                  <div className="bg-muted rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">
                      Uploaded ID Images
                    </p>

                    <p className="text-3xl font-black">{idImages.length}</p>
                  </div>
                </div>

                {/* BUTTON */}
                <Button
                  disabled={!isFormValid || isPending}
                  onClick={handleCreateReceipt}
                  className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-wider"
                >
                  Create Purchase Receipt
                  {isPending && <Loader2 className="ml-2 animate-spin" />}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
