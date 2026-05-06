/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { format } from "date-fns";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Smartphone,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  useRepairRequestDetails,
  useUpdateRepairQuoteStatus,
} from "@/features/customer/repairRequest/hooks/useRepairRequest";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import RepairOfferModal from "./RepairOfferModal";
// import RepairOfferModal from "./RepairOfferModal";
// import { set } from "idb-keyval";

const timelineSteps = [
  {
    id: "request_submitted",
    label: "Request Submitted",
    description: "Your request was received and logged",
    statuses: ["request_submitted", "submitted"],
  },
  {
    id: "in_review",
    label: "Under Review",
    description: "Technician is diagnosing the device",
    statuses: ["in_review"],
  },
  {
    id: "quote_sent",
    label: "Quote Sent",
    description: "Quote will appear once review is complete",
    statuses: ["quote_sent", "quote_rejected", "rejected"],
  },
  {
    id: "repair_in_progress",
    label: "Repair in Progress",
    description: "Hardware components will be repaired",
    statuses: ["repair_in_progress", "quote_accepted", "approved"],
  },
  {
    id: "completed",
    label: "Completed",
    description: "Repair will be finalized and closed",
    statuses: ["completed"],
  },
];

export default function RepairHistoryDetails({ id }: { id: string }) {
  const { data: detailsData, isLoading } = useRepairRequestDetails(id);
  const updateQuote = useUpdateRepairQuoteStatus();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [counterOfferId, setCounterOfferId] = useState<string | null>(null);
  const [shopkeeperId, setShopkeeperId] = useState<string | null>(null);

  const [lightbox, setLightbox] = useState<{
    urls: string[];
    index: number;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!detailsData?.data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground font-medium text-lg">
          Repair request not found.
        </p>
      </div>
    );
  }

  const request = detailsData.data;

  // Type guard or safe access for shopkeeper name
  const shopName =
    typeof request.shopkeeperId === "object" && request.shopkeeperId?.shopName
      ? request.shopkeeperId.shopName
      : "Unknown Shop";

  // Calculate timeline active step index
  const currentStatus = request.status;
  const activeStepIndex = timelineSteps.findIndex((step) =>
    step.statuses.includes(currentStatus),
  );

  // Quote info
  const quoteNotes = request.shopkeeperNotes?.filter((n) => n.cost) || [];
  const latestQuote =
    quoteNotes.length > 0 ? quoteNotes[quoteNotes.length - 1] : null;

  // const generateInvoicePDF = () => {
  //   if (!request) return;

  //   const doc = new jsPDF();
  //   const shopName =
  //     typeof request.shopkeeperId === "object" && request.shopkeeperId?.shopName
  //       ? request.shopkeeperId.shopName
  //       : "Unknown Shop";
  //   // const latestQuote = request.shopkeeperNotes?.length > 0
  //   //   ? request.shopkeeperNotes[request.shopkeeperNotes.length - 1]
  //   //   : null;

  //   // --- MODERN HEADER ---
  //   // Background rectangle for header
  //   doc.setFillColor(15, 23, 42); // Navy Dark
  //   doc.rect(0, 0, 210, 50, "F");

  //   // Header Title
  //   doc.setTextColor(255, 255, 255);
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(26);
  //   doc.text("INVOICE", 14, 30);

  //   // Shop Info (Right Aligned)
  //   doc.setFontSize(12);
  //   doc.setFont("helvetica", "normal");
  //   doc.text(shopName, 196, 25, { align: "right" });
  //   doc.setFontSize(10);
  //   doc.setTextColor(156, 163, 175); // Light gray
  //   doc.text(`Request ID: #${request._id.slice(-8).toUpperCase()}`, 196, 32, {
  //     align: "right",
  //   });

  //   // --- CUSTOMER & DEVICE INFO (GRID LAYOUT) ---
  //   doc.setTextColor(31, 41, 55); // Dark Slate

  //   // Column 1: Customer
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(10);
  //   doc.text("CUSTOMER DETAILS", 14, 65);
  //   doc.setFont("helvetica", "normal");
  //   doc.setFontSize(11);
  //   doc.text(request.firstName, 14, 72);
  //   doc.setTextColor(75, 85, 99);
  //   doc.text(request.email, 14, 78);

  //   // Column 2: Date & Status
  //   doc.setTextColor(31, 41, 55);
  //   doc.setFont("helvetica", "bold");
  //   doc.text("INVOICE DATE", 120, 65);
  //   doc.setFont("helvetica", "normal");
  //   doc.text(format(new Date(), "MMMM dd, yyyy"), 120, 72);

  //   doc.setFont("helvetica", "bold");
  //   doc.text("STATUS", 120, 82);
  //   doc.setFont("helvetica", "normal");
  //   doc.text(request.status.replace("_", " ").toUpperCase(), 120, 88);

  //   // --- DEVICE CARD ---
  //   doc.setFillColor(248, 250, 252); // Light background for device info
  //   doc.roundedRect(14, 98, 182, 30, 3, 3, "F");

  //   doc.setTextColor(31, 41, 55);
  //   doc.setFont("helvetica", "bold");
  //   doc.text("DEVICE:", 20, 108);
  //   doc.setFont("helvetica", "normal");
  //   doc.text(
  //     `${request.deviceModel} (IMEI: ${request.IMEINumber || "N/A"})`,
  //     40,
  //     108,
  //   );

  //   doc.setFont("helvetica", "bold");
  //   doc.text("ISSUE:", 20, 118);
  //   doc.setFont("helvetica", "normal");
  //   doc.text(request.description, 40, 118, { maxWidth: 150 });

  //   // --- TABLE SECTION ---
  //   const notes =
  //     request.shopkeeperNotes?.map((n) => [
  //       format(new Date(n.date), "MMM dd, yyyy"),
  //       n.message,
  //       `${n.estimatedDays} Days`,
  //       `$${(n.cost ?? 0).toFixed(2)}`,
  //     ]) || [];

  //   autoTable(doc, {
  //     startY: 140,
  //     head: [["Date", "Description", "Est. Time", "Cost"]],
  //     body: notes,
  //     theme: "grid",
  //     headStyles: {
  //       fillColor: [15, 23, 42],
  //       textColor: [255, 255, 255],
  //       fontSize: 10,
  //       fontStyle: "bold",
  //       halign: "center",
  //     },
  //     bodyStyles: {
  //       fontSize: 9,
  //       textColor: [55, 65, 81],
  //     },
  //     columnStyles: {
  //       3: { halign: "right", fontStyle: "bold" }, // Cost column
  //     },
  //     alternateRowStyles: {
  //       fillColor: [249, 250, 251],
  //     },
  //   });

  //   // --- SUMMARY SECTION ---
  //   const finalY = (doc as any).lastAutoTable.finalY + 10;
  //   const totalCost =
  //     request.shopkeeperNotes?.reduce((sum, n) => sum + (n.cost || 0), 0) || 0;

  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(12);
  //   doc.text("Total Amount Due:", 140, finalY);
  //   doc.setFontSize(16);
  //   doc.setTextColor(15, 23, 42);
  //   doc.text(`$${totalCost.toFixed(2)}`, 196, finalY, { align: "right" });

  //   // --- FOOTER ---
  //   const pageHeight = doc.internal.pageSize.height;
  //   doc.setDrawColor(229, 231, 235);
  //   doc.line(14, pageHeight - 25, 196, pageHeight - 25);

  //   doc.setFontSize(9);
  //   doc.setTextColor(107, 114, 128);
  //   doc.text(`Thank you for choosing ${shopName}.`, 105, pageHeight - 15, {
  //     align: "center",
  //   });
  //   doc.text(
  //     "Computer generated invoice - no signature required.",
  //     105,
  //     pageHeight - 10,
  //     { align: "center" },
  //   );

  //   doc.save(`Invoice_${request.deviceModel}_${request._id.slice(-5)}.pdf`);
  // };

  const generateInvoicePDF = async () => {
    if (!request) return;

    const doc = new jsPDF();
    const shopName =
      typeof request.shopkeeperId === "object" && request.shopkeeperId?.shopName
        ? request.shopkeeperId.shopName
        : "Unknown Shop";

    // --- MODERN HEADER ---
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 50, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.text("INVOICE", 14, 30);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(shopName, 196, 25, { align: "right" });
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text(`Request ID: #${request._id.slice(-8).toUpperCase()}`, 196, 32, {
      align: "right",
    });

    // --- CUSTOMER & DEVICE INFO ---
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("CUSTOMER DETAILS", 14, 65);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(request.firstName, 14, 72);
    doc.setTextColor(75, 85, 99);
    doc.text(request.email, 14, 78);

    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE DATE", 120, 65);
    doc.setFont("helvetica", "normal");
    doc.text(format(new Date(), "MMMM dd, yyyy"), 120, 72);

    doc.setFont("helvetica", "bold");
    doc.text("STATUS", 120, 82);
    doc.setFont("helvetica", "normal");
    doc.text(request.status.replace("_", " ").toUpperCase(), 120, 88);

    // --- DEVICE CARD ---
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 98, 182, 30, 3, 3, "F");
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text("DEVICE:", 20, 108);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${request.deviceModel} (IMEI: ${request.IMEINumber || "N/A"})`,
      40,
      108,
    );
    doc.setFont("helvetica", "bold");
    doc.text("ISSUE:", 20, 118);
    doc.setFont("helvetica", "normal");
    doc.text(request.description, 40, 118, { maxWidth: 150 });

    // --- TABLE SECTION ---
    const notes =
      request.shopkeeperNotes?.map((n) => [
        format(new Date(n.date), "MMM dd, yyyy"),
        n.message,
        `${n.estimatedDays} Days`,
        `$${(n.cost ?? 0).toFixed(2)}`,
      ]) || [];

    autoTable(doc, {
      startY: 140,
      head: [["Date", "Description", "Est. Time", "Cost"]],
      body: notes,
      theme: "grid",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: { 3: { halign: "right", fontStyle: "bold" } },
    });

    // --- SUMMARY SECTION & QR CODE ---
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    const totalCost =
      request.shopkeeperNotes?.reduce((sum, n) => sum + (n.cost || 0), 0) || 0;

    // Total Amount (Right Side)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total Amount Due:", 140, finalY);
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(`$${totalCost.toFixed(2)}`, 196, finalY, { align: "right" });

    // QR Code Generation (Left Side)
    try {
      const qrLink = `http://localhost:3001/my-invoice/${request._id}`;
      const qrDataUrl = await QRCode.toDataURL(qrLink, {
        margin: 1,
        width: 100,
      });

      doc.addImage(qrDataUrl, "PNG", 14, finalY - 5, 30, 30);

      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text("Scan to view online", 14, finalY + 28);
    } catch (err) {
      console.error("QR Code Generation Error:", err);
    }

    // --- FOOTER ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(229, 231, 235);
    doc.line(14, pageHeight - 25, 196, pageHeight - 25);
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Thank you for choosing ${shopName}.`, 105, pageHeight - 15, {
      align: "center",
    });
    doc.text(
      "Computer generated invoice - no signature required.",
      105,
      pageHeight - 10,
      { align: "center" },
    );

    doc.save(`Invoice_${request.deviceModel}_${request._id.slice(-5)}.pdf`);
  };

  const isCounterOfferFunc = (shopkeeperId: string) => {
    if (!shopkeeperId) return;
    setCounterOfferId(id);
    setShowOfferModal(true);
    setShopkeeperId(shopkeeperId);
  };

  return (
    <>
      <div className="px-4 py-8 md:px-8 lg:px-12 font-poppins min-h-screen bg-background">
        <div className="mx-auto max-w-[1200px] space-y-6">
          {/* Header Section */}
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-surface border-2 border-border/50 flex items-center justify-center text-muted-foreground/40">
                {(() => {
                  const headerImages =
                    request.shopkeeperNotes?.flatMap((n) => n.images || []) ||
                    [];
                  return headerImages.length > 0 ? (
                    <Image
                      src={headerImages[0].url}
                      alt={request.deviceModel}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Smartphone size={32} />
                  );
                })()}
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Device
                </p>
                <h2 className="text-xl font-black text-foreground">
                  {request.deviceModel}
                </h2>
                {request.IMEINumber && (
                  <p className="text-sm font-medium text-muted-foreground">
                    IMEI: {request.IMEINumber}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Issue
              </p>
              <p className="text-sm font-bold text-foreground max-w-[200px] truncate">
                {request.description}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Submitted
              </p>
              <p className="text-sm font-bold text-foreground">
                {format(new Date(request.createdAt), "MMM dd, yyyy")}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Shopkeeper
              </p>
              <p className="text-sm font-bold text-foreground">{shopName}</p>
            </div>
            <div>
              <button
                className="rounded-full cursor-pointer bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                onClick={generateInvoicePDF}
              >
                Invoice
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Repair Timeline */}
              <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
                <h3 className="text-xl font-black text-foreground mb-2">
                  Repair Timeline
                </h3>
                <p className="text-sm font-medium text-muted-foreground mb-8">
                  Live progress of your repair request
                </p>

                <div className="relative border-l-2 border-border ml-4 space-y-8 pb-4">
                  {timelineSteps.map((step, index) => {
                    const isCompleted = index < activeStepIndex;
                    const isActive = index === activeStepIndex;
                    const isPending = index > activeStepIndex;

                    let dotColor = "bg-muted border-border";
                    let textColor = "text-muted-foreground";

                    if (isCompleted) {
                      dotColor =
                        "bg-primary border-primary text-primary-foreground";
                      textColor = "text-foreground";
                    } else if (isActive) {
                      dotColor =
                        "bg-blue-500 border-blue-500 text-white shadow-[0_0_0_4px_rgba(59,130,246,0.2)]";
                      textColor = "text-foreground";
                    }

                    return (
                      <div key={step.id} className="relative pl-8">
                        <div
                          className={`absolute -left-[11px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 ${dotColor}`}
                        >
                          {isCompleted && <CheckCircle2 size={12} />}
                          {isActive && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className={`text-base font-bold ${textColor}`}>
                              {step.label}
                            </h4>
                            {isActive && (
                              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                                Active
                              </span>
                            )}
                            {isPending && (
                              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Pending
                              </span>
                            )}
                            {step.id === "quote_sent" &&
                              currentStatus === "quote_sent" && (
                                <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-[10px] font-bold text-yellow-700 uppercase tracking-wider">
                                  Awaiting Approval
                                </span>
                              )}
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shopkeeper Notes */}
              {request.shopkeeperNotes &&
                request.shopkeeperNotes.length > 0 && (
                  <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black text-foreground">
                        Shopkeeper Notes
                      </h3>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {request.shopkeeperNotes.length} notes
                      </span>
                    </div>

                    <div className="space-y-6">
                      {request.shopkeeperNotes.map((note, idx) => (
                        <div key={note._id || idx} className="flex gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-black uppercase">
                            {shopName.slice(0, 2)}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-foreground">
                                {shopName}
                              </p>
                              <p className="text-xs font-medium text-muted-foreground">
                                {format(new Date(note.date), "MMM dd, hh:mm a")}
                              </p>
                            </div>
                            {/* <div className="rounded-2xl rounded-tl-none bg-surface p-4 text-sm font-medium text-foreground/80 leading-relaxed space-y-3">
                          <p>{note.message}</p>
                          {note.images && note.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              {note.images.map((img, i) => (
                                <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-border/50">
                                  <Image 
                                    src={img.url} 
                                    alt="Proof" 
                                    fill 
                                    className="object-cover" 
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div> */}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Time Estimate */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-base font-black text-foreground mb-4">
                  Time Estimate
                </h3>
                <div className="rounded-2xl bg-surface p-5">
                  {latestQuote?.estimatedDays ? (
                    <>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-black text-foreground">
                          {latestQuote.estimatedDays}
                        </span>
                        <span className="text-sm font-bold text-muted-foreground">
                          days
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Clock3 size={14} />
                        Estimated
                      </div>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-muted-foreground">
                      Estimate will be provided after review.
                    </p>
                  )}
                </div>
              </div>

              {/* Repair Proof Gallery */}
              {(() => {
                const proofImages =
                  request.shopkeeperNotes?.flatMap((n) => n.images || []) || [];
                if (proofImages.length === 0) return null;

                return (
                  <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-base font-black text-foreground mb-4">
                      Repair Proof
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {proofImages.slice(0, 3).map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() =>
                            setLightbox({
                              urls: proofImages.map((i) => i.url),
                              index: idx,
                            })
                          }
                          className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-border shadow-sm cursor-zoom-in"
                        >
                          <Image
                            src={img.url}
                            alt="Proof Media"
                            fill
                            className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn
                              className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                              size={24}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Approval Required */}
              {currentStatus === "quote_sent" && latestQuote && (
                <div className="rounded-3xl border border-yellow-200 bg-yellow-50/50 p-6 shadow-sm dark:bg-yellow-900/10 dark:border-yellow-900/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-black text-foreground">
                      Approval Required
                    </h3>
                    <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-[10px] font-bold text-yellow-700 uppercase tracking-wider dark:bg-yellow-900/50 dark:text-yellow-400">
                      Pending
                    </span>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-foreground">
                        ${latestQuote.cost?.toFixed(2)}
                      </span>
                      <span className="text-sm font-bold text-muted-foreground">
                        quote total
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-muted-foreground leading-relaxed">
                      Includes diagnostic fee, parts, and labor. By approving,
                      you agree to the estimated timeline.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full hover:text-white font-bold h-11"
                      onClick={() =>
                        latestQuote._id && isCounterOfferFunc(latestQuote._id)
                      }
                    >
                      Counter Offer
                    </Button>
                    <RepairOfferModal
                      isOpen={showOfferModal}
                      onClose={() => setShowOfferModal(false)}
                      id={counterOfferId}
                      shopkeeperId={shopkeeperId}
                    />
                    <Button
                      className="flex-1 rounded-full font-bold h-11 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      onClick={() =>
                        updateQuote.mutate({
                          id,
                          status: "approved",
                          shopkeeperNotesId: latestQuote?._id,
                        })
                      }
                      disabled={updateQuote.isPending}
                    >
                      {updateQuote.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Approve Repair"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {(currentStatus === "approved" ||
                currentStatus === "quote_accepted") &&
                latestQuote && (
                  <div className="rounded-3xl border border-green-200 bg-green-50/50 p-6 shadow-sm dark:bg-green-900/10 dark:border-green-900/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-black text-foreground">
                        Quote Approved
                      </h3>
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700 uppercase tracking-wider dark:bg-green-900/50 dark:text-green-400">
                        Accepted
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-foreground">
                        ${latestQuote.cost?.toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                      You have approved the repair. The shopkeeper will start
                      the work shortly.
                    </p>
                  </div>
                )}

              {currentStatus === "rejected" && latestQuote && (
                <div className="rounded-3xl border border-red-200 bg-red-50/50 p-6 shadow-sm dark:bg-red-900/10 dark:border-red-900/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-black text-foreground">
                      Quote Rejected
                    </h3>
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700 uppercase tracking-wider dark:bg-red-900/50 dark:text-red-400">
                      Rejected
                    </span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    You have rejected the repair quote. Please contact the
                    shopkeeper for further clarification or pick up your device.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          {lightbox.urls.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(
                  (prev) =>
                    prev && {
                      ...prev,
                      index:
                        (prev.index - 1 + prev.urls.length) % prev.urls.length,
                    },
                );
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <div
            className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={lightbox.urls[lightbox.index]}
                alt={`Proof ${lightbox.index + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </div>

          {lightbox.urls.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(
                  (prev) =>
                    prev && {
                      ...prev,
                      index: (prev.index + 1) % prev.urls.length,
                    },
                );
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          )}

          <div className="absolute top-4 right-4 flex items-center gap-3">
            {lightbox.urls.length > 1 && (
              <span className="text-white/60 text-xs font-bold tabular-nums">
                {lightbox.index + 1} / {lightbox.urls.length}
              </span>
            )}
            <button
              onClick={() => setLightbox(null)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
