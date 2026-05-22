// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React, { useMemo, useRef, useState } from "react";

// import {
//   User,
//   Store,
//   Package,
//   Loader2,
//   Upload,
//   Trash2,
//   Plus,
//   Search,
//   ScanLine,
// } from "lucide-react";

// import { useSession } from "next-auth/react";

// import { toast } from "sonner";

// import { pdf } from "@react-pdf/renderer";

// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   Image,
// } from "@react-pdf/renderer";

// import { Button } from "@/components/ui/button";

// import { Input } from "@/components/ui/input";

// import { Textarea } from "@/components/ui/textarea";

// import { Card, CardContent } from "@/components/ui/card";

// import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";

// import {
//   useCreateInvoice,
//   useMyInventory,
// } from "@/features/shopkeeper/inventory/hooks/useInventory";

// // --------------------------------------------------
// // PDF STYLES
// // --------------------------------------------------
// // --- Ultra-Modern PDF Styles (Premium Layout) ---
// const pdfStyles = StyleSheet.create({
//   page: {
//     padding: 40,
//     backgroundColor: "#ffffff",
//     fontSize: 9,
//     color: "#334155", // Slate 700
//   },
//   headerBar: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 6,
//     backgroundColor: "#0f172a", // Dark Slate Accent
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 35,
//     marginTop: 10,
//   },
//   logo: {
//     width: 130,
//     objectFit: "contain",
//   },
//   receiptMeta: {
//     textAlign: "right",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#0f172a",
//     letterSpacing: 1,
//     marginBottom: 4,
//   },
//   dateText: {
//     fontSize: 9,
//     color: "#64748b",
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 10,
//     fontWeight: "bold",
//     color: "#0f172a",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//     marginBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#cbd5e1",
//     paddingBottom: 4,
//   },
//   infoRow: {
//     flexDirection: "row",
//     gap: 20,
//   },
//   infoBox: {
//     flex: 1,
//     backgroundColor: "#f8fafc", // Very soft gray background
//     borderRadius: 8,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: "#f1f5f9",
//   },
//   infoBoxTitle: {
//     fontSize: 9,
//     fontWeight: "bold",
//     color: "#0f172a",
//     marginBottom: 10,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   label: {
//     fontSize: 7.5,
//     color: "#64748b",
//     textTransform: "uppercase",
//     marginBottom: 2,
//   },
//   value: {
//     color: "#1e293b",
//     fontSize: 9.5,
//     fontWeight: "bold",
//     marginBottom: 8,
//   },
//   storeValue: {
//     color: "#334155",
//     fontSize: 9.5,
//     lineHeight: 1.5,
//     marginBottom: 2,
//   },
//   // Table Style
//   tableHeader: {
//     flexDirection: "row",
//     backgroundColor: "#0f172a",
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     color: "#ffffff",
//     fontWeight: "bold",
//     fontSize: 8,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   row: {
//     flexDirection: "row",
//     borderBottomWidth: 1,
//     borderBottomColor: "#f1f5f9",
//     paddingVertical: 12,
//     paddingHorizontal: 12,
//     alignItems: "center",
//   },
//   colProduct: {
//     width: "40%",
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   colQty: {
//     width: "10%",
//     textAlign: "center",
//     color: "#0f172a",
//     fontWeight: "bold",
//   },
//   colSerials: {
//     width: "30%",
//   },
//   colPrice: {
//     width: "20%",
//     textAlign: "right",
//     fontWeight: "bold",
//     color: "#0f172a",
//   },
//   productImage: {
//     width: 38,
//     height: 38,
//     borderRadius: 6,
//     backgroundColor: "#f8fafc",
//   },
//   productName: {
//     fontSize: 9.5,
//     fontWeight: "bold",
//     color: "#0f172a",
//   },
//   serialText: {
//     fontSize: 8,
//     color: "#475569",
//     backgroundColor: "#f1f5f9",
//     paddingVertical: 2,
//     paddingHorizontal: 6,
//     borderRadius: 4,
//     marginBottom: 2,
//     alignSelf: "flex-start",
//   },
//   // Total Section
//   totalSection: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginBottom: 24,
//   },
//   totalBox: {
//     backgroundColor: "#f8fafc",
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//     padding: 12,
//     borderRadius: 8,
//     width: 200,
//   },
//   totalRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   totalLabel: {
//     fontSize: 9,
//     fontWeight: "bold",
//     color: "#64748b",
//     textTransform: "uppercase",
//   },
//   totalValue: {
//     fontSize: 13,
//     fontWeight: "bold",
//     color: "#0f172a",
//   },
//   // Document Images Section
//   idImagesContainer: {
//     flexDirection: "row",
//     gap: 14,
//     marginTop: 4,
//   },
//   idImageFrame: {
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//     borderRadius: 8,
//     padding: 4,
//     backgroundColor: "#f8fafc",
//   },
//   idImage: {
//     width: 170,
//     height: 105,
//     borderRadius: 6,
//     objectFit: "cover",
//   },
//   footer: {
//     position: "absolute",
//     bottom: 30,
//     left: 40,
//     right: 40,
//     textAlign: "center",
//     color: "#94a3b8",
//     fontSize: 7.5,
//     borderTopWidth: 1,
//     borderTopColor: "#f1f5f9",
//     paddingTop: 15,
//     lineHeight: 1.4,
//   },
// });

// // --------------------------------------------------
// // MODERN RECEIPT PDF COMPONENT WITH PRICE
// // --------------------------------------------------
// const PurchaseReceiptPDF = ({
//   customer,
//   items,
//   total,
//   shopkeeper,
//   idImages,
// }: any) => (
//   <Document>
//     <Page size="A4" style={pdfStyles.page}>
//       {/* Decorative Accent Bar */}
//       <View style={pdfStyles.headerBar} />

//       {/* HEADER SECTION */}
//       <View style={pdfStyles.header}>
//         {shopkeeper?.image?.url ? (
//           <Image src={shopkeeper.image.url} style={pdfStyles.logo} />
//         ) : (
//           <Text style={[pdfStyles.title, { fontSize: 18 }]}>
//             {shopkeeper?.shopName || "STORE"}
//           </Text>
//         )}

//         <View style={pdfStyles.receiptMeta}>
//           <Text style={pdfStyles.title}>PURCHASE RECEIPT</Text>
//           <Text style={pdfStyles.dateText}>
//             Date:{" "}
//             {new Date().toLocaleDateString("en-US", {
//               year: "numeric",
//               month: "long",
//               day: "numeric",
//             })}
//           </Text>
//         </View>
//       </View>

//       {/* CUSTOMER + STORE DETAILS BOXES */}
//       <View style={[pdfStyles.section, pdfStyles.infoRow]}>
//         {/* Customer Information Card */}
//         <View style={pdfStyles.infoBox}>
//           <Text style={pdfStyles.infoBoxTitle}>Customer Details</Text>

//           <Text style={pdfStyles.label}>Name</Text>
//           <Text style={pdfStyles.value}>
//             {`${customer?.firstName || ""} ${customer?.lastName || "Valued Customer"}`}
//           </Text>

//           <Text style={pdfStyles.label}>Contact Info</Text>
//           <Text
//             style={[
//               pdfStyles.value,
//               { fontSize: 8.5, fontWeight: "normal", marginBottom: 4 },
//             ]}
//           >
//             {customer?.phone || "Phone N/A"}
//           </Text>
//           <Text
//             style={[pdfStyles.value, { fontSize: 8.5, fontWeight: "normal" }]}
//           >
//             {customer?.email || "Email N/A"}
//           </Text>

//           <Text style={pdfStyles.label}>Address</Text>
//           <Text
//             style={[pdfStyles.value, { fontSize: 8.5, fontWeight: "normal" }]}
//           >
//             {customer?.address || "N/A"}
//           </Text>

//           <Text style={pdfStyles.label}>Govt ID Number</Text>
//           <Text style={[pdfStyles.value, { marginBottom: 0 }]}>
//             {customer?.idNumber || "N/A"}
//           </Text>
//         </View>

//         {/* Shop Information Card */}
//         <View style={pdfStyles.infoBox}>
//           <Text style={pdfStyles.infoBoxTitle}>Shop Information</Text>
//           <Text style={[pdfStyles.value, { fontSize: 11, marginBottom: 6 }]}>
//             {shopkeeper?.shopName || "Gadget Galaxy"}
//           </Text>
//           <Text style={pdfStyles.storeValue}>
//             {shopkeeper?.shopAddress || "Address N/A"}
//           </Text>
//           <Text style={pdfStyles.storeValue}>
//             Phone: {shopkeeper?.phone || "N/A"}
//           </Text>
//           <Text style={pdfStyles.storeValue}>
//             Email: {shopkeeper?.email || "N/A"}
//           </Text>
//         </View>
//       </View>

//       {/* ITEMS TABLE SECTION */}
//       <View style={pdfStyles.section}>
//         <Text style={pdfStyles.sectionTitle}>Purchased Items & Assets</Text>

//         <View style={pdfStyles.tableHeader}>
//           <Text style={pdfStyles.colProduct}>Product Name / Model</Text>
//           <Text style={pdfStyles.colQty}>Qty</Text>
//           <Text style={pdfStyles.colSerials}>IMEI / Serial Numbers</Text>
//           <Text style={pdfStyles.colPrice}>Price</Text>
//         </View>

//         {items?.map((item: any, index: number) => (
//           <View key={index} style={pdfStyles.row}>
//             <View style={pdfStyles.colProduct}>
//               {item.image && (
//                 <Image src={item.image} style={pdfStyles.productImage} />
//               )}
//               <Text style={pdfStyles.productName}>{item.name}</Text>
//             </View>

//             <Text style={pdfStyles.colQty}>{item.quantity || 1}</Text>

//             <View style={pdfStyles.colSerials}>
//               {item.serials?.map((serial: string, idx: number) => (
//                 <Text key={idx} style={pdfStyles.serialText}>
//                   • {serial}
//                 </Text>
//               ))}
//             </View>

//             <Text style={pdfStyles.colPrice}>
//               $
//               {(
//                 Number(item.expectedPrice || 0) * Number(item.quantity || 1)
//               ).toLocaleString(undefined, {
//                 minimumFractionDigits: 2,
//               })}
//             </Text>
//           </View>
//         ))}
//       </View>

//       {/* TOTAL AMOUNT SECTION */}
//       <View style={pdfStyles.totalSection}>
//         <View style={pdfStyles.totalBox}>
//           <View style={pdfStyles.totalRow}>
//             <Text style={pdfStyles.totalLabel}>Total Value</Text>
//             <Text style={pdfStyles.totalValue}>
//               $
//               {total
//                 ? total.toLocaleString(undefined, { minimumFractionDigits: 2 })
//                 : "0.00"}
//             </Text>
//           </View>
//         </View>
//       </View>

//       {/* VERIFIED ID IMAGES SECTION */}
//       {idImages && idImages.length > 0 && (
//         <View style={pdfStyles.section}>
//           <Text style={pdfStyles.sectionTitle}>
//             Verification Documents (Customer ID)
//           </Text>

//           <View style={pdfStyles.idImagesContainer}>
//             {idImages.map((img: string, index: number) => (
//               <View key={index} style={pdfStyles.idImageFrame}>
//                 <Image src={img} style={pdfStyles.idImage} />
//               </View>
//             ))}
//           </View>
//         </View>
//       )}

//       {/* LEGAL FOOTER */}
//       <Text style={pdfStyles.footer}>
//         This legally binding document officially confirms the legitimate
//         purchase/takeover of the products listed above from the customer. {"\n"}
//         All serial and IMEI numbers are cross-verified with the provided
//         Government ID verification.
//       </Text>
//     </Page>
//   </Document>
// );

// // --------------------------------------------------
// // MAIN COMPONENT
// // --------------------------------------------------
// export default function CreatePurchaseReceipt() {
//   const { data: profileData } = useMyProfile();

//   const session = useSession();

//   const shopkeeperId = session?.data?.user?.id;

//   const { mutate: createInvoice, isPending } = useCreateInvoice();

//   const { data: inventoryData, isLoading, isError } = useMyInventory();

//   // --------------------------------------------------
//   // CUSTOMER STATE
//   // --------------------------------------------------
//   const [customer, setCustomer] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     address: "",
//     idNumber: "",
//   });

//   // --------------------------------------------------
//   // ITEM STATE
//   // --------------------------------------------------
//   const [items, setItems] = useState<any[]>([]);

//   // --------------------------------------------------
//   // SEARCH
//   // --------------------------------------------------
//   const [searchQuery, setSearchQuery] = useState("");

//   // --------------------------------------------------
//   // ID IMAGES
//   // --------------------------------------------------
//   const [idImages, setIdImages] = useState<File[]>([]);

//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   // --------------------------------------------------
//   // INVENTORY ITEMS
//   // --------------------------------------------------
//   const inventoryItems = useMemo(() => {
//     return (inventoryData?.data || []).filter(
//       (item: any) => item.type === "inventory",
//     );
//   }, [inventoryData]);

//   // --------------------------------------------------
//   // FILTER INVENTORY
//   // --------------------------------------------------
//   const filteredInventory = useMemo(() => {
//     return inventoryItems.filter(
//       (item: any) =>
//         item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.imeiNumber?.toLowerCase().includes(searchQuery.toLowerCase()),
//     );
//   }, [inventoryItems, searchQuery]);

//   // --------------------------------------------------
//   // ADD ITEM
//   // --------------------------------------------------
//   const addInventoryItem = (device: any) => {
//     const alreadyExists = items.some((item) => item.inventoryId === device._id);

//     if (alreadyExists) {
//       toast.error("Item already added");

//       return;
//     }

//     setItems((prev) => [
//       ...prev,
//       {
//         inventoryId: device._id,
//         name: device.itemName,
//         quantity: 1,
//         image: device.image?.url || "/placeholder.png",
//         serials: device.imeiNumber ? [device.imeiNumber] : [""],

//         // PRICE ADDED
//         expectedPrice: Number(device.expectedPrice) || 0,
//       },
//     ]);

//     toast.success("Item added");
//   };
//   // --------------------------------------------------
//   // REMOVE ITEM
//   // --------------------------------------------------
//   const removeItem = (index: number) => {
//     const updated = [...items];

//     updated.splice(index, 1);

//     setItems(updated);
//   };

//   // --------------------------------------------------
//   // UPDATE ITEM
//   // --------------------------------------------------
//   const updateItem = (index: number, field: string, value: any) => {
//     const updated = [...items];

//     updated[index][field] = value;

//     setItems(updated);
//   };

//   // --------------------------------------------------
//   // ADD SERIAL
//   // --------------------------------------------------
//   const addSerial = (itemIndex: number) => {
//     const updated = [...items];

//     updated[itemIndex].serials.push("");

//     setItems(updated);
//   };

//   // --------------------------------------------------
//   // UPDATE SERIAL
//   // --------------------------------------------------
//   const updateSerial = (
//     itemIndex: number,
//     serialIndex: number,
//     value: string,
//   ) => {
//     const updated = [...items];

//     updated[itemIndex].serials[serialIndex] = value;

//     setItems(updated);
//   };

//   // --------------------------------------------------
//   // REMOVE SERIAL
//   // --------------------------------------------------
//   const removeSerial = (itemIndex: number, serialIndex: number) => {
//     const updated = [...items];

//     updated[itemIndex].serials.splice(serialIndex, 1);

//     setItems(updated);
//   };

//   // --------------------------------------------------
//   // UPLOAD ID IMAGES
//   // --------------------------------------------------
//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);

//     setIdImages((prev) => [...prev, ...files]);
//   };

//   // --------------------------------------------------
//   // VALIDATION
//   // --------------------------------------------------
//   const isFormValid = useMemo(() => {
//     return (
//       customer.firstName &&
//       customer.phone &&
//       customer.idNumber &&
//       idImages.length >= 2 &&
//       items.length > 0
//     );
//   }, [customer, idImages, items]);

//   // --------------------------------------------------
//   // CREATE RECEIPT
//   // --------------------------------------------------
//   const handleCreateReceipt = async () => {
//     if (!isFormValid) {
//       toast.error("Please complete all required fields");

//       return;
//     }

//     const imageUrls = idImages.map((file) => URL.createObjectURL(file));

//     const doc = (
//       <PurchaseReceiptPDF
//         customer={customer}
//         items={items}
//         shopkeeper={profileData?.data}
//         idImages={imageUrls}
//         total={items.reduce(
//           (acc, item) =>
//             acc + Number(item.expectedPrice || 0) * Number(item.quantity || 1),
//           0,
//         )}
//       />
//     );

//     const blob = await pdf(doc).toBlob();

//     const file = new File(
//       [blob],
//       `purchase_receipt_${customer.firstName}.pdf`,
//       {
//         type: "application/pdf",
//       },
//     );

//     createInvoice(
//       {
//         shopkeeperId: shopkeeperId || "",
//         type: "Purchase Invoice",
//         invoice: file,
//       },
//       {
//         onSuccess: () => {
//           toast.success("Purchase receipt created successfully");
//         },

//         onError: () => {
//           toast.error("Failed to create purchase receipt");
//         },
//       },
//     );
//   };

//   return (
//     <div className="min-h-screen bg-background px-4 py-8 md:px-8">
//       <div className="mx-auto space-y-8">
//         {/* HEADER */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-black tracking-tight">
//               Purchase Receipt Generator
//             </h1>

//             <p className="text-sm text-muted-foreground mt-1">
//               Manual purchase invoicing system
//             </p>
//           </div>

//           <div className="hidden md:flex items-center gap-3 bg-orange-50 text-orange-600 px-5 py-3 rounded-2xl font-bold">
//             <Package size={18} />
//             {items.length} Items Added
//           </div>
//         </div>

//         {/* MAIN GRID */}
//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//           {/* LEFT */}
//           <div className="xl:col-span-2 space-y-6">
//             {/* CUSTOMER CARD */}
//             <Card className="rounded-[28px] border-0 shadow-sm">
//               <CardContent className="p-8 space-y-6">
//                 <div className="flex items-center gap-3">
//                   <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
//                     <User size={22} />
//                   </div>

//                   <div>
//                     <h2 className="text-2xl font-black">
//                       Customer Information
//                     </h2>

//                     <p className="text-sm text-muted-foreground">
//                       Customer details & ID verification
//                     </p>
//                   </div>
//                 </div>

//                 {/* INPUTS */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                   <Input
//                     placeholder="First Name"
//                     className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
//                     value={customer.firstName}
//                     onChange={(e) =>
//                       setCustomer({
//                         ...customer,
//                         firstName: e.target.value,
//                       })
//                     }
//                   />

//                   <Input
//                     placeholder="Last Name"
//                     className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
//                     value={customer.lastName}
//                     onChange={(e) =>
//                       setCustomer({
//                         ...customer,
//                         lastName: e.target.value,
//                       })
//                     }
//                   />

//                   <Input
//                     placeholder="Email Address"
//                     className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
//                     value={customer.email}
//                     type="email"
//                     onChange={(e) =>
//                       setCustomer({
//                         ...customer,
//                         email: e.target.value,
//                       })
//                     }
//                   />

//                   <Input
//                     placeholder="Phone Number"
//                     className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
//                     value={customer.phone}
//                     onChange={(e) =>
//                       setCustomer({
//                         ...customer,
//                         phone: e.target.value,
//                       })
//                     }
//                   />

//                   <div className="md:col-span-2">
//                     <Textarea
//                       placeholder="Customer Address"
//                       className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
//                       value={customer.address}
//                       onChange={(e) =>
//                         setCustomer({
//                           ...customer,
//                           address: e.target.value,
//                         })
//                       }
//                     />
//                   </div>
//                 </div>

//                 {/* ID SECTION */}
//                 <div className="border rounded-3xl p-6 bg-muted/30 space-y-5">
//                   <div>
//                     <h3 className="text-xl font-black">
//                       Customer ID Verification
//                     </h3>

//                     <p className="text-sm text-muted-foreground">
//                       Upload minimum 2 ID images
//                     </p>
//                   </div>

//                   <Input
//                     placeholder="Manual ID Number"
//                     className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
//                     value={customer.idNumber}
//                     onChange={(e) =>
//                       setCustomer({
//                         ...customer,
//                         idNumber: e.target.value,
//                       })
//                     }
//                   />

//                   {/* FILE INPUT */}
//                   <input
//                     type="file"
//                     multiple
//                     accept="image/*"
//                     hidden
//                     ref={fileInputRef}
//                     onChange={handleImageUpload}
//                   />

//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="rounded-2xl h-12 border-primary hover:text-foreground !bg-background font-bold focus-visible:ring-primary"
//                     onClick={() => fileInputRef.current?.click()}
//                   >
//                     <Upload size={18} className="mr-2" />
//                     Upload ID Images
//                   </Button>

//                   {/* PREVIEW */}
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     {idImages.map((img, index) => (
//                       <div
//                         key={index}
//                         className="relative rounded-2xl overflow-hidden border"
//                       >
//                         <img
//                           src={URL.createObjectURL(img)}
//                           alt="id"
//                           className="w-full h-32 object-cover"
//                         />

//                         <button
//                           type="button"
//                           className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
//                           onClick={() =>
//                             setIdImages((prev) =>
//                               prev.filter((_, i) => i !== index),
//                             )
//                           }
//                         >
//                           <Trash2 size={14} />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* INVENTORY SECTION */}
//             <Card className="rounded-[28px] border-0 shadow-sm">
//               <CardContent className="p-8 space-y-6">
//                 <div>
//                   <h2 className="text-2xl font-black">
//                     Select Inventory Items
//                   </h2>

//                   <p className="text-sm text-muted-foreground">
//                     Choose products from inventory
//                   </p>
//                 </div>

//                 {/* SEARCH */}
//                 <div className="relative">
//                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

//                   <Input
//                     placeholder="Search by item or IMEI..."
//                     className="h-12 rounded-2xl pl-11 border-primary bg-background font-bold focus-visible:ring-primary"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                   />
//                 </div>

//                 {/* TABLE */}
//                 <div className="overflow-hidden rounded-3xl border">
//                   <table className="w-full">
//                     <thead className="bg-surface border-b">
//                       <tr>
//                         <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
//                           Product
//                         </th>

//                         <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
//                           IMEI
//                         </th>

//                         <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
//                           Price
//                         </th>

//                         <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
//                           Action
//                         </th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {isLoading ? (
//                         <tr>
//                           <td
//                             colSpan={3}
//                             className="text-center py-10 font-bold text-muted-foreground"
//                           >
//                             Loading inventory...
//                           </td>
//                         </tr>
//                       ) : isError ? (
//                         <tr>
//                           <td
//                             colSpan={3}
//                             className="text-center py-10 font-bold text-red-500"
//                           >
//                             Failed to load inventory
//                           </td>
//                         </tr>
//                       ) : filteredInventory.length === 0 ? (
//                         <tr>
//                           <td
//                             colSpan={3}
//                             className="text-center py-10 font-bold text-muted-foreground"
//                           >
//                             No products found
//                           </td>
//                         </tr>
//                       ) : (
//                         filteredInventory.map((device: any) => (
//                           <tr
//                             key={device?._id}
//                             className="border-b border-border hover:bg-accent/10 transition"
//                           >
//                             {/* PRODUCT */}
//                             <td className="px-6 py-5  ">
//                               <div className="flex items-center gap-4">
//                                 <img
//                                   src={device?.image?.url || "/placeholder.png"}
//                                   alt={device?.itemName}
//                                   className="w-14 h-14 rounded-2xl object-cover border"
//                                 />

//                                 <div>
//                                   <p className="font-black">
//                                     {device?.itemName}
//                                   </p>

//                                   <p className="text-xs font-bold text-muted-foreground">
//                                     #{device?._id.slice(-6)}
//                                   </p>
//                                 </div>
//                               </div>
//                             </td>

//                             {/* IMEI */}
//                             <td className="px-6 py-5">{device?.imeiNumber}</td>
//                             <td className="px-6 py-5">
//                               {device?.expectedPrice}
//                             </td>
//                             {/* ACTION */}
//                             <td className="px-6 py-5 text-right">
//                               <Button
//                                 className="rounded-2xl"
//                                 onClick={() => addInventoryItem(device)}
//                               >
//                                 <Plus size={16} className="" />
//                                 Add
//                               </Button>
//                             </td>
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* SELECTED ITEMS */}
//             <Card className="rounded-[28px] border-0 shadow-sm">
//               <CardContent className="p-8 space-y-6">
//                 <div>
//                   <h2 className="text-2xl font-black">
//                     Selected Purchase Items
//                   </h2>

//                   <p className="text-sm text-muted-foreground">
//                     Edit quantities & serial numbers
//                   </p>
//                 </div>

//                 <div className="space-y-5">
//                   {items.length === 0 ? (
//                     <div className="text-center py-10 text-muted-foreground font-bold">
//                       No items selected
//                     </div>
//                   ) : (
//                     items.map((item, itemIndex) => (
//                       <div
//                         key={itemIndex}
//                         className="border rounded-3xl p-6 bg-muted/20"
//                       >
//                         {/* HEADER */}
//                         <div className="flex items-center justify-between mb-5">
//                           <div className="flex items-center gap-4">
//                             <img
//                               src={item.image}
//                               className="w-16 h-16 rounded-2xl object-cover border"
//                               alt={item.name}
//                             />

//                             <div>
//                               <h3 className="text-lg font-black">
//                                 {item.name}
//                               </h3>

//                               <p className="text-sm text-muted-foreground">
//                                 Inventory Item
//                               </p>
//                             </div>
//                           </div>

//                           <Button
//                             variant="destructive"
//                             size="icon"
//                             className="rounded-2xl"
//                             onClick={() => removeItem(itemIndex)}
//                           >
//                             <Trash2 size={18} />
//                           </Button>
//                         </div>

//                         {/* QUANTITY */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
//                           <div className="space-y-2">
//                             <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
//                               Quantity
//                             </label>

//                             <Input
//                               type="number"
//                               className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
//                               value={item.quantity}
//                               onChange={(e) =>
//                                 updateItem(
//                                   itemIndex,
//                                   "quantity",
//                                   Number(e.target.value),
//                                 )
//                               }
//                             />
//                           </div>
//                         </div>

//                         {/* SERIALS */}
//                         <div className="space-y-4">
//                           <div className="flex items-center justify-between">
//                             <div>
//                               <h4 className="font-black">
//                                 IMEI / Serial Numbers
//                               </h4>

//                               <p className="text-xs text-muted-foreground">
//                                 Multiple serials supported
//                               </p>
//                             </div>

//                             <Button
//                               variant="outline"
//                               className="rounded-2xl"
//                               onClick={() => addSerial(itemIndex)}
//                             >
//                               <Plus size={16} className="mr-2" />
//                               Add Serial
//                             </Button>
//                           </div>

//                           {item.serials.map(
//                             (serial: string, serialIndex: number) => (
//                               <div
//                                 key={serialIndex}
//                                 className="flex gap-3 items-center"
//                               >
//                                 <div className="relative flex-1">
//                                   <Input
//                                     className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
//                                     placeholder="Enter serial number"
//                                     value={serial}
//                                     onChange={(e) =>
//                                       updateSerial(
//                                         itemIndex,
//                                         serialIndex,
//                                         e.target.value,
//                                       )
//                                     }
//                                   />
//                                 </div>

//                                 {item.serials.length > 1 && (
//                                   <Button
//                                     variant="destructive"
//                                     size="icon"
//                                     className="rounded-2xl h-12 w-12"
//                                     onClick={() =>
//                                       removeSerial(itemIndex, serialIndex)
//                                     }
//                                   >
//                                     <Trash2 size={16} />
//                                   </Button>
//                                 )}
//                               </div>
//                             ),
//                           )}
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* RIGHT */}
//           <div className="space-y-6">
//             {/* STORE CARD */}
//             <Card className="rounded-[28px] overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
//               <CardContent className="p-8 space-y-6">
//                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-sky-400">
//                   <img
//                     src={profileData?.data?.image?.url}
//                     alt="Profile"
//                     className="w-12 h-12 rounded-full"
//                   />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-black">
//                     {profileData?.data?.shopName || "N/A"}
//                   </h2>

//                   <p className="text-slate-300 mt-2">
//                     {profileData?.data?.email || "N/A"}
//                   </p>

//                   <p className="text-slate-300">
//                     {profileData?.data?.phone || "N/A"}
//                   </p>
//                 </div>

//                 <div className="bg-white/10 rounded-2xl p-4">
//                   <p className="text-xs uppercase tracking-widest text-slate-300 font-black mb-1">
//                     Store Address
//                   </p>

//                   <p className="text-sm">
//                     {profileData?.data?.shopAddress || "N/A"}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* SUMMARY */}
//             <Card className="rounded-[28px] border-0 shadow-sm">
//               <CardContent className="p-8 space-y-5">
//                 <div>
//                   <h2 className="text-2xl font-black">Receipt Summary</h2>

//                   <p className="text-sm text-muted-foreground">
//                     Purchase receipt overview
//                   </p>
//                 </div>

//                 <div className="space-y-4">
//                   <div className="bg-muted rounded-2xl p-4">
//                     <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">
//                       Total Items
//                     </p>

//                     <p className="text-3xl font-black">{items.length}</p>
//                   </div>

//                   <div className="bg-muted rounded-2xl p-4">
//                     <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">
//                       Total Serials
//                     </p>

//                     <p className="text-3xl font-black">
//                       {items.reduce(
//                         (acc, item) => acc + item.serials.length,
//                         0,
//                       )}
//                     </p>
//                   </div>

//                   <div className="bg-muted rounded-2xl p-4">
//                     <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">
//                       Uploaded ID Images
//                     </p>

//                     <p className="text-3xl font-black">{idImages.length}</p>
//                   </div>
//                 </div>

//                 {/* BUTTON */}
//                 <Button
//                   disabled={!isFormValid || isPending}
//                   onClick={handleCreateReceipt}
//                   className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-wider"
//                 >
//                   Create Purchase Receipt
//                   {isPending && <Loader2 className="ml-2 animate-spin" />}
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";

import { User, Package, Loader2, Trash2, Plus } from "lucide-react";

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

import { useCreateInvoice } from "@/features/shopkeeper/inventory/hooks/useInventory";

// --------------------------------------------------
// PDF STYLES
// --------------------------------------------------
// --- Ultra-Modern PDF Styles (Premium Layout) ---
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontSize: 9,
    color: "#334155",
  },

  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 35,
    marginTop: 10,
  },
  logo: {
    width: 130,
    objectFit: "contain",
  },
  receiptMeta: {
    textAlign: "right",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 9,
    color: "#64748b",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    gap: 20,
  },
  infoBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  infoBoxTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 7.5,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: {
    color: "#1e293b",
    fontSize: 9.5,
    fontWeight: "bold",
    marginBottom: 8,
  },
  storeValue: {
    color: "#334155",
    fontSize: 9.5,
    lineHeight: 1.5,
    marginBottom: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
  },

  colProduct: {
    width: "40%",
  },

  colQty: {
    width: "10%",
    textAlign: "center",
    color: "#0f172a",
    fontWeight: "bold",
  },

  colSerials: {
    width: "30%",
  },

  colPrice: {
    width: "20%",
    textAlign: "right",
    fontWeight: "bold",
    color: "#0f172a",
  },

  productName: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0f172a",
  },

  modelText: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },

  serialText: {
    fontSize: 8,
    color: "#475569",
    backgroundColor: "#f1f5f9",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 2,
    alignSelf: "flex-start",
  },

  totalSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 24,
  },

  totalBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    borderRadius: 8,
    width: 200,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
  },

  totalValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
  },

  idImagesContainer: {
    flexDirection: "row",
    gap: 14,
    marginTop: 4,
  },

  idImageFrame: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 4,
    backgroundColor: "#f8fafc",
  },

  idImage: {
    width: 170,
    height: 105,
    borderRadius: 6,
    objectFit: "cover",
  },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 7.5,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 15,
    lineHeight: 1.4,
  },
});

// --------------------------------------------------
// MODERN RECEIPT PDF COMPONENT WITH PRICE
// --------------------------------------------------
const PurchaseReceiptPDF = ({ customer, items, shopkeeper, total }: any) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.headerBar} />

      <View style={pdfStyles.header}>
        {shopkeeper?.image?.url ? (
          <Image src={shopkeeper.image.url} style={pdfStyles.logo} />
        ) : (
          <Text style={[pdfStyles.title, { fontSize: 18 }]}>
            {shopkeeper?.shopName || "STORE"}
          </Text>
        )}

        <View style={pdfStyles.receiptMeta}>
          <Text style={pdfStyles.title}>PURCHASE RECEIPT</Text>

          <Text style={pdfStyles.dateText}>
            Date:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>

      {/* CUSTOMER + SHOP */}
      <View style={[pdfStyles.section, pdfStyles.infoRow]}>
        {/* Customer Information Card */}
        <View style={pdfStyles.infoBox}>
          <Text style={pdfStyles.infoBoxTitle}>Customer Details</Text>

          <Text style={pdfStyles.label}>Name</Text>
          <Text style={pdfStyles.value}>
            {customer?.firstName} {customer?.lastName}
          </Text>

          <Text style={pdfStyles.label}>Phone</Text>
          <Text style={pdfStyles.value}>{customer?.phone}</Text>

          <Text style={pdfStyles.label}>Email</Text>
          <Text style={pdfStyles.value}>{customer?.email || "N/A"}</Text>

          <Text style={pdfStyles.label}>Address</Text>
          <Text style={pdfStyles.value}>{customer?.address || "N/A"}</Text>

          <Text style={pdfStyles.label}>Govt ID</Text>
          <Text style={pdfStyles.value}>{customer?.idNumber}</Text>
        </View>

        <View style={pdfStyles.infoBox}>
          <Text style={pdfStyles.infoBoxTitle}>Shop Information</Text>

          <Text style={[pdfStyles.value, { fontSize: 11 }]}>
            {shopkeeper?.shopName}
          </Text>

          <Text style={pdfStyles.storeValue}>{shopkeeper?.shopAddress}</Text>

          <Text style={pdfStyles.storeValue}>{shopkeeper?.phone}</Text>

          <Text style={pdfStyles.storeValue}>{shopkeeper?.email}</Text>
        </View>
      </View>

      {/* ITEMS TABLE SECTION */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Purchased Devices</Text>

        <View style={pdfStyles.tableHeader}>
          <Text style={pdfStyles.colProduct}>Product / Model</Text>
          <Text style={pdfStyles.colQty}>Qty</Text>
          <Text style={pdfStyles.colSerials}>IMEI / Serials</Text>
          <Text style={pdfStyles.colPrice}>Price</Text>
        </View>

        {items?.map((item: any, index: number) => (
          <View key={index} style={pdfStyles.row}>
            <View style={pdfStyles.colProduct}>
              <Text style={pdfStyles.productName}>{item.name}</Text>

              <Text style={pdfStyles.modelText}>{item.model || "N/A"}</Text>
            </View>

            <Text style={pdfStyles.colQty}>{item.quantity}</Text>

            <View style={pdfStyles.colSerials}>
              {item.serials.map((serial: string, idx: number) => (
                <Text key={idx} style={pdfStyles.serialText}>
                  • {serial}
                </Text>
              ))}
            </View>

            <Text style={pdfStyles.colPrice}>
              $
              {(
                Number(item.expectedPrice || 0) * Number(item.quantity || 1)
              ).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* TOTAL */}
      <View style={pdfStyles.totalSection}>
        <View style={pdfStyles.totalBox}>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>Total Value</Text>

            <Text style={pdfStyles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* FOOTER */}
      <Text style={pdfStyles.footer}>
        This document confirms the legitimate purchase of the listed devices
        from the customer. All IMEI and serial numbers are verified and attached
        with government identification proof.
      </Text>
    </Page>
  </Document>
);

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------
export default function CreatePurchaseReceipt() {
  const { data: profileData } = useMyProfile();

  const session = useSession();

  const shopkeeperId = session?.data?.user?.id;

  const { mutate: createInvoice, isPending } = useCreateInvoice();

  // CUSTOMER
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    idNumber: "",
  });

  // ITEMS
  const [items, setItems] = useState<any[]>([
    {
      name: "",
      model: "",
      quantity: 1,
      expectedPrice: 0,
      serials: [""],
    },
  ]);

  // ADD ITEM
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        name: "",
        model: "",
        quantity: 1,
        expectedPrice: 0,
        serials: [""],
      },
    ]);
  };
  // REMOVE ITEM
  const removeItem = (index: number) => {
    const updated = [...items];

    updated.splice(index, 1);

    setItems(updated);
  };

  // UPDATE ITEM
  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];

    updated[index][field] = value;

    setItems(updated);
  };

  // ADD SERIAL
  const addSerial = (itemIndex: number) => {
    const updated = [...items];

    updated[itemIndex].serials.push("");

    setItems(updated);
  };

  // UPDATE SERIAL
  const updateSerial = (
    itemIndex: number,
    serialIndex: number,
    value: string,
  ) => {
    const updated = [...items];

    updated[itemIndex].serials[serialIndex] = value;

    setItems(updated);
  };

  // REMOVE SERIAL
  const removeSerial = (itemIndex: number, serialIndex: number) => {
    const updated = [...items];

    updated[itemIndex].serials.splice(serialIndex, 1);

    setItems(updated);
  };

  // VALIDATION
  const hasEmptySerial = items.some((item) =>
    item.serials.some((serial: string) => !serial.trim()),
  );

  const isFormValid = useMemo(() => {
    return (
      customer.firstName &&
      customer.phone &&
      customer.idNumber &&
      items.length > 0 &&
      !hasEmptySerial
    );
  }, [customer, items, hasEmptySerial]);

  // TOTAL
  const total = items.reduce(
    (acc, item) =>
      acc + Number(item.expectedPrice || 0) * Number(item.quantity || 1),
    0,
  );

  // CREATE RECEIPT
  const handleCreateReceipt = async () => {
    if (!isFormValid) {
      toast.error("Please complete all required fields");

      return;
    }

    const doc = (
      <PurchaseReceiptPDF
        customer={customer}
        items={items}
        shopkeeper={profileData?.data}
        total={total}
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="xl:col-span-2 space-y-6">
            {/* CUSTOMER */}
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
                      Customer details & verification
                    </p>
                  </div>
                </div>

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
                    placeholder="Email"
                    className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                    value={customer.email}
                    type="email"
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        email: e.target.value,
                      })
                    }
                  />

                  <Input
                    placeholder="Phone"
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
                      placeholder="Address"
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

                  <div className="md:col-span-2">
                    <Input
                      placeholder="Government ID Number"
                      className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                      value={customer.idNumber}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          idNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* OCR */}
                {/* <div className="flex flex-wrap gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl"
                  >
                    <ScanLine className="mr-2 h-4 w-4" />
                    Scan ID / IMEI
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload ID Images
                  </Button>
                </div> */}

                {/* <input
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                /> */}

                {/* PREVIEW */}
                {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                </div> */}
              </CardContent>
            </Card>

            {/* ITEMS */}
            <Card className="rounded-[28px] border-0 shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">Purchase Items</h2>

                    <p className="text-sm text-muted-foreground">
                      Add customer devices manually
                    </p>
                  </div>

                  <Button onClick={addItem} className="rounded-2xl">
                    <Plus size={16} className="mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-5">
                  {items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="border rounded-3xl p-6 bg-muted/20"
                    >
                      {/* HEADER */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-black">
                            Device #{itemIndex + 1}
                          </h3>

                          <p className="text-sm text-muted-foreground">
                            Manual purchase entry
                          </p>
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

                      {/* INPUTS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        <Input
                          placeholder="Item Name"
                          className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                          value={item.name}
                          onChange={(e) =>
                            updateItem(itemIndex, "name", e.target.value)
                          }
                        />

                        <Input
                          placeholder="Model"
                          className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                          value={item.model}
                          onChange={(e) =>
                            updateItem(itemIndex, "model", e.target.value)
                          }
                        />

                        <div>
                          <label className="font-bold text-muted-foreground">
                            Quantity
                          </label>
                          <Input
                            type="number"
                            placeholder="Quantity"
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

                        <div>
                          <label className="font-bold text-muted-foreground">
                            Purchase Price
                          </label>
                          <Input
                            type="number"
                            placeholder="Purchase Price"
                            className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                            value={item.expectedPrice}
                            onChange={(e) =>
                              updateItem(
                                itemIndex,
                                "expectedPrice",
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
                              Multiple IMEI supported
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
                              <Input
                                className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                                placeholder="Enter IMEI / Serial"
                                value={serial}
                                onChange={(e) =>
                                  updateSerial(
                                    itemIndex,
                                    serialIndex,
                                    e.target.value,
                                  )
                                }
                              />

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
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* STORE */}
            <Card className="rounded-[28px] overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <CardContent className="p-8 space-y-6">
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
                    Purchase overview
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">
                      Total Devices
                    </p>

                    <p className="text-3xl font-black">{items.length}</p>
                  </div>

                  <div className="bg-muted rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">
                      Total IMEI / Serials
                    </p>

                    <p className="text-3xl font-black">
                      {items.reduce(
                        (acc, item) => acc + item.serials.length,
                        0,
                      )}
                    </p>
                  </div>
                </div>

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
