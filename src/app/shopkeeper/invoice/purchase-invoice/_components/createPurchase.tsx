// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React, { useMemo, useState, useRef, useEffect } from "react";
// import { User, Package, Loader2, Trash2, Plus, ScanLine, Camera, Upload, CheckCircle2, DollarSign } from "lucide-react";
// import { useSession } from "next-auth/react";
// import { toast } from "sonner";
// import { pdf } from "@react-pdf/renderer";
// import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// // --- CLIENT LIBRARIES IMPORT ---
// import { BrowserMultiFormatReader } from "@zxing/library";
// import { createWorker } from "tesseract.js";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent } from "@/components/ui/card";
// import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
// import { useCreateInvoice } from "@/features/shopkeeper/inventory/hooks/useInventory";

// // --- Ultra-Modern PDF Styles ---
// const pdfStyles = StyleSheet.create({
//   page: { padding: 40, backgroundColor: "#ffffff", fontSize: 9, color: "#334155" },
//   headerBar: { position: "absolute", top: 0, left: 0, right: 0, height: 6, backgroundColor: "#0f172a" },
//   header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 35, marginTop: 10 },
//   logo: { width: 130, objectFit: "contain" },
//   receiptMeta: { textAlign: "right" },
//   title: { fontSize: 22, fontWeight: "bold", color: "#0f172a", letterSpacing: 1, marginBottom: 4 },
//   dateText: { fontSize: 9, color: "#64748b" },
//   section: { marginBottom: 24 },
//   sectionTitle: { fontSize: 10, fontWeight: "bold", color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#cbd5e1", paddingBottom: 4 },
//   infoRow: { flexDirection: "row", gap: 20 },
//   infoBox: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 8, padding: 14, borderWidth: 1, borderColor: "#f1f5f9" },
//   infoBoxTitle: { fontSize: 9, fontWeight: "bold", color: "#0f172a", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
//   label: { fontSize: 7.5, color: "#64748b", textTransform: "uppercase", marginBottom: 2 },
//   value: { color: "#1e293b", fontSize: 9.5, fontWeight: "bold", marginBottom: 8 },
//   storeValue: { color: "#334155", fontSize: 9.5, lineHeight: 1.5, marginBottom: 2 },
//   tableHeader: { flexDirection: "row", backgroundColor: "#0f172a", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, color: "#ffffff", fontWeight: "bold", fontSize: 8, textTransform: "uppercase", letterSpacing: 0.5 },
//   row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 12, paddingHorizontal: 12, alignItems: "center" },
//   colProduct: { width: "40%" },
//   colQty: { width: "10%", textAlign: "center", color: "#0f172a", fontWeight: "bold" },
//   colSerials: { width: "30%" },
//   colPrice: { width: "20%", textAlign: "right", fontWeight: "bold", color: "#0f172a" },
//   productName: { fontSize: 9.5, fontWeight: "bold", color: "#0f172a" },
//   modelText: { fontSize: 8, color: "#64748b", marginTop: 2 },
//   serialText: { fontSize: 8, color: "#475569", backgroundColor: "#f1f5f9", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, marginBottom: 2, alignSelf: "flex-start" },
//   totalSection: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 24 },
//   totalBox: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", padding: 12, borderRadius: 8, width: 200 },
//   totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   totalLabel: { fontSize: 9, fontWeight: "bold", color: "#64748b", textTransform: "uppercase" },
//   totalValue: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },
//   footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", color: "#94a3b8", fontSize: 7.5, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 15, lineHeight: 1.4 },
// });

// const PurchaseReceiptPDF = ({ customer, items, shopkeeper, total }: any) => (
//   <Document>
//     <Page size="A4" style={pdfStyles.page}>
//       <View style={pdfStyles.headerBar} />
//       <View style={pdfStyles.header}>
//         {shopkeeper?.image?.url ? (
//           <Image src={shopkeeper.image.url} style={pdfStyles.logo} />
//         ) : (
//           <Text style={[pdfStyles.title, { fontSize: 18 }]}>{shopkeeper?.shopName || "STORE"}</Text>
//         )}
//         <View style={pdfStyles.receiptMeta}>
//           <Text style={pdfStyles.title}>PURCHASE RECEIPT</Text>
//           <Text style={pdfStyles.dateText}>Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</Text>
//         </View>
//       </View>

//       <View style={[pdfStyles.section, pdfStyles.infoRow]}>
//         <View style={pdfStyles.infoBox}>
//           <Text style={pdfStyles.infoBoxTitle}>Customer Details</Text>
//           <Text style={pdfStyles.label}>Name</Text>
//           <Text style={pdfStyles.value}>{customer?.firstName} {customer?.lastName}</Text>
//           <Text style={pdfStyles.label}>Phone</Text>
//           <Text style={pdfStyles.value}>{customer?.phone}</Text>
//           <Text style={pdfStyles.label}>Govt ID</Text>
//           <Text style={pdfStyles.value}>{customer?.idNumber}</Text>
//         </View>
//         <View style={pdfStyles.infoBox}>
//           <Text style={pdfStyles.infoBoxTitle}>Shop Information</Text>
//           <Text style={[pdfStyles.value, { fontSize: 11 }]}>{shopkeeper?.shopName}</Text>
//           <Text style={pdfStyles.storeValue}>{shopkeeper?.shopAddress}</Text>
//           <Text style={pdfStyles.storeValue}>{shopkeeper?.phone}</Text>
//         </View>
//       </View>

//       <View style={pdfStyles.section}>
//         <Text style={pdfStyles.sectionTitle}>Purchased Devices</Text>
//         <View style={pdfStyles.tableHeader}>
//           <Text style={pdfStyles.colProduct}>Product Specifications</Text>
//           <Text style={pdfStyles.colQty}>Qty</Text>
//           <Text style={pdfStyles.colSerials}>IMEI / Serials</Text>
//           <Text style={pdfStyles.colPrice}>Price</Text>
//         </View>
//         {items?.map((item: any, index: number) => (
//           <View key={index} style={pdfStyles.row}>
//             <View style={pdfStyles.colProduct}>
//               <Text style={pdfStyles.productName}>{item.name}</Text>
//               <Text style={pdfStyles.modelText}>{item.storage} • {item.color}</Text>
//             </View>
//             <Text style={pdfStyles.colQty}>{item.quantity}</Text>
//             <View style={pdfStyles.colSerials}>
//               {item.serials.map((serial: string, idx: number) => (
//                 <Text key={idx} style={pdfStyles.serialText}>• {serial}</Text>
//               ))}
//             </View>
//             <Text style={pdfStyles.colPrice}>${(Number(item.expectedPrice || 0) * Number(item.quantity || 1)).toFixed(2)}</Text>
//           </View>
//         ))}
//       </View>

//       <View style={pdfStyles.totalSection}>
//         <View style={pdfStyles.totalBox}>
//           <View style={pdfStyles.totalRow}>
//             <Text style={pdfStyles.totalLabel}>Total Value</Text>
//             <Text style={pdfStyles.totalValue}>${total.toFixed(2)}</Text>
//           </View>
//         </View>
//       </View>
//       <Text style={pdfStyles.footer}>Verified IMEI and serial numbers are attached with customer identification proof.</Text>
//     </Page>
//   </Document>
// );

// export default function CreatePurchaseReceipt() {
//   const { data: profileData } = useMyProfile();
//   const session = useSession();
//   const shopkeeperId = session?.data?.user?.id;
//   const { mutate: createInvoice, isPending } = useCreateInvoice();

//   const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
//   const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
//   const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

//   const [customer, setCustomer] = useState({
//     firstName: "", lastName: "", email: "", phone: "", address: "", idNumber: ""
//   });

//   const [items, setItems] = useState<any[]>([
//     { name: "", storage: "", color: "", condition: "", quantity: 1, expectedPrice: 0, serials: [] }
//   ]);

//   const [scanInputs, setScanInputs] = useState<{ [key: number]: string }>({});
//   const [isParsingFile, setIsParsingFile] = useState<{ [key: number]: boolean }>({});
//   const [activeCameraStream, setActiveCameraStream] = useState<{ [key: number]: boolean }>({});

//   useEffect(() => {
//     codeReaderRef.current = new BrowserMultiFormatReader();
//     return () => {
//       if (codeReaderRef.current) {
//         codeReaderRef.current.reset();
//       }
//     };
//   }, []);

//   const addItem = () => {
//     setItems((prev) => [...prev, { name: "", storage: "", color: "", condition: "", quantity: 1, expectedPrice: 0, serials: [] }]);
//   };

//   const removeItem = (index: number) => {
//     const updated = [...items];
//     updated.splice(index, 1);
//     setItems(updated);
//     if (activeCameraStream[index]) {
//       stopCameraScanning(index);
//     }
//   };

//   const updateItem = (index: number, field: string, value: any) => {
//     const updated = [...items];
//     updated[index][field] = value;
//     setItems(updated);
//   };

//   // --- WORKFLOW 1: TEXT KEYBOARD KEY ENTER SCANNING ---
//   const handleScanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, itemIndex: number) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const code = scanInputs[itemIndex]?.trim();
//       if (!code) return;

//       appendBarcodeCode(itemIndex, code);
//       setScanInputs((prev) => ({ ...prev, [itemIndex]: "" }));
//     }
//   };

//   // --- WORKFLOW 2: LIVE CAMERA STREAMS (ZXING) ---
//   const startCameraScanning = async (itemIndex: number) => {
//     if (!codeReaderRef.current) return;

//     setActiveCameraStream(prev => ({ ...prev, [itemIndex]: true }));
//     toast.loading("Accessing media devices hardware...", { id: `cam-${itemIndex}` });

//     setTimeout(async () => {
//       try {
//         const videoElement = videoRefs.current[itemIndex];
//         if (!videoElement) throw new Error("Video node element missing");

//         codeReaderRef.current?.decodeFromVideoDevice(
//           null,
//           videoElement,
//           (result, error) => {
//             if (result) {
//               const matchedCodeText = result.getText()?.trim();
//               if (matchedCodeText) {
//                 appendBarcodeCode(itemIndex, matchedCodeText);
//                 stopCameraScanning(itemIndex);
//               }
//             }
//             if (error && !(error.name === "NotFoundException")) {
//               console.debug("ZXing processing frame tick error:", error);
//             }
//           }
//         );
//         toast.dismiss(`cam-${itemIndex}`);
//         toast.success("Camera viewfinder active. Align barcode inside frame panel.");
//       } catch (err: any) {
//         console.error("Camera initial stream startup failure error:", err);
//         toast.dismiss(`cam-${itemIndex}`);
//         toast.error("Failed to connect camera.");
//         setActiveCameraStream(prev => ({ ...prev, [itemIndex]: false }));
//       }
//     }, 300);
//   };

//   const stopCameraScanning = (itemIndex: number) => {
//     if (codeReaderRef.current) codeReaderRef.current.reset();
//     setActiveCameraStream(prev => ({ ...prev, [itemIndex]: false }));
//   };

//   const toggleCameraScanner = (itemIndex: number) => {
//     if (activeCameraStream[itemIndex]) {
//       stopCameraScanning(itemIndex);
//     } else {
//       items.forEach((_, idx) => {
//         if (activeCameraStream[idx]) stopCameraScanning(idx);
//       });
//       startCameraScanning(itemIndex);
//     }
//   };

//   // --- WORKFLOW 3: ATTACHMENT IMAGE FILE READERS (TESSERACT OCR) ---
//   const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemIndex: number) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setIsParsingFile(prev => ({ ...prev, [itemIndex]: true }));
//     const loadingToastId = toast.loading(`Tesseract OCR framework reading "${file.name}"...`);

//     try {
//       const imageUrl = URL.createObjectURL(file);

//       try {
//         const zxingResult = await codeReaderRef.current?.decodeFromImageUrl(imageUrl);
//         const zxingText = zxingResult?.getText()?.trim();
//         if (zxingText) {
//           appendBarcodeCode(itemIndex, zxingText);
//           toast.dismiss(loadingToastId);
//           setIsParsingFile(prev => ({ ...prev, [itemIndex]: false }));
//           if (fileInputRefs.current[itemIndex]) fileInputRefs.current[itemIndex]!.value = "";
//           return;
//         }
//       } catch (e) {
//         console.debug("Fallback processing initializing via raw text OCR parser blocks...", e);
//       }

//       const worker = await createWorker("eng");
//       const ret = await worker.recognize(imageUrl);
//       const fullExtractedRawText = ret.data.text;
//       await worker.terminate();

//       URL.revokeObjectURL(imageUrl);

//       const parsedMatchArray = fullExtractedRawText.match(/[A-Z0-9]{8,18}/g);

//       if (parsedMatchArray && parsedMatchArray.length > 0) {
//         const targetValidCodeText = parsedMatchArray[0];
//         appendBarcodeCode(itemIndex, targetValidCodeText);
//         toast.dismiss(loadingToastId);
//       } else {
//         toast.dismiss(loadingToastId);
//         toast.error("Failed to extract legible codes.");
//       }
//     } catch (error) {
//       console.error("OCR Extraction stack error:", error);
//       toast.dismiss(loadingToastId);
//       toast.error("Engine failed processing target documents.");
//     } finally {
//       setIsParsingFile(prev => ({ ...prev, [itemIndex]: false }));
//       if (fileInputRefs.current[itemIndex]) fileInputRefs.current[itemIndex]!.value = "";
//     }
//   };

//   // --- STACK DATA BUFFER MANIPULATION STREAM ---
//   const appendBarcodeCode = (itemIndex: number, code: string) => {
//     const updatedItems = [...items];

//     if (updatedItems[itemIndex].serials.includes(code)) {
//       toast.error(`Code "${code}" already exists inside item list.`);
//       return;
//     }

//     updatedItems[itemIndex].serials.push(code);

//     // Auto incremental sync configuration sequence
//     if (updatedItems[itemIndex].serials.length > updatedItems[itemIndex].quantity) {
//       updatedItems[itemIndex].quantity = updatedItems[itemIndex].serials.length;
//     }

//     setItems(updatedItems);
//     toast.success(`Code "${code}" appended smoothly to stack!`);
//   };

//   const removeSerial = (itemIndex: number, serialIndex: number) => {
//     const updated = [...items];
//     updated[itemIndex].serials.splice(serialIndex, 1);
//     setItems(updated);
//   };

//   const isFormValid = useMemo(() => {
//     return (
//       customer.firstName &&
//       customer.phone &&
//       customer.idNumber &&
//       items.length > 0 &&
//       items.every(item => item.name && item.serials.length > 0)
//     );
//   }, [customer, items]);

//   // Aggregated pricing calculator loop node hook
//   const total = items.reduce((acc, item) => acc + Number(item.expectedPrice || 0) * Number(item.quantity || 1), 0);

//   const handleCreateReceipt = async () => {
//     if (!isFormValid) {
//       toast.error("Please complete all required fields and ensure barcodes are populated");
//       return;
//     }
//     const doc = <PurchaseReceiptPDF customer={customer} items={items} shopkeeper={profileData?.data} total={total} />;
//     const blob = await pdf(doc).toBlob();
//     const file = new File([blob], `purchase_receipt_${customer.firstName}.pdf`, { type: "application/pdf" });

//     createInvoice(
//       { shopkeeperId: shopkeeperId || "", type: "Purchase Invoice", invoice: file },
//       {
//         onSuccess: () => toast.success("Purchase receipt created successfully"),
//         onError: () => toast.error("Failed to create purchase receipt")
//       }
//     );
//   };

//   return (
//     <div className="min-h-screen bg-background px-4 py-8 md:px-8">
//       <div className="mx-auto space-y-8">
//         {/* HEADER */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-black tracking-tight">Purchase Receipt Generator</h1>
//             <p className="text-sm text-muted-foreground mt-1">Manual entry stream engine seamlessly linked to automated total processing</p>
//           </div>
//           <div className="hidden md:flex items-center gap-3 bg-orange-50 text-orange-600 px-5 py-3 rounded-2xl font-bold">
//             <Package size={18} />
//             {items.length} Items Configured
//           </div>
//         </div>

//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//           {/* LEFT CONTAINER */}
//           <div className="xl:col-span-2 space-y-6">

//             {/* CUSTOMER PANEL */}
//             <Card className="rounded-[28px] border-0 shadow-sm">
//               <CardContent className="p-8 space-y-6">
//                 <div className="flex items-center gap-3">
//                   <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
//                     <User size={22} />
//                   </div>
//                   <div>
//                     <h2 className="text-2xl font-black">Customer Information</h2>
//                     <p className="text-sm text-muted-foreground">Verification parameters identity configuration</p>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                   <Input placeholder="First Name" className="rounded-2xl h-12 border-primary bg-background font-bold" value={customer.firstName} onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })} />
//                   <Input placeholder="Last Name" className="rounded-2xl h-12 border-primary bg-background font-bold" value={customer.lastName} onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })} />
//                   <Input placeholder="Email" className="rounded-2xl h-12 border-primary bg-background font-bold" value={customer.email} type="email" onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
//                   <Input placeholder="Phone" className="rounded-2xl h-12 border-primary bg-background font-bold" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
//                   <div className="md:col-span-2">
//                     <Textarea placeholder="Address" className="rounded-2xl h-12 border-primary bg-background font-bold" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
//                   </div>
//                   <div className="md:col-span-2">
//                     <Input placeholder="Government ID Number" className="rounded-2xl h-12 border-primary bg-background font-bold" value={customer.idNumber} onChange={(e) => setCustomer({ ...customer, idNumber: e.target.value })} />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* PRODUCT ENTRIES MODULE */}
//             <Card className="rounded-[28px] border-0 shadow-sm">
//               <CardContent className="p-8 space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className="text-2xl font-black">Purchase Items</h2>
//                     <p className="text-sm text-muted-foreground">Configure specifications and accumulate tracking logs</p>
//                   </div>
//                   <Button onClick={addItem} className="rounded-2xl">
//                     <Plus size={16} className="mr-2" /> Add Item
//                   </Button>
//                 </div>

//                 <div className="space-y-5">
//                   {items.map((item, itemIndex) => {
//                     const isScannerAvailable = item.name;
//                     // Auto dynamically track single device totals grid row calculation context
//                     const currentItemRowTotal = Number(item.expectedPrice || 0) * Number(item.quantity || 1);

//                     return (
//                       <div key={itemIndex} className="border rounded-3xl p-6 bg-muted/20 space-y-6">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <h3 className="text-lg font-black">Device #{itemIndex + 1}</h3>
//                             <p className="text-sm text-muted-foreground">Specification logging state control</p>
//                           </div>
//                           <Button variant="destructive" size="icon" className="rounded-2xl" onClick={() => removeItem(itemIndex)}>
//                             <Trash2 size={18} />
//                           </Button>
//                         </div>

//                         {/* PRODUCT INPUTS MATRIX */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                           <Input placeholder="Item Name (Required)" className="rounded-2xl h-12 border-primary bg-background font-bold" value={item.name} onChange={(e) => updateItem(itemIndex, "name", e.target.value)} />
//                           <Input placeholder="Storage / Memory (e.g., 256GB)" className="rounded-2xl h-12 border-primary bg-background font-bold" value={item.storage || ""} onChange={(e) => updateItem(itemIndex, "storage", e.target.value)} />
//                           <Input placeholder="Color" className="rounded-2xl h-12 border-primary bg-background font-bold" value={item.color || ""} onChange={(e) => updateItem(itemIndex, "color", e.target.value)} />
//                           <Input placeholder="Condition" className="rounded-2xl h-12 border-primary bg-background font-bold" value={item.condition || ""} onChange={(e) => updateItem(itemIndex, "condition", e.target.value)} />

//                           {/* QUANTITY CONFIGURATOR RESTORED */}
//                           <div>
//                             <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">Quantity</label>
//                             <Input type="number" min={1} className="rounded-2xl h-12 border-primary bg-background font-bold" value={item.quantity} onChange={(e) => updateItem(itemIndex, "quantity", Math.max(1, Number(e.target.value)))} />
//                           </div>

//                           {/* UNIT PRICE */}
//                           <div>
//                             <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">Price Per Unit</label>
//                             <Input type="number" className="rounded-2xl h-12 border-primary bg-background font-bold" value={item.expectedPrice} onChange={(e) => updateItem(itemIndex, "expectedPrice", Number(e.target.value))} />
//                           </div>
//                         </div>

//                         {/* LINE ITEM CALCULATION LIVE BAR */}
//                         <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
//                           <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
//                             <DollarSign className="w-3.5 h-3.5 text-primary" /> Item Calculation Subtotal:
//                           </span>
//                           <span className="text-lg font-black text-primary font-mono">
//                             ${currentItemRowTotal.toFixed(2)}
//                           </span>
//                         </div>

//                         {/* HIGH FIDELITY UNIFIED REAL-TIME STREAM SCANNING BLOCK */}
//                         {isScannerAvailable ? (
//                           <div className="border-t pt-5 border-dashed border-muted-foreground/40 space-y-4">
//                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
//                               <div>
//                                 <h4 className="font-black text-foreground flex items-center gap-2">
//                                   <ScanLine className="w-5 h-5 text-primary" />
//                                   Universal Processing Scanner Hub
//                                 </h4>
//                                 <p className="text-xs text-muted-foreground">Type + Enter, engage active web camera tracking, or drop attachment image.</p>
//                               </div>

//                               <div className="flex items-center gap-2 self-start md:self-auto">
//                                 <Button type="button" variant={activeCameraStream[itemIndex] ? "default" : "outline"} className="rounded-xl h-9 text-xs font-bold gap-1.5" onClick={() => toggleCameraScanner(itemIndex)}>
//                                   <Camera className="w-3.5 h-3.5" />
//                                   {activeCameraStream[itemIndex] ? "Close Camera" : "Open Camera Stream"}
//                                 </Button>

//                                 <Button type="button" variant="outline" className="rounded-xl h-9 text-xs font-bold gap-1.5" disabled={isParsingFile[itemIndex]} onClick={() => fileInputRefs.current[itemIndex]?.click()}>
//                                   {isParsingFile[itemIndex] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
//                                   Attach Receipt/Image
//                                 </Button>
//                                 <input type="file" ref={el => { fileInputRefs.current[itemIndex] = el; }} accept="image/*" className="hidden" onChange={(e) => handleAttachmentUpload(e, itemIndex)} />
//                               </div>
//                             </div>

//                             {activeCameraStream[itemIndex] && (
//                               <div className="relative w-full h-56 rounded-2xl bg-black border border-primary overflow-hidden flex flex-col items-center justify-center">
//                                 <video ref={el => { videoRefs.current[itemIndex] = el; }} className="w-full h-full object-cover" muted playsInline />
//                                 <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
//                                   <div className="w-64 h-36 border-2 border-dashed border-primary rounded-xl relative flex items-center justify-center bg-black/10">
//                                     <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] absolute top-1/2 left-0 animate-bounce" />
//                                   </div>
//                                 </div>
//                                 <span className="absolute bottom-3 left-4 text-[11px] bg-black/70 font-mono text-primary px-3 py-1 rounded-lg">
//                                   ZXing Optical Engine Processing Real-Time Ticks...
//                                 </span>
//                               </div>
//                             )}

//                             <div className="relative">
//                               <Input
//                                 className="rounded-2xl h-12 pl-11 border-primary bg-background font-bold focus-visible:ring-primary"
//                                 placeholder="Scan/Type code here and press Enter to append seamlessly..."
//                                 value={scanInputs[itemIndex] || ""}
//                                 onChange={(e) => setScanInputs((prev) => ({ ...prev, [itemIndex]: e.target.value }))}
//                                 onKeyDown={(e) => handleScanKeyDown(e, itemIndex)}
//                               />
//                               <div className="absolute left-4 top-3.5 text-muted-foreground">
//                                 <ScanLine className="w-5 h-5" />
//                               </div>
//                             </div>

//                             <div className="space-y-2">
//                               <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
//                                 <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Active Registers Log:</span>
//                                 <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md font-mono">{item.serials.length} Stored Ledger Nodes</span>
//                               </div>

//                               <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1.5 border rounded-2xl bg-background/50">
//                                 {item.serials.length === 0 && (
//                                   <p className="text-xs text-muted-foreground/60 italic p-1">No identifiers cached inside streaming log grid yet.</p>
//                                 )}
//                                 {item.serials.map((serial: string, serialIndex: number) => (
//                                   <div key={serialIndex} className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-900 border px-3 py-1.5 rounded-xl group transition-all">
//                                     <span className="text-muted-foreground">#{serialIndex + 1}:</span>
//                                     <span className="text-foreground tracking-tight">{serial}</span>
//                                     <button type="button" className="text-muted-foreground hover:text-destructive transition-colors ml-1" onClick={() => removeSerial(itemIndex, serialIndex)}>
//                                       <Trash2 size={13} />
//                                     </button>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="text-center p-4 border border-dashed rounded-2xl bg-zinc-50/50">
//                             <p className="text-xs text-muted-foreground/80 font-bold">Please define the baseline Item Name first to unlock advanced camera optical parsing & attachment extractors.</p>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* RIGHT CONTAINER */}
//           <div className="space-y-6">
//             <Card className="rounded-[28px] overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
//               <CardContent className="p-8 space-y-6">
//                 <div>
//                   <h2 className="text-2xl font-black">{profileData?.data?.shopName || "N/A"}</h2>
//                   <p className="text-slate-300 mt-2">{profileData?.data?.email || "N/A"}</p>
//                   <p className="text-slate-300">{profileData?.data?.phone || "N/A"}</p>
//                 </div>
//                 <div className="bg-white/10 rounded-2xl p-4">
//                   <p className="text-xs uppercase tracking-widest text-slate-300 font-black mb-1">Store Address</p>
//                   <p className="text-sm">{profileData?.data?.shopAddress || "N/A"}</p>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="rounded-[28px] border-0 shadow-sm">
//               <CardContent className="p-8 space-y-5">
//                 <div>
//                   <h2 className="text-2xl font-black">Receipt Summary</h2>
//                   <p className="text-sm text-muted-foreground">Purchase overview parameter logging</p>
//                 </div>

//                 <div className="space-y-4">
//                   <div className="bg-muted rounded-2xl p-4">
//                     <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">Total Unique Devices</p>
//                     <p className="text-3xl font-black">{items.length}</p>
//                   </div>
//                   <div className="bg-muted rounded-2xl p-4">
//                     <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">Aggregated Scanned Identifiers</p>
//                     <p className="text-3xl font-black">{items.reduce((acc, item) => acc + item.serials.length, 0)}</p>
//                   </div>
//                 </div>

//                 {/* GRAND TOTAL */}
//                 <div className="border-t pt-4 flex items-center justify-between">
//                   <span className="text-base font-black uppercase tracking-tight">Grand Total:</span>
//                   <span className="text-2xl font-black text-primary font-mono">${total.toFixed(2)}</span>
//                 </div>

//                 <Button disabled={!isFormValid || isPending} onClick={handleCreateReceipt} className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-wider">
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

// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React, { useMemo, useState, useRef, useEffect, ChangeEvent } from "react";
// import { User, Package, Loader2, Trash2, Plus, ScanLine, Camera, Upload, CheckCircle2, DollarSign, ShieldAlert } from "lucide-react";
// import { useSession } from "next-auth/react";
// import { toast } from "sonner";
// import { pdf } from "@react-pdf/renderer";
// import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// // --- CLIENT LIBRARIES IMPORT ---
// import { BrowserMultiFormatReader } from "@zxing/library";
// import { createWorker } from "tesseract.js";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent } from "@/components/ui/card";
// import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
// import { useCreateInvoice } from "@/features/shopkeeper/inventory/hooks/useInventory";

// interface OcrResponse {
//   success: boolean;
//   message: string;
//   data: {
//     nidNumber: string;
//     isValid: boolean;
//     message: string;
//     processingTime: number;
//   };
// }

// // --- Ultra-Modern PDF Styles ---
// const pdfStyles = StyleSheet.create({
//   page: { padding: 40, backgroundColor: "#ffffff", fontSize: 9, color: "#334155" },
//   headerBar: { position: "absolute", top: 0, left: 0, right: 0, height: 6, backgroundColor: "#0f172a" },
//   header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 35, marginTop: 10 },
//   logo: { width: 130, objectFit: "contain" },
//   receiptMeta: { textAlign: "right" },
//   title: { fontSize: 22, fontWeight: "bold", color: "#0f172a", letterSpacing: 1, marginBottom: 4 },
//   dateText: { fontSize: 9, color: "#64748b" },
//   section: { marginBottom: 24 },
//   sectionTitle: { fontSize: 10, fontWeight: "bold", color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#cbd5e1", paddingBottom: 4 },
//   infoRow: { flexDirection: "row", gap: 20 },
//   infoBox: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 8, padding: 14, borderWidth: 1, borderColor: "#f1f5f9" },
//   infoBoxTitle: { fontSize: 9, fontWeight: "bold", color: "#0f172a", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
//   label: { fontSize: 7.5, color: "#64748b", textTransform: "uppercase", marginBottom: 2 },
//   value: { color: "#1e293b", fontSize: 9.5, fontWeight: "bold", marginBottom: 8 },
//   storeValue: { color: "#334155", fontSize: 9.5, lineHeight: 1.5, marginBottom: 2 },
//   tableHeader: { flexDirection: "row", backgroundColor: "#0f172a", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, color: "#ffffff", fontWeight: "bold", fontSize: 8, textTransform: "uppercase", letterSpacing: 0.5 },
//   row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 12, paddingHorizontal: 12, alignItems: "center" },
//   colProduct: { width: "40%" },
//   colQty: { width: "10%", textAlign: "center", color: "#0f172a", fontWeight: "bold" },
//   colSerials: { width: "30%" },
//   colPrice: { width: "20%", textAlign: "right", fontWeight: "bold", color: "#0f172a" },
//   productName: { fontSize: 9.5, fontWeight: "bold", color: "#0f172a" },
//   modelText: { fontSize: 8, color: "#64748b", marginTop: 2 },
//   serialText: { fontSize: 8, color: "#475569", backgroundColor: "#f1f5f9", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, marginBottom: 2, alignSelf: "flex-start" },
//   totalSection: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 24 },
//   totalBox: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", padding: 12, borderRadius: 8, width: 200 },
//   totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   totalLabel: { fontSize: 9, fontWeight: "bold", color: "#64748b", textTransform: "uppercase" },
//   totalValue: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },
//   footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", color: "#94a3b8", fontSize: 7.5, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 15, lineHeight: 1.4 },
// });

// const PurchaseReceiptPDF = ({ customer, items, shopkeeper, total }: any) => (
//   <Document>
//     <Page size="A4" style={pdfStyles.page}>
//       <View style={pdfStyles.headerBar} />
//       <View style={pdfStyles.header}>
//         {shopkeeper?.image?.url ? (
//           <Image src={shopkeeper.image.url} style={pdfStyles.logo} />
//         ) : (
//           <Text style={[pdfStyles.title, { fontSize: 18 }]}>{shopkeeper?.shopName || "STORE"}</Text>
//         )}
//         <View style={pdfStyles.receiptMeta}>
//           <Text style={pdfStyles.title}>PURCHASE RECEIPT</Text>
//           <Text style={pdfStyles.dateText}>Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</Text>
//         </View>
//       </View>

//       <View style={[pdfStyles.section, pdfStyles.infoRow]}>
//         <View style={pdfStyles.infoBox}>
//           <Text style={pdfStyles.infoBoxTitle}>Customer Details</Text>
//           <Text style={pdfStyles.label}>Name</Text>
//           <Text style={pdfStyles.value}>{customer?.firstName} {customer?.lastName}</Text>
//           <Text style={pdfStyles.label}>Phone</Text>
//           <Text style={pdfStyles.value}>{customer?.phone}</Text>
//           <Text style={pdfStyles.label}>Govt ID / NID</Text>
//           <Text style={pdfStyles.value}>{customer?.idNumber}</Text>
//         </View>
//         <View style={pdfStyles.infoBox}>
//           <Text style={pdfStyles.infoBoxTitle}>Shop Information</Text>
//           <Text style={[pdfStyles.value, { fontSize: 11 }]}>{shopkeeper?.shopName}</Text>
//           <Text style={pdfStyles.storeValue}>{shopkeeper?.shopAddress}</Text>
//           <Text style={pdfStyles.storeValue}>{shopkeeper?.phone}</Text>
//         </View>
//       </View>

//       <View style={pdfStyles.section}>
//         <Text style={pdfStyles.sectionTitle}>Purchased Devices</Text>
//         <View style={pdfStyles.tableHeader}>
//           <Text style={pdfStyles.colProduct}>Product Specifications</Text>
//           <Text style={pdfStyles.colQty}>Qty</Text>
//           <Text style={pdfStyles.colSerials}>IMEI / Serials</Text>
//           <Text style={pdfStyles.colPrice}>Price</Text>
//         </View>
//         {items?.map((item: any, index: number) => (
//           <View key={index} style={pdfStyles.row}>
//             <View style={pdfStyles.colProduct}>
//               <Text style={pdfStyles.productName}>{item.name}</Text>
//               <Text style={pdfStyles.modelText}>{item.storage} • {item.color}</Text>
//             </View>
//             <Text style={pdfStyles.colQty}>{item.quantity}</Text>
//             <View style={pdfStyles.colSerials}>
//               {item.serials.map((serial: string, idx: number) => (
//                 <Text key={idx} style={pdfStyles.serialText}>• {serial}</Text>
//               ))}
//             </View>
//             <Text style={pdfStyles.colPrice}>${(Number(item.expectedPrice || 0) * Number(item.quantity || 1)).toFixed(2)}</Text>
//           </View>
//         ))}
//       </View>

//       <View style={pdfStyles.totalSection}>
//         <View style={pdfStyles.totalBox}>
//           <View style={pdfStyles.totalRow}>
//             <Text style={pdfStyles.totalLabel}>Total Value</Text>
//             <Text style={pdfStyles.totalValue}>${total.toFixed(2)}</Text>
//           </View>
//         </View>
//       </View>
//       <Text style={pdfStyles.footer}>Verified IMEI and serial numbers are attached with customer identification proof.</Text>
//     </Page>
//   </Document>
// );

// export default function CreatePurchaseReceipt() {
//   const { data: profileData } = useMyProfile();
//   const session = useSession();
//   const shopkeeperId = session?.data?.user?.id;
//   const { mutate: createInvoice, isPending } = useCreateInvoice();

//   const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
//   const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
//   const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

//   // Customer ID State Management Configuration Block
//   const [customer, setCustomer] = useState({
//     firstName: "", lastName: "", email: "", phone: "", address: "", idNumber: ""
//   });

//   const [frontFile, setFrontFile] = useState<File | null>(null);
//   const [backFile, setBackFile] = useState<File | null>(null);
//   const [ocrLoading, setOcrLoading] = useState<boolean>(false);
//   const [ocrStatus, setOcrStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

//   const [items, setItems] = useState<any[]>([
//     { name: "", storage: "", color: "", condition: "", quantity: 1, expectedPrice: 0, serials: [] }
//   ]);

//   const [scanInputs, setScanInputs] = useState<{ [key: number]: string }>({});
//   const [isParsingFile, setIsParsingFile] = useState<{ [key: number]: boolean }>({});
//   const [activeCameraStream, setActiveCameraStream] = useState<{ [key: number]: boolean }>({});

//   useEffect(() => {
//     codeReaderRef.current = new BrowserMultiFormatReader();
//     return () => {
//       if (codeReaderRef.current) {
//         codeReaderRef.current.reset();
//       }
//     };
//   }, []);

//   const addItem = () => {
//     setItems((prev) => [...prev, { name: "", storage: "", color: "", condition: "", quantity: 1, expectedPrice: 0, serials: [] }]);
//   };

//   const removeItem = (index: number) => {
//     const updated = [...items];
//     updated.splice(index, 1);
//     setItems(updated);
//     if (activeCameraStream[index]) {
//       stopCameraScanning(index);
//     }
//   };

//   const updateItem = (index: number, field: string, value: any) => {
//     const updated = [...items];
//     updated[index][field] = value;
//     setItems(updated);
//   };

//   // --- AUTOMATED CUSTOMER NID SCANNING (OCR API GATEWAY) ---
//   const triggerOcrScan = async (front: File, back: File | null) => {
//     if (!front) return;

//     setOcrLoading(true);
//     setOcrStatus(null);
//     const toastId = toast.loading("Processing identity documents layout via endpoint OCR standard matrix...");

//     const formData = new FormData();
//     formData.append("nid_front", front);
//     if (back) {
//       formData.append("nid_back", back);
//     }

//     try {
//       const response = await fetch("http://localhost:5000/api/v1/ocr/extract-nid", {
//         method: "POST",
//         body: formData
//       });

//       if (!response.ok) throw new Error("Backend OCR pipeline stream error connection exception");

//       const result: OcrResponse = await response.json();

//       if (result.success && result.data.isValid) {
//         setCustomer(prev => ({ ...prev, idNumber: result.data.nidNumber }));
//         setOcrStatus({
//           type: 'success',
//           message: `${result.message || 'NID extracted successfully'} (${result.data.processingTime}ms)`
//         });
//         toast.success("Identity profile parsed and populated into input nodes array!");
//       } else {
//         setOcrStatus({
//           type: 'error',
//           message: result.data.message || 'Verification pipeline rejected structure validity bounds.'
//         });
//         toast.error("OCR server failed validating document parameters.");
//       }
//     } catch (error) {
//       setOcrStatus({
//         type: 'error',
//         message: 'Unable to connect to dynamic validation server context.'
//       });
//       toast.error("OCR endpoint connection timeout flag.");
//     } finally {
//       setOcrLoading(false);
//       toast.dismiss(toastId);
//     }
//   };

//   const handleFrontFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setFrontFile(file);
//       triggerOcrScan(file, backFile);
//     }
//   };

//   const handleBackFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setBackFile(file);
//       if (frontFile) {
//         triggerOcrScan(frontFile, file);
//       }
//     }
//   };

//   // --- WORKFLOW 1: BARCODE KEY ENTER LOGIC ---
//   const handleScanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, itemIndex: number) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const code = scanInputs[itemIndex]?.trim();
//       if (!code) return;

//       appendBarcodeCode(itemIndex, code);
//       setScanInputs((prev) => ({ ...prev, [itemIndex]: "" }));
//     }
//   };

//   // --- WORKFLOW 2: LIVE HARDWARE WEBCAM SCANNERS ---
//   const startCameraScanning = async (itemIndex: number) => {
//     if (!codeReaderRef.current) return;

//     setActiveCameraStream(prev => ({ ...prev, [itemIndex]: true }));
//     toast.loading("Accessing media devices hardware...", { id: `cam-${itemIndex}` });

//     setTimeout(async () => {
//       try {
//         const videoElement = videoRefs.current[itemIndex];
//         if (!videoElement) throw new Error("Video node element missing");

//         codeReaderRef.current?.decodeFromVideoDevice(
//           null,
//           videoElement,
//           (result, error) => {
//             if (result) {
//               const matchedCodeText = result.getText()?.trim();
//               if (matchedCodeText) {
//                 appendBarcodeCode(itemIndex, matchedCodeText);
//                 stopCameraScanning(itemIndex);
//               }
//             }
//             if (error && !(error.name === "NotFoundException")) {
//               console.debug("ZXing processing frame tick error:", error);
//             }
//           }
//         );
//         toast.dismiss(`cam-${itemIndex}`);
//         toast.success("Camera viewfinder active.");
//       } catch (err: any) {
//         toast.dismiss(`cam-${itemIndex}`);
//         toast.error("Failed to connect camera.");
//         setActiveCameraStream(prev => ({ ...prev, [itemIndex]: false }));
//       }
//     }, 300);
//   };

//   const stopCameraScanning = (itemIndex: number) => {
//     if (codeReaderRef.current) codeReaderRef.current.reset();
//     setActiveCameraStream(prev => ({ ...prev, [itemIndex]: false }));
//   };

//   const toggleCameraScanner = (itemIndex: number) => {
//     if (activeCameraStream[itemIndex]) {
//       stopCameraScanning(itemIndex);
//     } else {
//       items.forEach((_, idx) => {
//         if (activeCameraStream[idx]) stopCameraScanning(idx);
//       });
//       startCameraScanning(itemIndex);
//     }
//   };

//   // --- WORKFLOW 3: ITEM ATTACHMENT PROCESSING ---
//   const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemIndex: number) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setIsParsingFile(prev => ({ ...prev, [itemIndex]: true }));
//     const loadingToastId = toast.loading(`Reading item document asset "${file.name}"...`);

//     try {
//       const imageUrl = URL.createObjectURL(file);

//       try {
//         const zxingResult = await codeReaderRef.current?.decodeFromImageUrl(imageUrl);
//         const zxingText = zxingResult?.getText()?.trim();
//         if (zxingText) {
//           appendBarcodeCode(itemIndex, zxingText);
//           toast.dismiss(loadingToastId);
//           setIsParsingFile(prev => ({ ...prev, [itemIndex]: false }));
//           if (fileInputRefs.current[itemIndex]) fileInputRefs.current[itemIndex]!.value = "";
//           return;
//         }
//       } catch (e) {
//         console.debug("Fallback to Tesseract raw engine loop initialization blocks...", e);
//       }

//       const worker = await createWorker("eng");
//       const ret = await worker.recognize(imageUrl);
//       const fullExtractedRawText = ret.data.text;
//       await worker.terminate();

//       URL.revokeObjectURL(imageUrl);
//       const parsedMatchArray = fullExtractedRawText.match(/[A-Z0-9]{8,18}/g);

//       if (parsedMatchArray && parsedMatchArray.length > 0) {
//         appendBarcodeCode(itemIndex, parsedMatchArray[0]);
//         toast.dismiss(loadingToastId);
//       } else {
//         toast.dismiss(loadingToastId);
//         toast.error("Failed to extract legible codes.");
//       }
//     } catch (error) {
//       toast.dismiss(loadingToastId);
//       toast.error("Engine failed processing targets matrix layout.");
//     } finally {
//       setIsParsingFile(prev => ({ ...prev, [itemIndex]: false }));
//       if (fileInputRefs.current[itemIndex]) fileInputRefs.current[itemIndex]!.value = "";
//     }
//   };

//   const appendBarcodeCode = (itemIndex: number, code: string) => {
//     const updatedItems = [...items];

//     if (updatedItems[itemIndex].serials.includes(code)) {
//       toast.error(`Code "${code}" already exists inside item list.`);
//       return;
//     }

//     updatedItems[itemIndex].serials.push(code);

//     if (updatedItems[itemIndex].serials.length > updatedItems[itemIndex].quantity) {
//       updatedItems[itemIndex].quantity = updatedItems[itemIndex].serials.length;
//     }

//     setItems(updatedItems);
//     toast.success(`Code "${code}" appended smoothly to stack!`);
//   };

//   const removeSerial = (itemIndex: number, serialIndex: number) => {
//     const updated = [...items];
//     updated[itemIndex].serials.splice(serialIndex, 1);
//     setItems(updated);
//   };

//   const isFormValid = useMemo(() => {
//     return (
//       customer.firstName &&
//       customer.phone &&
//       customer.idNumber &&
//       items.length > 0 &&
//       items.every(item => item.name && item.serials.length > 0)
//     );
//   }, [customer, items]);

//   const total = items.reduce((acc, item) => acc + Number(item.expectedPrice || 0) * Number(item.quantity || 1), 0);

//   const handleCreateReceipt = async () => {
//     if (!isFormValid) {
//       toast.error("Please complete all required fields and ensure barcodes are populated");
//       return;
//     }
//     const doc = <PurchaseReceiptPDF customer={customer} items={items} shopkeeper={profileData?.data} total={total} />;
//     const blob = await pdf(doc).toBlob();
//     const file = new File([blob], `purchase_receipt_${customer.firstName}.pdf`, { type: "application/pdf" });

//     createInvoice(
//       { shopkeeperId: shopkeeperId || "", type: "Purchase Invoice", invoice: file },
//       {
//         onSuccess: () => toast.success("Purchase receipt created successfully"),
//         onError: () => toast.error("Failed to create purchase receipt")
//       }
//     );
//   };

//   return (
//     <div className="min-h-screen bg-background px-4 py-8 md:px-8">
//       <div className="mx-auto space-y-8">
//         {/* HEADER */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-black tracking-tight">Purchase Receipt Generator</h1>
//             <p className="text-sm text-muted-foreground mt-1">Unified pipeline mapping identity verification parsing alongside barcode registry logs</p>
//           </div>
//           <div className="hidden md:flex items-center gap-3 bg-orange-50 text-orange-600 px-5 py-3 rounded-2xl font-bold">
//             <Package size={18} />
//             {items.length} Items Configured
//           </div>
//         </div>

//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//           {/* LEFT CONTAINER CONTAINER */}
//           <div className="xl:col-span-2 space-y-6">

//             {/* CUSTOMER INFORMATION CONFIGURATION SUB-PANEL */}
//             <Card className="rounded-[28px] border-0 shadow-sm">
//               <CardContent className="p-8 space-y-6">
//                 <div className="flex items-center gap-3">
//                   <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
//                     <User size={22} />
//                   </div>
//                   <div>
//                     <h2 className="text-2xl font-black">Customer Information</h2>
//                     <p className="text-sm text-muted-foreground">Identity validation framework controls</p>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                   <Input placeholder="First Name" className="rounded-2xl h-12 border-primary bg-background font-bold" value={customer.firstName} onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })} />
//                   <Input placeholder="Last Name" className="rounded-2xl h-12 border-primary bg-background font-bold" value={customer.lastName} onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })} />
//                   <Input placeholder="Email" className="rounded-2xl h-12 border-primary bg-background font-bold" value={customer.email} type="email" onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
//                   <Input placeholder="Phone" className="rounded-2xl h-12 border-primary bg-background font-bold" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
//                   <div className="md:col-span-2">
//                     <Textarea placeholder="Address" className="rounded-2xl h-12 border-primary bg-background font-bold" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
//                   </div>

//                   {/* MANUAL OR AUTOMATIC IDENTITY SECTOR BLOCK */}
//                   <div className="md:col-span-2 space-y-2">
//                     <label className="font-bold text-sm text-muted-foreground ml-1">Customer ID Number / NID Field</label>
//                     <div className="relative">
//                       <Input
//                         placeholder="Type manually or submit verification documents down below to auto-fill..."
//                         className="rounded-2xl h-12 border-primary bg-background font-bold pr-11"
//                         value={customer.idNumber}
//                         onChange={(e) => setCustomer({ ...customer, idNumber: e.target.value })}
//                       />
//                       {ocrLoading && (
//                         <div className="absolute right-4 top-3.5 animate-spin text-primary">
//                           <Loader2 className="w-5 h-5" />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* TWO TRACK DYNAMIC FILE SUBMISSION BOXES MATRIX */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
//                   <div className="space-y-2">
//                     <span className="text-xs font-bold text-muted-foreground ml-1">NID / Passport (Front Side - Required)</span>
//                     <label className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-primary rounded-2xl p-5 cursor-pointer bg-muted/10 transition-all text-center min-h-[115px]">
//                       <Upload className="w-6 h-6 text-muted-foreground mb-2" />
//                       <span className="text-xs font-bold text-foreground max-w-full truncate px-2">
//                         {frontFile ? frontFile.name : 'Select Front Side Asset'}
//                       </span>
//                       <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFrontFileChange} />
//                     </label>
//                   </div>

//                   <div className="space-y-2">
//                     <span className="text-xs font-bold text-muted-foreground ml-1">NID / Passport (Back Side - Optional)</span>
//                     <label className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-primary rounded-2xl p-5 cursor-pointer bg-muted/10 transition-all text-center min-h-[115px]">
//                       <Upload className="w-6 h-6 text-muted-foreground mb-2" />
//                       <span className="text-xs font-bold text-foreground max-w-full truncate px-2">
//                         {backFile ? backFile.name : 'Select Back Side Asset'}
//                       </span>
//                       <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleBackFileChange} />
//                     </label>
//                   </div>
//                 </div>

//                 {/* ENGINE STATUS LOG VIEWBAR */}
//                 {ocrStatus && (
//                   <div className={`p-4 rounded-2xl border flex items-start gap-3 text-sm font-bold ${
//                     ocrStatus.type === 'success'
//                       ? 'bg-green-500/10 border-green-500/20 text-green-600'
//                       : 'bg-red-500/10 border-red-500/20 text-red-600'
//                   }`}>
//                     {ocrStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
//                     <div>
//                       <p>{ocrStatus.type === 'success' ? 'OCR Mapping Stream Verified' : 'OCR Pipeline Rejected Document'}</p>
//                       <p className="opacity-80 text-xs mt-0.5 font-normal">{ocrStatus.message}</p>
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* PRODUCT ENTRIES STREAM PANEL */}
//             <Card className="rounded-[28px] border-0 shadow-sm">
//               <CardContent className="p-8 space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className="text-2xl font-black">Purchase Items</h2>
//                     <p className="text-sm text-muted-foreground">Configure specifications and accumulate tracking logs</p>
//                   </div>
//                   <Button onClick={addItem} className="rounded-2xl">
//                     <Plus size={16} className="mr-2" /> Add Item
//                   </Button>
//                 </div>

//                 <div className="space-y-5">
//                   {items.map((item, itemIndex) => {
//                     const isScannerAvailable = item.name;
//                     const currentItemRowTotal = Number(item.expectedPrice || 0) * Number(item.quantity || 1);

//                     return (
//                       <div key={itemIndex} className="border rounded-3xl p-6 bg-muted/20 space-y-6">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <h3 className="text-lg font-black">Device #{itemIndex + 1}</h3>
//                             <p className="text-sm text-muted-foreground">Specification logging state control</p>
//                           </div>
//                           <Button variant="destructive" size="icon" className="rounded-2xl" onClick={() => removeItem(itemIndex)}>
//                             <Trash2 size={18} />
//                           </Button>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                           <Input placeholder="Item Name (Required)" className="rounded-2xl h-12 border-primary bg-background font-bold" value={item.name} onChange={(e) => updateItem(itemIndex, "name", e.target.value)} />
//                           <Input placeholder="Storage / Memory (e.g., 256GB)" className="rounded-2xl h-12 border-primary bg-background font-bold" value={item.storage || ""} onChange={(e) => updateItem(itemIndex, "storage", e.target.value)} />
//                           <Input placeholder="Color" className="rounded-2xl h-12 border-primary bg-background font-bold" value={item.color || ""} onChange={(e) => updateItem(itemIndex, "color", e.target.value)} />
//                           <Input placeholder="Condition" className="rounded-2xl h-12 border-primary bg-background font-bold" value={item.condition || ""} onChange={(e) => updateItem(itemIndex, "condition", e.target.value)} />
//                           <div>
//                             <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">Quantity</label>
//                             <Input type="number" min={1} className="rounded-2xl h-12 border-primary bg-background font-bold" value={item.quantity} onChange={(e) => updateItem(itemIndex, "quantity", Math.max(1, Number(e.target.value)))} />
//                           </div>
//                           <div>
//                             <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">Price Per Unit</label>
//                             <Input type="number" className="rounded-2xl h-12 border-primary bg-background font-bold" value={item.expectedPrice} onChange={(e) => updateItem(itemIndex, "expectedPrice", Number(e.target.value))} />
//                           </div>
//                         </div>

//                         <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
//                           <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
//                             <DollarSign className="w-3.5 h-3.5 text-primary" /> Item Calculation Subtotal:
//                           </span>
//                           <span className="text-lg font-black text-primary font-mono">${currentItemRowTotal.toFixed(2)}</span>
//                         </div>

//                         {isScannerAvailable ? (
//                           <div className="border-t pt-5 border-dashed border-muted-foreground/40 space-y-4">
//                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
//                               <div>
//                                 <h4 className="font-black text-foreground flex items-center gap-2">
//                                   <ScanLine className="w-5 h-5 text-primary" />
//                                   Universal Processing Scanner Hub
//                                 </h4>
//                                 <p className="text-xs text-muted-foreground">Type + Enter, engage active web camera tracking, or drop attachment image.</p>
//                               </div>

//                               <div className="flex items-center gap-2 self-start md:self-auto">
//                                 <Button type="button" variant={activeCameraStream[itemIndex] ? "default" : "outline"} className="rounded-xl h-9 text-xs font-bold gap-1.5" onClick={() => toggleCameraScanner(itemIndex)}>
//                                   <Camera className="w-3.5 h-3.5" />
//                                   {activeCameraStream[itemIndex] ? "Close Camera" : "Open Camera Stream"}
//                                 </Button>

//                                 <Button type="button" variant="outline" className="rounded-xl h-9 text-xs font-bold gap-1.5" disabled={isParsingFile[itemIndex]} onClick={() => fileInputRefs.current[itemIndex]?.click()}>
//                                   {isParsingFile[itemIndex] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
//                                   Attach Receipt/Image
//                                 </Button>
//                                 <input type="file" ref={el => { fileInputRefs.current[itemIndex] = el; }} accept="image/*" className="hidden" onChange={(e) => handleAttachmentUpload(e, itemIndex)} />
//                               </div>
//                             </div>

//                             {activeCameraStream[itemIndex] && (
//                               <div className="relative w-full h-56 rounded-2xl bg-black border border-primary overflow-hidden flex flex-col items-center justify-center">
//                                 <video ref={el => { videoRefs.current[itemIndex] = el; }} className="w-full h-full object-cover" muted playsInline />
//                                 <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
//                                   <div className="w-64 h-36 border-2 border-dashed border-primary rounded-xl relative flex items-center justify-center bg-black/10">
//                                     <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] absolute top-1/2 left-0 animate-bounce" />
//                                   </div>
//                                 </div>
//                               </div>
//                             )}

//                             <div className="relative">
//                               <Input
//                                 className="rounded-2xl h-12 pl-11 border-primary bg-background font-bold focus-visible:ring-primary"
//                                 placeholder="Scan/Type code here and press Enter to append seamlessly..."
//                                 value={scanInputs[itemIndex] || ""}
//                                 onChange={(e) => setScanInputs((prev) => ({ ...prev, [itemIndex]: e.target.value }))}
//                                 onKeyDown={(e) => handleScanKeyDown(e, itemIndex)}
//                               />
//                               <div className="absolute left-4 top-3.5 text-muted-foreground">
//                                 <ScanLine className="w-5 h-5" />
//                               </div>
//                             </div>

//                             <div className="space-y-2">
//                               <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
//                                 <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Active Registers Log:</span>
//                                 <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md font-mono">{item.serials.length} Stored Ledger Nodes</span>
//                               </div>

//                               <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1.5 border rounded-2xl bg-background/50">
//                                 {item.serials.length === 0 && (
//                                   <p className="text-xs text-muted-foreground/60 italic p-1">No identifiers cached inside streaming log grid yet.</p>
//                                 )}
//                                 {item.serials.map((serial: string, serialIndex: number) => (
//                                   <div key={serialIndex} className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-900 border px-3 py-1.5 rounded-xl group transition-all">
//                                     <span className="text-muted-foreground">#{serialIndex + 1}:</span>
//                                     <span className="text-foreground tracking-tight">{serial}</span>
//                                     <button type="button" className="text-muted-foreground hover:text-destructive transition-colors ml-1" onClick={() => removeSerial(itemIndex, serialIndex)}>
//                                       <Trash2 size={13} />
//                                     </button>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="text-center p-4 border border-dashed rounded-2xl bg-zinc-50/50">
//                             <p className="text-xs text-muted-foreground/80 font-bold">Please define the baseline Item Name first to unlock advanced tools.</p>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* RIGHT PANELS SYSTEM */}
//           <div className="space-y-6">
//             <Card className="rounded-[28px] overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
//               <CardContent className="p-8 space-y-6">
//                 <div>
//                   <h2 className="text-2xl font-black">{profileData?.data?.shopName || "N/A"}</h2>
//                   <p className="text-slate-300 mt-2">{profileData?.data?.email || "N/A"}</p>
//                   <p className="text-slate-300">{profileData?.data?.phone || "N/A"}</p>
//                 </div>
//                 <div className="bg-white/10 rounded-2xl p-4">
//                   <p className="text-xs uppercase tracking-widest text-slate-300 font-black mb-1">Store Address</p>
//                   <p className="text-sm">{profileData?.data?.shopAddress || "N/A"}</p>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="rounded-[28px] border-0 shadow-sm">
//               <CardContent className="p-8 space-y-5">
//                 <div>
//                   <h2 className="text-2xl font-black">Receipt Summary</h2>
//                   <p className="text-sm text-muted-foreground">Purchase overview parameter logging</p>
//                 </div>

//                 <div className="space-y-4">
//                   <div className="bg-muted rounded-2xl p-4">
//                     <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">Total Unique Devices</p>
//                     <p className="text-3xl font-black">{items.length}</p>
//                   </div>
//                   <div className="bg-muted rounded-2xl p-4">
//                     <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">Aggregated Scanned Identifiers</p>
//                     <p className="text-3xl font-black">{items.reduce((acc, item) => acc + item.serials.length, 0)}</p>
//                   </div>
//                 </div>

//                 <div className="border-t pt-4 flex items-center justify-between">
//                   <span className="text-base font-black uppercase tracking-tight">Grand Total:</span>
//                   <span className="text-2xl font-black text-primary font-mono">${total.toFixed(2)}</span>
//                 </div>

//                 <Button disabled={!isFormValid || isPending || ocrLoading} onClick={handleCreateReceipt} className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-wider">
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

import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  ChangeEvent,
} from "react";
import {
  User,
  Package,
  Loader2,
  Trash2,
  Plus,
  ScanLine,
  Camera,
  Upload,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  Eye,
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

// --- CLIENT LIBRARIES IMPORT ---
import { BrowserMultiFormatReader } from "@zxing/library";
import { createWorker } from "tesseract.js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import { useCreateInvoice } from "@/features/shopkeeper/inventory/hooks/useInventory";

interface OcrResponse {
  success: boolean;
  message: string;
  data: {
    nidNumber: string;
    isValid: boolean;
    message: string;
    processingTime: number;
  };
}

// --- Ultra-Modern PDF Styles ---
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
  logo: { width: 130, objectFit: "contain" },
  receiptMeta: { textAlign: "right" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateText: { fontSize: 9, color: "#64748b" },
  section: { marginBottom: 24 },
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
  infoRow: { flexDirection: "row", gap: 20 },
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
  colProduct: { width: "40%" },
  colQty: {
    width: "10%",
    textAlign: "center",
    color: "#0f172a",
    fontWeight: "bold",
  },
  colSerials: { width: "30%" },
  colPrice: {
    width: "20%",
    textAlign: "right",
    fontWeight: "bold",
    color: "#0f172a",
  },
  productName: { fontSize: 9.5, fontWeight: "bold", color: "#0f172a" },
  modelText: { fontSize: 8, color: "#64748b", marginTop: 2 },
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
  totalValue: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },
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

      <View style={[pdfStyles.section, pdfStyles.infoRow]}>
        <View style={pdfStyles.infoBox}>
          <Text style={pdfStyles.infoBoxTitle}>Customer Details</Text>
          <Text style={pdfStyles.label}>Name</Text>
          <Text style={pdfStyles.value}>
            {customer?.firstName} {customer?.lastName}
          </Text>
          <Text style={pdfStyles.label}>Phone</Text>
          <Text style={pdfStyles.value}>{customer?.phone}</Text>
          <Text style={pdfStyles.label}>Govt ID / NID</Text>
          <Text style={pdfStyles.value}>{customer?.idNumber}</Text>
        </View>
        <View style={pdfStyles.infoBox}>
          <Text style={pdfStyles.infoBoxTitle}>Shop Information</Text>
          <Text style={[pdfStyles.value, { fontSize: 11 }]}>
            {shopkeeper?.shopName}
          </Text>
          <Text style={pdfStyles.storeValue}>{shopkeeper?.shopAddress}</Text>
          <Text style={pdfStyles.storeValue}>{shopkeeper?.phone}</Text>
        </View>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Purchased Devices</Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={pdfStyles.colProduct}>Product Specifications</Text>
          <Text style={pdfStyles.colQty}>Qty</Text>
          <Text style={pdfStyles.colSerials}>IMEI / Serials</Text>
          <Text style={pdfStyles.colPrice}>Price</Text>
        </View>
        {items?.map((item: any, index: number) => (
          <View key={index} style={pdfStyles.row}>
            <View style={pdfStyles.colProduct}>
              <Text style={pdfStyles.productName}>{item.name}</Text>
              <Text style={pdfStyles.modelText}>
                {item.storage} • {item.color}
              </Text>
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

      <View style={pdfStyles.totalSection}>
        <View style={pdfStyles.totalBox}>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>Total Value</Text>
            <Text style={pdfStyles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </View>
      <Text style={pdfStyles.footer}>
        Verified IMEI and serial numbers are attached with customer
        identification proof.
      </Text>
    </Page>
  </Document>
);

export default function CreatePurchaseReceipt() {
  const { data: profileData } = useMyProfile();
  const session = useSession();
  const shopkeeperId = session?.data?.user?.id;
  const { mutate: createInvoice, isPending } = useCreateInvoice();

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  // Customer ID State Management Configuration Block
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    idNumber: "",
  });

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>("");
  const [backPreview, setBackPreview] = useState<string>("");

  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrStatus, setOcrStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [items, setItems] = useState<any[]>([
    {
      name: "",
      storage: "",
      color: "",
      condition: "",
      quantity: 1,
      expectedPrice: 0,
      serials: [],
    },
  ]);

  const [scanInputs, setScanInputs] = useState<{ [key: number]: string }>({});
  const [isParsingFile, setIsParsingFile] = useState<{
    [key: number]: boolean;
  }>({});
  const [activeCameraStream, setActiveCameraStream] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      // Clean temporary URLs dynamically to preserve web memory allocation profiles
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
    };
  }, [frontPreview, backPreview]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        name: "",
        storage: "",
        color: "",
        condition: "",
        quantity: 1,
        expectedPrice: 0,
        serials: [],
      },
    ]);
  };

  const removeItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
    if (activeCameraStream[index]) {
      stopCameraScanning(index);
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // --- AUTOMATED CUSTOMER NID SCANNING (OCR API GATEWAY) ---
  const triggerOcrScan = async (front: File | null, back: File | null) => {
    if (!front || !back) return;

    setOcrLoading(true);
    setOcrStatus(null);
    const toastId = toast.loading(
      "Both documents received. Extracting identity data...",
    );

    const formData = new FormData();
    formData.append("nid_front", front);
    formData.append("nid_back", back);

    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/ocr/extract-nid",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok)
        throw new Error(
          "Backend OCR pipeline stream error connection exception",
        );

      const result: OcrResponse = await response.json();

      if (result.success && result.data.isValid) {
        setCustomer((prev) => ({ ...prev, idNumber: result.data.nidNumber }));
        setOcrStatus({
          type: "success",
          message: `${result.message || "NID extracted successfully"} (${result.data.processingTime}ms)`,
        });
        toast.success(
          "Identity profile parsed and populated into input nodes array!",
        );
      } else {
        setOcrStatus({
          type: "error",
          message:
            result.data.message ||
            "Verification pipeline rejected structure validity bounds.",
        });
        toast.error("OCR server failed validating document parameters.");
      }
    } catch (error) {
      setOcrStatus({
        type: "error",
        message: "Unable to connect to dynamic validation server context.",
      });
      toast.error("OCR endpoint connection timeout flag.");
    } finally {
      setOcrLoading(false);
      toast.dismiss(toastId);
    }
  };

  const handleFrontFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFrontFile(file);

      // Update image visual preview cache URL
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      setFrontPreview(URL.createObjectURL(file));

      if (backFile) {
        triggerOcrScan(file, backFile);
      } else {
        toast.info(
          "Front side loaded. Waiting for back side document to trigger OCR.",
        );
      }
    }
  };

  const handleBackFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBackFile(file);

      // Update image visual preview cache URL
      if (backPreview) URL.revokeObjectURL(backPreview);
      setBackPreview(URL.createObjectURL(file));

      if (frontFile) {
        triggerOcrScan(frontFile, file);
      } else {
        toast.info(
          "Back side loaded. Waiting for front side document to trigger OCR.",
        );
      }
    }
  };

  // --- WORKFLOW 1: BARCODE KEY ENTER LOGIC ---
  const handleScanKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    itemIndex: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = scanInputs[itemIndex]?.trim();
      if (!code) return;

      appendBarcodeCode(itemIndex, code);
      setScanInputs((prev) => ({ ...prev, [itemIndex]: "" }));
    }
  };

  // --- WORKFLOW 2: LIVE HARDWARE WEBCAM SCANNERS ---
  const startCameraScanning = async (itemIndex: number) => {
    if (!codeReaderRef.current) return;

    setActiveCameraStream((prev) => ({ ...prev, [itemIndex]: true }));
    toast.loading("Accessing media devices hardware...", {
      id: `cam-${itemIndex}`,
    });

    setTimeout(async () => {
      try {
        const videoElement = videoRefs.current[itemIndex];
        if (!videoElement) throw new Error("Video node element missing");

        codeReaderRef.current?.decodeFromVideoDevice(
          null,
          videoElement,
          (result, error) => {
            if (result) {
              const matchedCodeText = result.getText()?.trim();
              if (matchedCodeText) {
                appendBarcodeCode(itemIndex, matchedCodeText);
                stopCameraScanning(itemIndex);
              }
            }
            if (error && !(error.name === "NotFoundException")) {
              console.debug("ZXing processing frame tick error:", error);
            }
          },
        );
        toast.dismiss(`cam-${itemIndex}`);
        toast.success("Camera viewfinder active.");
      } catch (err: any) {
        toast.dismiss(`cam-${itemIndex}`);
        toast.error("Failed to connect camera.");
        setActiveCameraStream((prev) => ({ ...prev, [itemIndex]: false }));
      }
    }, 300);
  };

  const stopCameraScanning = (itemIndex: number) => {
    if (codeReaderRef.current) codeReaderRef.current.reset();
    setActiveCameraStream((prev) => ({ ...prev, [itemIndex]: false }));
  };

  const toggleCameraScanner = (itemIndex: number) => {
    if (activeCameraStream[itemIndex]) {
      stopCameraScanning(itemIndex);
    } else {
      items.forEach((_, idx) => {
        if (activeCameraStream[idx]) stopCameraScanning(idx);
      });
      startCameraScanning(itemIndex);
    }
  };

  // --- WORKFLOW 3: ITEM ATTACHMENT PROCESSING ---
  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    itemIndex: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile((prev) => ({ ...prev, [itemIndex]: true }));
    const loadingToastId = toast.loading(
      `Reading item document asset "${file.name}"...`,
    );

    try {
      const imageUrl = URL.createObjectURL(file);

      try {
        const zxingResult =
          await codeReaderRef.current?.decodeFromImageUrl(imageUrl);
        const zxingText = zxingResult?.getText()?.trim();
        if (zxingText) {
          appendBarcodeCode(itemIndex, zxingText);
          toast.dismiss(loadingToastId);
          setIsParsingFile((prev) => ({ ...prev, [itemIndex]: false }));
          if (fileInputRefs.current[itemIndex])
            fileInputRefs.current[itemIndex]!.value = "";
          return;
        }
      } catch (e) {
        console.debug(
          "Fallback to Tesseract raw engine loop initialization blocks...",
          e,
        );
      }

      const worker = await createWorker("eng");
      const ret = await worker.recognize(imageUrl);
      const fullExtractedRawText = ret.data.text;
      await worker.terminate();

      URL.revokeObjectURL(imageUrl);
      const parsedMatchArray = fullExtractedRawText.match(/[A-Z0-9]{8,18}/g);

      if (parsedMatchArray && parsedMatchArray.length > 0) {
        appendBarcodeCode(itemIndex, parsedMatchArray[0]);
        toast.dismiss(loadingToastId);
      } else {
        toast.dismiss(loadingToastId);
        toast.error("Failed to extract legible codes.");
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Engine failed processing targets matrix layout.");
    } finally {
      setIsParsingFile((prev) => ({ ...prev, [itemIndex]: false }));
      if (fileInputRefs.current[itemIndex])
        fileInputRefs.current[itemIndex]!.value = "";
    }
  };

  const appendBarcodeCode = (itemIndex: number, code: string) => {
    const updatedItems = [...items];

    if (updatedItems[itemIndex].serials.includes(code)) {
      toast.error(`Code "${code}" already exists inside item list.`);
      return;
    }

    updatedItems[itemIndex].serials.push(code);

    if (
      updatedItems[itemIndex].serials.length > updatedItems[itemIndex].quantity
    ) {
      updatedItems[itemIndex].quantity = updatedItems[itemIndex].serials.length;
    }

    setItems(updatedItems);
    toast.success(`Code "${code}" appended smoothly to stack!`);
  };

  const removeSerial = (itemIndex: number, serialIndex: number) => {
    const updated = [...items];
    updated[itemIndex].serials.splice(serialIndex, 1);
    setItems(updated);
  };

  const isFormValid = useMemo(() => {
    return (
      customer.firstName &&
      customer.phone &&
      customer.idNumber &&
      items.length > 0 &&
      items.every((item) => item.name && item.serials.length > 0)
    );
  }, [customer, items]);

  const total = items.reduce(
    (acc, item) =>
      acc + Number(item.expectedPrice || 0) * Number(item.quantity || 1),
    0,
  );

  const handleCreateReceipt = async () => {
    if (!isFormValid) {
      toast.error(
        "Please complete all required fields and ensure barcodes are populated",
      );
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
      { type: "application/pdf" },
    );

    createInvoice(
      {
        shopkeeperId: shopkeeperId || "",
        type: "Purchase Invoice",
        invoice: file,
      },
      {
        onSuccess: () => toast.success("Purchase receipt created successfully"),
        onError: () => toast.error("Failed to create purchase receipt"),
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
              Unified pipeline mapping identity verification parsing alongside
              barcode registry logs
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-orange-50 text-orange-600 px-5 py-3 rounded-2xl font-bold">
            <Package size={18} />
            {items.length} Items Configured
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT CONTAINER */}
          <div className="xl:col-span-2 space-y-6">
            {/* CUSTOMER INFORMATION CONFIGURATION SUB-PANEL */}
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
                      Identity validation framework controls
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    placeholder="First Name"
                    className="rounded-2xl h-12 border-primary bg-background font-bold"
                    value={customer.firstName}
                    onChange={(e) =>
                      setCustomer({ ...customer, firstName: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Last Name"
                    className="rounded-2xl h-12 border-primary bg-background font-bold"
                    value={customer.lastName}
                    onChange={(e) =>
                      setCustomer({ ...customer, lastName: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Email"
                    className="rounded-2xl h-12 border-primary bg-background font-bold"
                    value={customer.email}
                    type="email"
                    onChange={(e) =>
                      setCustomer({ ...customer, email: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Phone"
                    className="rounded-2xl h-12 border-primary bg-background font-bold"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                  />
                  <div className="md:col-span-2">
                    <Textarea
                      placeholder="Address"
                      className="rounded-2xl h-12 border-primary bg-background font-bold"
                      value={customer.address}
                      onChange={(e) =>
                        setCustomer({ ...customer, address: e.target.value })
                      }
                    />
                  </div>

                  {/* MANUAL OR AUTOMATIC IDENTITY SECTOR BLOCK */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-bold text-sm text-muted-foreground ml-1">
                      Customer ID Number / NID Field
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="Type manually or submit both verification documents down below to auto-fill..."
                        className="rounded-2xl h-12 border-primary bg-background font-bold pr-11"
                        value={customer.idNumber}
                        onChange={(e) =>
                          setCustomer({ ...customer, idNumber: e.target.value })
                        }
                      />
                      {ocrLoading && (
                        <div className="absolute right-4 top-3.5 animate-spin text-primary">
                          <Loader2 className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* TWO TRACK DYNAMIC FILE SUBMISSION BOXES MATRIX */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground ml-1">
                      NID / Passport (Front Side - Required)
                    </span>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-primary rounded-2xl p-5 cursor-pointer bg-muted/10 transition-all text-center min-h-[115px]">
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-xs font-bold text-foreground max-w-full truncate px-2">
                        {frontFile ? frontFile.name : "Select Front Side Asset"}
                      </span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleFrontFileChange}
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground ml-1">
                      NID / Passport (Back Side - Required)
                    </span>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-primary rounded-2xl p-5 cursor-pointer bg-muted/10 transition-all text-center min-h-[115px]">
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-xs font-bold text-foreground max-w-full truncate px-2">
                        {backFile ? backFile.name : "Select Back Side Asset"}
                      </span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleBackFileChange}
                      />
                    </label>
                  </div>
                </div>

                {/* DYNAMIC VISUAL ASSET LIVE PREVIEW SECTION */}
                {(frontPreview || backPreview) && (
                  <div className="border border-muted rounded-2xl p-4 bg-muted/5 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <Eye className="w-4 h-4 text-primary" /> Document Preview
                      Panel:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {frontPreview && (
                        <div className="relative rounded-xl border overflow-hidden bg-background aspect-[1.58/1] flex items-center justify-center shadow-inner">
                          {frontFile?.type.includes("pdf") ? (
                            <div className="p-4 text-center text-xs font-medium text-muted-foreground">
                              Front Side PDF Document Loaded
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={frontPreview}
                              alt="Front Document Preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-bold backdrop-blur-sm">
                            Front Side
                          </div>
                        </div>
                      )}
                      {backPreview && (
                        <div className="relative rounded-xl border overflow-hidden bg-background aspect-[1.58/1] flex items-center justify-center shadow-inner">
                          {backFile?.type.includes("pdf") ? (
                            <div className="p-4 text-center text-xs font-medium text-muted-foreground">
                              Back Side PDF Document Loaded
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={backPreview}
                              alt="Back Document Preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-bold backdrop-blur-sm">
                            Back Side
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ENGINE STATUS LOG VIEWBAR */}
                {ocrStatus && (
                  <div
                    className={`p-4 rounded-2xl border flex items-start gap-3 text-sm font-bold ${
                      ocrStatus.type === "success"
                        ? "bg-green-500/10 border-green-500/20 text-green-600"
                        : "bg-red-500/10 border-red-500/20 text-red-600"
                    }`}
                  >
                    {ocrStatus.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 shrink-0" />
                    )}
                    <div>
                      <p>
                        {ocrStatus.type === "success"
                          ? "OCR Mapping Stream Verified"
                          : "OCR Pipeline Rejected Document"}
                      </p>
                      <p className="opacity-80 text-xs mt-0.5 font-normal">
                        {ocrStatus.message}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PRODUCT ENTRIES STREAM PANEL */}
            <Card className="rounded-[28px] border-0 shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">Purchase Items</h2>
                    <p className="text-sm text-muted-foreground">
                      Configure specifications and accumulate tracking logs
                    </p>
                  </div>
                  <Button onClick={addItem} className="rounded-2xl">
                    <Plus size={16} className="mr-2" /> Add Item
                  </Button>
                </div>

                <div className="space-y-5">
                  {items.map((item, itemIndex) => {
                    const isScannerAvailable = item.name;
                    const currentItemRowTotal =
                      Number(item.expectedPrice || 0) *
                      Number(item.quantity || 1);

                    return (
                      <div
                        key={itemIndex}
                        className="border rounded-3xl p-6 bg-muted/20 space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-black">
                              Device #{itemIndex + 1}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Specification logging state control
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <Input
                            placeholder="Item Name (Required)"
                            className="rounded-2xl h-12 border-primary bg-background font-bold"
                            value={item.name}
                            onChange={(e) =>
                              updateItem(itemIndex, "name", e.target.value)
                            }
                          />
                          <Input
                            placeholder="Storage / Memory (e.g., 256GB)"
                            className="rounded-2xl h-12 border-primary bg-background font-bold"
                            value={item.storage || ""}
                            onChange={(e) =>
                              updateItem(itemIndex, "storage", e.target.value)
                            }
                          />
                          <Input
                            placeholder="Color"
                            className="rounded-2xl h-12 border-primary bg-background font-bold"
                            value={item.color || ""}
                            onChange={(e) =>
                              updateItem(itemIndex, "color", e.target.value)
                            }
                          />
                          <Input
                            placeholder="Condition"
                            className="rounded-2xl h-12 border-primary bg-background font-bold"
                            value={item.condition || ""}
                            onChange={(e) =>
                              updateItem(itemIndex, "condition", e.target.value)
                            }
                          />
                          <div>
                            <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                              Quantity
                            </label>
                            <Input
                              type="number"
                              min={1}
                              className="rounded-2xl h-12 border-primary bg-background font-bold"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  itemIndex,
                                  "quantity",
                                  Math.max(1, Number(e.target.value)),
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                              Price Per Unit
                            </label>
                            <Input
                              type="number"
                              className="rounded-2xl h-12 border-primary bg-background font-bold"
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

                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-primary" />{" "}
                            Item Calculation Subtotal:
                          </span>
                          <span className="text-lg font-black text-primary font-mono">
                            ${currentItemRowTotal.toFixed(2)}
                          </span>
                        </div>

                        {isScannerAvailable ? (
                          <div className="border-t pt-5 border-dashed border-muted-foreground/40 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                              <div>
                                <h4 className="font-black text-foreground flex items-center gap-2">
                                  <ScanLine className="w-5 h-5 text-primary" />
                                  Universal Processing Scanner Hub
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Type + Enter, engage active web camera
                                  tracking, or drop attachment image.
                                </p>
                              </div>

                              <div className="flex items-center gap-2 self-start md:self-auto">
                                <Button
                                  type="button"
                                  variant={
                                    activeCameraStream[itemIndex]
                                      ? "default"
                                      : "outline"
                                  }
                                  className="rounded-xl h-9 text-xs font-bold gap-1.5"
                                  onClick={() => toggleCameraScanner(itemIndex)}
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  {activeCameraStream[itemIndex]
                                    ? "Close Camera"
                                    : "Open Camera Stream"}
                                </Button>

                                <Button
                                  type="button"
                                  variant="outline"
                                  className="rounded-xl h-9 text-xs font-bold gap-1.5"
                                  disabled={isParsingFile[itemIndex]}
                                  onClick={() =>
                                    fileInputRefs.current[itemIndex]?.click()
                                  }
                                >
                                  {isParsingFile[itemIndex] ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Upload className="w-3.5 h-3.5" />
                                  )}
                                  Attach Receipt/Image
                                </Button>
                                <input
                                  type="file"
                                  ref={(el) => {
                                    fileInputRefs.current[itemIndex] = el;
                                  }}
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleAttachmentUpload(e, itemIndex)
                                  }
                                />
                              </div>
                            </div>

                            {activeCameraStream[itemIndex] && (
                              <div className="relative w-full h-56 rounded-2xl bg-black border border-primary overflow-hidden flex flex-col items-center justify-center">
                                <video
                                  ref={(el) => {
                                    videoRefs.current[itemIndex] = el;
                                  }}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                />
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                  <div className="w-64 h-36 border-2 border-dashed border-primary rounded-xl relative flex items-center justify-center bg-black/10">
                                    <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] absolute top-1/2 left-0 animate-bounce" />
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="relative">
                              <Input
                                className="rounded-2xl h-12 pl-11 border-primary bg-background font-bold focus-visible:ring-primary"
                                placeholder="Scan/Type code here and press Enter to append seamlessly..."
                                value={scanInputs[itemIndex] || ""}
                                onChange={(e) =>
                                  setScanInputs((prev) => ({
                                    ...prev,
                                    [itemIndex]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) =>
                                  handleScanKeyDown(e, itemIndex)
                                }
                              />
                              <div className="absolute left-4 top-3.5 text-muted-foreground">
                                <ScanLine className="w-5 h-5" />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />{" "}
                                  Active Registers Log:
                                </span>
                                <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md font-mono">
                                  {item.serials.length} Stored Ledger Nodes
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1.5 border rounded-2xl bg-background/50">
                                {item.serials.length === 0 && (
                                  <p className="text-xs text-muted-foreground/60 italic p-1">
                                    No identifiers cached inside streaming log
                                    grid yet.
                                  </p>
                                )}
                                {item.serials.map(
                                  (serial: string, serialIndex: number) => (
                                    <div
                                      key={serialIndex}
                                      className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-900 border px-3 py-1.5 rounded-xl group transition-all"
                                    >
                                      <span className="text-muted-foreground">
                                        #{serialIndex + 1}:
                                      </span>
                                      <span className="text-foreground tracking-tight">
                                        {serial}
                                      </span>
                                      <button
                                        type="button"
                                        className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                                        onClick={() =>
                                          removeSerial(itemIndex, serialIndex)
                                        }
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-4 border border-dashed rounded-2xl bg-zinc-50/50">
                            <p className="text-xs text-muted-foreground/80 font-bold">
                              Please define the baseline Item Name first to
                              unlock advanced tools.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANELS SYSTEM */}
          <div className="space-y-6">
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

            <Card className="rounded-[28px] border-0 shadow-sm">
              <CardContent className="p-8 space-y-5">
                <div>
                  <h2 className="text-2xl font-black">Receipt Summary</h2>
                  <p className="text-sm text-muted-foreground">
                    Purchase overview parameter logging
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">
                      Total Unique Devices
                    </p>
                    <p className="text-3xl font-black">{items.length}</p>
                  </div>
                  <div className="bg-muted rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">
                      Aggregated Scanned Identifiers
                    </p>
                    <p className="text-3xl font-black">
                      {items.reduce(
                        (acc, item) => acc + item.serials.length,
                        0,
                      )}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 flex items-center justify-between">
                  <span className="text-base font-black uppercase tracking-tight">
                    Grand Total:
                  </span>
                  <span className="text-2xl font-black text-primary font-mono">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <Button
                  disabled={!isFormValid || isPending || ocrLoading}
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
