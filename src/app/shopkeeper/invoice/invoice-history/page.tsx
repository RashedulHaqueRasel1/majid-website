// "use client";

// import React from "react";
// import { useMyInvoiceHistory } from "@/features/shopkeeper/inventory/hooks/useInventory";
// import { useSession } from "next-auth/react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Download, Eye, FileText, Calendar, Store, Phone } from "lucide-react";

// // Invoice Item matching the API response structure
// interface InvoiceItem {
//   _id: string;
//   invoice: {
//     public_id: string;
//     url: string;
//     resource_type: string;
//   };
//   shopkeeperId: {
//     _id: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//     role: string;
//     shopName: string;
//     phone: string;
//   };
//   type: string;
//   createdAt: string;
//   updatedAt: string;
// }

// const InvoiceHistoryPage = () => {
//   const session = useSession();
//   const id = session.data?.user?.id;

//   // Fetching data using your custom hook
//   const {
//     data: response,
//     isLoading,
//     isError,
//   } = useMyInvoiceHistory(id as string);

//   // Safely extract the data array from backend response envelope
//   const invoices: InvoiceItem[] = response?.data || [];

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
//         <span className="ml-3 font-medium text-muted-foreground">
//           Loading invoice history...
//         </span>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="p-6 text-center bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 font-medium">
//         Failed to load invoice history. Please try again later.
//       </div>
//     );
//   }

//   // Helper to handle force download via dynamic anchor trigger
//   const handleDownload = async (url: string, filename: string) => {
//     try {
//       const response = await fetch(url);

//       const blob = await response.blob();

//       const blobUrl = window.URL.createObjectURL(blob);

//       const link = document.createElement("a");

//       link.href = blobUrl;
//       link.download = filename;

//       document.body.appendChild(link);

//       link.click();

//       document.body.removeChild(link);

//       window.URL.revokeObjectURL(blobUrl);
//     } catch (error) {
//       console.error("Download failed:", error);
//     }
//   };
//   return (
//     <div className="p-4 md:p-8  space-y-6">
//       {/* Page Header section matching layout weight */}
//       <div className="flex flex-col gap-1">
//         <h1 className="text-3xl font-black tracking-tight text-foreground">
//           Invoice Registry
//         </h1>
//         <p className="text-sm font-medium text-muted-foreground">
//           View and manage all system-generated and custom distribution receipts.
//         </p>
//       </div>

//       <Card className="rounded-[28px] border p-0 border-border bg-card overflow-hidden shadow-sm">
//         <CardHeader className="bg-surface border-b border-border/60 py-5 px-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <FileText className="w-5 h-5 text-primary" />
//               <CardTitle className="text-lg font-bold">
//                 Billing History
//               </CardTitle>
//             </div>
//             <span className="text-xs font-black text-muted-foreground bg-background border border-border px-3 py-1.5 rounded-full uppercase tracking-wider">
//               Total Records: {invoices.length}
//             </span>
//           </div>
//         </CardHeader>
//         <CardContent className="p-0">
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader className="bg-surface ">
//                 <TableRow className="hover:bg-transparent">
//                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
//                     Invoice ID
//                   </th>
//                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
//                     Merchant / Shop
//                   </th>
//                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
//                     Classification
//                   </th>
//                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
//                     Generation Date
//                   </th>
//                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right">
//                     Actions
//                   </th>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {invoices.length === 0 ? (
//                   <TableRow>
//                     <td
//                       colSpan={5}
//                       className="h-32 text-center text-muted-foreground font-medium"
//                     >
//                       No invoices recorded in this account history.
//                     </td>
//                   </TableRow>
//                 ) : (
//                   invoices.map((item) => {
//                     const shopkeeper = item.shopkeeperId;
//                     const formattedDate = new Date(
//                       item.createdAt,
//                     ).toLocaleDateString("en-US", {
//                       year: "numeric",
//                       month: "short",
//                       day: "numeric",
//                     });

//                     return (
//                       <TableRow
//                         key={item._id}
//                         className="transition-all hover:bg-slate-50/40 group border-b border-border/50"
//                       >
//                         {/* Column 1: DB ID representation */}
//                         <TableCell className="px-6 py-5 font-bold text-slate-600 font-mono text-xs">
//                           #INV-{item._id.slice(-8).toUpperCase()}
//                         </TableCell>

//                         {/* Column 2: Profile info derived from populating shopkeeperId */}
//                         <TableCell className="px-6 py-5">
//                           <div className="flex flex-col gap-0.5">
//                             <span className="font-black text-foreground flex items-center gap-1.5 text-sm">
//                               <Store className="w-3.5 h-3.5 text-sky-500" />
//                               {shopkeeper?.shopName || "Unknown Merchant"}
//                             </span>
//                             <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
//                               <Phone className="w-3.5 h-3.5" />
//                               {shopkeeper?.phone || "N/A"}
//                             </span>
//                           </div>
//                         </TableCell>

//                         {/* Column 3: Type category logic */}
//                         <TableCell className="px-6 py-5">
//                           <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
//                             {item.type}
//                           </span>
//                         </TableCell>

//                         {/* Column 4: Processed ISO Timestamp */}
//                         <TableCell className="px-6 py-5 text-muted-foreground font-bold text-sm">
//                           <span className="flex items-center gap-1.5">
//                             <Calendar className="w-3.5 h-3.5 text-slate-400" />
//                             {formattedDate}
//                           </span>
//                         </TableCell>

//                         {/* Column 5: Action anchors containing the View & Download components */}
//                         <TableCell
//                           className="px-6 py-5 text-right"
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           <div className="flex items-center justify-end gap-2">
//                             {/* View Button - Opens direct link inside native browser context */}
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               className="h-9 px-3 border  hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm text-foreground"
//                               onClick={() =>
//                                 window.open(
//                                   item.invoice.url,
//                                   "_blank",
//                                   "noopener,noreferrer",
//                                 )
//                               }
//                             >
//                               <Eye className="w-3.5 h-3.5" />
//                               View
//                             </Button>

//                             {/* Download Action Component */}
//                             <Button
//                               size="sm"
//                               className="h-9 px-3 bg-primary hover:bg-primary/90 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm text-primary-foreground"
//                               onClick={async () =>
//                                 await handleDownload(
//                                   item.invoice.url,
//                                   `invoice_${item._id.slice(-6)}.pdf`,
//                                 )
//                               }
//                             >
//                               <Download className="w-3.5 h-3.5" />
//                               Download
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default InvoiceHistoryPage;

"use client";

import React, { useState } from "react";

import { useMyInvoiceHistory } from "@/features/shopkeeper/inventory/hooks/useInventory";

import { useSession } from "next-auth/react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Download,
  Eye,
  FileText,
  Calendar,
  Store,
  Phone,
  RotateCcw,
  Loader2,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { pdf } from "@react-pdf/renderer";

import { toast } from "sonner";

import { useCreateInvoice } from "@/features/shopkeeper/inventory/hooks/useInventory";
import { InvoicePDF } from "../create-invoice/_components/createInvoice";
import { InvoiceHistoryItem } from "@/features/shopkeeper/inventory/types";

// Invoice Item matching the API response structure
interface InvoiceItem {
  _id: string;

  invoice: {
    public_id: string;
    url: string;
    resource_type: string;
  };

  shopkeeperId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    shopName: string;
    phone: string;

    image?: {
      url: string;
    };

    shopAddress?: string;
  };

  type: string;

  customerInfo: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    customerId?: string;
    paymentType?: string;
    alreadyPaid?: number;
  };

  itemsIds: {
    _id: string;
    itemName: string;
    imeiNumber: string;
    expectedPrice: number;

    image?: {
      url: string;
    };
  }[];

  createdAt: string;
  updatedAt: string;
}

const InvoiceHistoryPage = () => {
  const session = useSession();

  const id = session.data?.user?.id;

  // Fetching data using your custom hook
  const {
    data: response,
    isLoading,
    isError,
  } = useMyInvoiceHistory(id as string);

  const { mutate: createInvoice, isPending } = useCreateInvoice();

  // Safely extract the data array from backend response envelope
  const invoices: InvoiceHistoryItem[] = response?.data || [];

  const [refundModal, setRefundModal] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(
    null,
  );

  const [selectedRefundItems, setSelectedRefundItems] = useState<string[]>([]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />

        <span className="ml-3 font-medium text-muted-foreground">
          Loading invoice history...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 font-medium">
        Failed to load invoice history. Please try again later.
      </div>
    );
  }

  // Helper to handle force download via dynamic anchor trigger
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;

      link.download = filename;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleOpenRefund = (invoice: InvoiceItem) => {
    setSelectedInvoice(invoice);

    setSelectedRefundItems(invoice.itemsIds.map((item) => item._id));

    setRefundModal(true);
  };

  const toggleRefundItem = (id: string) => {
    setSelectedRefundItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleRefundInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      const remainingItems = selectedInvoice.itemsIds.filter((item) =>
        selectedRefundItems.includes(item._id),
      );

      if (!remainingItems.length) {
        toast.error("Select at least one item");

        return;
      }

      const mappedItems = remainingItems.map((item) => ({
        id: item._id,
        name: item.itemName,
        price: item.expectedPrice,
        image: item.image?.url,
        imeiNumber: item.imeiNumber,
      }));

      const totalPrice = mappedItems.reduce((sum, item) => sum + item.price, 0);

      const alreadyPaid = selectedInvoice.customerInfo?.alreadyPaid || 0;

      const dueAmount =
        totalPrice - alreadyPaid <= 0 ? 0 : totalPrice - alreadyPaid;

      // Generate Refund PDF
      const doc = (
        <InvoicePDF
          customer={selectedInvoice.customerInfo}
          items={mappedItems}
          total={totalPrice}
          shopkeeper={selectedInvoice.shopkeeperId}
          alreadyPaid={alreadyPaid}
          dueAmount={dueAmount}
          paymentType={selectedInvoice.customerInfo?.paymentType || "cash"}
        />
      );

      const blob = await pdf(doc).toBlob();

      const file = new File(
        [blob],
        `refund_invoice_${selectedInvoice._id}.pdf`,
        {
          type: "application/pdf",
        },
      );

      createInvoice(
        {
          shopkeeperId: selectedInvoice.shopkeeperId._id,

          customerInfo: selectedInvoice.customerInfo._id,

          type: "Refunded",

          invoice: file,

          itemsIds: selectedRefundItems,
        },
        {
          onSuccess: () => {
            toast.success("Refund invoice generated successfully");

            setRefundModal(false);

            setSelectedInvoice(null);

            setSelectedRefundItems([]);
          },

          onError: () => {
            toast.error("Refund generation failed");
          },
        },
      );
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Invoice Registry
        </h1>

        <p className="text-sm font-medium text-muted-foreground">
          View and manage all system-generated and custom distribution receipts.
        </p>
      </div>

      <Card className="rounded-[28px] border p-0 border-border bg-card overflow-hidden shadow-sm">
        <CardHeader className="bg-surface border-b border-border/60 py-5 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />

              <CardTitle className="text-lg font-bold">
                Billing History
              </CardTitle>
            </div>

            <span className="text-xs font-black text-muted-foreground bg-background border border-border px-3 py-1.5 rounded-full uppercase tracking-wider">
              Total Records: {invoices.length}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface">
                <TableRow className="hover:bg-transparent">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Invoice ID
                  </th>

                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Merchant / Shop
                  </th>

                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Classification
                  </th>

                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Generation Date
                  </th>

                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right">
                    Actions
                  </th>
                </TableRow>
              </TableHeader>

              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <td
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground font-medium"
                    >
                      No invoices recorded in this account history.
                    </td>
                  </TableRow>
                ) : (
                  invoices.map((item) => {
                    const shopkeeper = item.shopkeeperId;

                    const formattedDate = new Date(
                      item.createdAt,
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <TableRow
                        key={item._id}
                        className="transition-all hover:bg-slate-50/40 group border-b border-border/50"
                      >
                        {/* Invoice ID */}
                        <TableCell className="px-6 py-5 font-bold text-slate-600 font-mono text-xs">
                          #INV-
                          {item._id.slice(-8).toUpperCase()}
                        </TableCell>

                        {/* Shop Info */}
                        <TableCell className="px-6 py-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-black text-foreground flex items-center gap-1.5 text-sm">
                              <Store className="w-3.5 h-3.5 text-sky-500" />

                              {shopkeeper?.shopName || "Unknown Merchant"}
                            </span>

                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />

                              {shopkeeper?.phone || "N/A"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Type */}
                        <TableCell className="px-6 py-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
                            {item.type}
                          </span>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="px-6 py-5 text-muted-foreground font-bold text-sm">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />

                            {formattedDate}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell
                          className="px-6 py-5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-2">
                            {/* View */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 px-3 border hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm text-foreground"
                              onClick={() =>
                                window.open(
                                  item.invoice.url,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Button>

                            {/* Download */}
                            <Button
                              size="sm"
                              className="h-9 px-3 bg-primary hover:bg-primary/90 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm text-primary-foreground"
                              onClick={async () =>
                                await handleDownload(
                                  item.invoice.url,
                                  `invoice_${item._id.slice(-6)}.pdf`,
                                )
                              }
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </Button>

                            {/* Refund */}
                            {item.type === "Custom invoice" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-9 px-3 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm"
                                onClick={() =>
                                  handleOpenRefund(item as InvoiceItem)
                                }
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Refund
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* REFUND MODAL */}
      <Dialog open={refundModal} onOpenChange={setRefundModal}>
        <DialogContent className="max-w-3xl rounded-[28px] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-5 border-b">
            <DialogTitle className="text-xl font-black">
              Refund Invoice
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* CUSTOMER */}
            <div className="bg-slate-50 rounded-2xl p-5 border">
              <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground mb-3">
                Customer Information
              </h3>

              <div className="space-y-1">
                <p className="font-black text-lg">
                  {selectedInvoice?.customerInfo?.firstName}{" "}
                  {selectedInvoice?.customerInfo?.lastName}
                </p>

                <p className="text-sm text-muted-foreground">
                  {selectedInvoice?.customerInfo?.email}
                </p>

                <p className="text-sm text-muted-foreground">
                  {selectedInvoice?.customerInfo?.phone}
                </p>
              </div>
            </div>

            {/* ITEMS */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                Select Remaining Items
              </h3>

              <div className="space-y-3">
                {selectedInvoice?.itemsIds?.map((item) => {
                  const checked = selectedRefundItems.includes(item._id);

                  return (
                    <div
                      key={item._id}
                      className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${
                        checked
                          ? "border-orange-300 bg-orange-50"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleRefundItem(item._id)}
                        />

                        <img
                          src={item.image?.url}
                          alt={item.itemName}
                          className="w-14 h-14 rounded-2xl object-cover"
                        />

                        <div>
                          <p className="font-black text-sm">{item.itemName}</p>

                          <p className="text-xs text-muted-foreground font-medium">
                            IMEI: {item.imeiNumber}
                          </p>
                        </div>
                      </div>

                      <p className="font-black text-lg">
                        ${item.expectedPrice}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setRefundModal(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={handleRefundInvoice}
                disabled={selectedRefundItems.length === 0 || isPending}
                className="rounded-xl font-black"
              >
                Generate Refund Invoice
                {isPending && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceHistoryPage;
