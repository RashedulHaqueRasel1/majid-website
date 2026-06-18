/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { format } from "date-fns";
import {
  Loader2,
  Smartphone,
  User,
  Mail,
  Clock,
  DollarSign,
  Paperclip,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Phone,
} from "lucide-react";
import { useState } from "react";
import {
  useRepairRequestDetails,
  useUpdateRepairRequestStatusByShopkeeper,
  useAddRepairRequestNote,
  useUpdateResentRepairQuoteStatus,
} from "@/features/customer/repairRequest/hooks/useRepairRequest";
import { Button } from "@/components/ui/button";
import RepairOfferModal from "@/features/customer/repairHistory/component/RepairOfferModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { useSession } from "next-auth/react";
import CheckoutModal from "./CheckoutModal";

const timelineSteps = [
  {
    id: "order_booked",
    label: "Order Booked",
    description: "Your order has been successfully created",
    statuses: ["inProgress"],
  },
  {
    id: "order_assigned",
    label: "Order Assigned",
    description: "A technician has been assigned",
    statuses: ["order-assigned"],
  },
  {
    id: "diagnosing",
    label: "Diagnosing Started",
    description: "Technician is diagnosing the issue",
    statuses: ["diagnosing"],
  },
  {
    id: "quote_sent",
    label: "Quote Sent",
    description: "A quote has been sent for the repair",
    statuses: ["quote_sent"],
  },
  {
    id: "repairing",
    label: "Repairing Started",
    description: "Device is being repaired",
    statuses: ["start-work"],
  },
  {
    id: "waiting_parts",
    label: "Waiting for Parts",
    description: "Repair is paused until parts arrive",
    statuses: ["waiting-for-parts"],
  },
  {
    id: "completed",
    label: "Repair Complete",
    description: "Repair has been successfully completed",
    statuses: ["completed"],
  },
];

export default function RepairRequestDetails({ id }: { id: string }) {
  const { data: detailsData, isLoading, refetch } = useRepairRequestDetails(id);
  const updateStatus = useUpdateRepairRequestStatusByShopkeeper();
  const session = useSession();
  const addNote = useAddRepairRequestNote();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const updateResentQuote = useUpdateResentRepairQuoteStatus();
  const [noteMessage, setNoteMessage] = useState("");
  const [noteCost, setNoteCost] = useState("");
  const [noteDays, setNoteDays] = useState("");
  const [noteImages, setNoteImages] = useState<File[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const token = session.data?.accessToken;

  const [lightbox, setLightbox] = useState<{
    urls: string[];
    index: number;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] bg-background items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const request = detailsData?.data;

  if (!request) {
    return (
      <div className="flex h-[80vh] items-center justify-center font-bold text-lg text-muted-foreground">
        Repair request not found.
      </div>
    );
  }

  const generateInvoicePDF = async () => {
    if (!request) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageHeight = doc.internal.pageSize.getHeight();

    const shopName =
      typeof request?.shopkeeperId === "object"
        ? request?.shopkeeperId?.shopName || "Repair Shop"
        : "Repair Shop";

    const formatDate = (date: string | number | Date) =>
      date ? format(new Date(date), "MMM dd, yyyy") : "-";

    const safeText = (text: string | undefined) =>
      text ? String(text) : "N/A";

    const totalCost =
      request?.shopkeeperNotes?.reduce(
        (sum, n) => sum + Number(n.cost || 0),
        0,
      ) || 0;

    const invoiceNumber = `IMS-${request?._id?.slice(-6)?.toUpperCase()}`;

    const rows =
      request?.shopkeeperNotes?.map((n) => [
        formatDate(n.date),
        safeText(n.message),
        `${n.estimatedDays || 0} Days`,
        `$${Number(n.cost || 0).toFixed(2)}`,
      ]) || [];

    // ================= BACKGROUND =================

    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, 210, 297, "F");

    // ================= HEADER =================

    doc.setFillColor(101, 163, 13);
    doc.rect(0, 0, 210, 42, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);

    doc.text("Repair Invoice", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text("Verified Device Repair Invoice", 14, 28);

    // ================= VERIFIED BADGE =================

    doc.setFillColor(220, 252, 231);
    doc.roundedRect(145, 12, 50, 10, 3, 3, "F");

    doc.setFontSize(8);
    doc.setTextColor(22, 163, 74);
    doc.setFont("helvetica", "bold");

    doc.text("✓ VERIFIED", 170, 18, {
      align: "center",
    });

    // ================= META INFO =================

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230);

    doc.roundedRect(14, 50, 182, 24, 4, 4, "FD");

    doc.setFontSize(8);
    doc.setTextColor(120);

    doc.text("INVOICE NO", 20, 60);
    doc.text("DATE", 150, 60);

    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.setFont("helvetica", "bold");

    doc.text(invoiceNumber, 20, 67);

    doc.text(formatDate(new Date()), 190, 67, {
      align: "right",
    });

    // ================= DEVICE CARD =================

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 82, 182, 40, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);

    doc.text(safeText(request.deviceModel), 20, 96);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);

    doc.text(`IMEI: ${safeText(request.IMEINumber)}`, 20, 105);

    doc.text(
      `Status: ${safeText(request.status).replaceAll("_", " ").toUpperCase()}`,
      20,
      112,
    );

    // ================= CUSTOMER + SHOP CARDS =================

    const modernCard = (
      x: number,
      y: number,
      title: string,
      main: string,
      sub?: string,
    ) => {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, 86, 30, 4, 4, "FD");

      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.setFont("helvetica", "bold");

      doc.text(title.toUpperCase(), x + 5, y + 8);

      doc.setFontSize(12);
      doc.setTextColor(20);

      doc.text(main, x + 5, y + 17);

      if (sub) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);

        doc.text(sub, x + 5, y + 24);
      }
    };

    modernCard(
      14,
      128,
      "Customer",
      safeText(request.firstName),
      safeText(request.email),
    );

    modernCard(
      110,
      128,
      "Repair Shop",
      shopName,
      `Created: ${formatDate(request.createdAt)}`,
    );

    // ================= TABLE =================

    autoTable(doc, {
      startY: 170,

      margin: {
        left: 14,
        right: 14,
      },

      head: [["DATE", "DESCRIPTION", "TIME", "COST"]],

      body:
        rows.length > 0 ? rows : [["-", "No Repair Notes Added", "-", "$0.00"]],

      theme: "grid",

      styles: {
        fontSize: 8,
        cellPadding: 5,
        textColor: [40, 40, 40],
        lineColor: [230, 230, 230],
        lineWidth: 0.2,
      },

      headStyles: {
        fillColor: [101, 163, 13],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },

      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },

      columnStyles: {
        3: {
          halign: "right",
        },
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 220;

    // ================= TECHNICIAN FEEDBACK =================

    if (request?.technicianFeedback) {
      doc.setFillColor(255, 255, 255);

      doc.roundedRect(14, finalY + 10, 110, 34, 4, 4, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);

      doc.text("TECHNICIAN FEEDBACK", 20, finalY + 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);

      const splitFeedback = doc.splitTextToSize(request.technicianFeedback, 96);

      doc.text(splitFeedback, 20, finalY + 28);
    }

    // ================= TOTAL BOX =================

    doc.setFillColor(255, 255, 255);

    doc.roundedRect(130, finalY + 10, 66, 34, 4, 4, "FD");

    doc.setFontSize(9);
    doc.setTextColor(120);

    doc.text("Subtotal", 136, finalY + 20);

    doc.text(`$${totalCost.toFixed(2)}`, 190, finalY + 20, {
      align: "right",
    });

    doc.text("Tax", 136, finalY + 27);

    doc.text("$0.00", 190, finalY + 27, {
      align: "right",
    });

    doc.setDrawColor(220);

    doc.line(136, finalY + 31, 190, finalY + 31);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);

    doc.text("TOTAL", 136, finalY + 39);

    doc.text(`$${totalCost.toFixed(2)}`, 190, finalY + 39, {
      align: "right",
    });

    // ================= QR CODE =================

    try {
      const baseURL = "http://187.77.187.56:4897";

      const qrLink = `${baseURL}/my-invoice/${request._id}`;

      const qrDataUrl = await QRCode.toDataURL(qrLink, {
        width: 120,
        margin: 1,
      });

      const qrY = request?.technicianFeedback ? finalY + 52 : finalY + 12;

      doc.addImage(qrDataUrl, "PNG", 14, qrY, 24, 24);

      doc.setFontSize(7);
      doc.setTextColor(120);

      doc.text(
        "Scan to verify invoice",
        14,
        request?.technicianFeedback ? finalY + 80 : finalY + 40,
      );
    } catch (err) {
      console.log(err);
    }

    // ================= FOOTER =================

    doc.setDrawColor(220);

    doc.line(14, pageHeight - 18, 196, pageHeight - 18);

    doc.setFontSize(8);
    doc.setTextColor(120);

    doc.text(`Thank you for choosing ${shopName}`, 105, pageHeight - 10, {
      align: "center",
    });

    doc.text("Computer generated smart verified invoice", 105, pageHeight - 5, {
      align: "center",
    });

    // ================= SAVE =================

    doc.save(
      `Invoice_${request.deviceModel}_${request._id
        .slice(-5)
        .toUpperCase()}.pdf`,
    );
  };

  const currentStatus = request?.status;

  const currentStepIndex = timelineSteps.findIndex((step) =>
    step.statuses.includes(currentStatus),
  );

  const isCompletedStatus = currentStatus === "completed";

  const handleStatusUpdate = (status: string) => {
    updateStatus.mutate({ id, status });
  };

  const handleAddNote = () => {
    if (!noteMessage.trim()) return;
    addNote.mutate(
      {
        id,
        payload: {
          message: noteMessage,
          cost: noteCost ? parseFloat(noteCost) : undefined,
          estimatedDays: noteDays ? parseInt(noteDays) : undefined,
          date: new Date().toISOString(),
          images: noteImages,
        },
      },
      {
        onSuccess: () => {
          setNoteMessage("");
          setNoteCost("");
          setNoteDays("");
          setNoteImages([]);
          updateStatus.mutate({ id, status: "quote_sent" });
        },
      },
    );
  };

  const handleGenerateTechnicianFeedback = async () => {
    setIsGeneratingFeedback(true);

    try {
      const baseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://187.77.187.56:4897";
      const response = await axios.post(
        `${baseURL}/repair-requests/technician-feedback/${id}`,
        {}, // request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Response:", response.data);

      if (response.data.success) {
        await refetch();
      }
    } catch (error: any) {
      console.error(
        "Error generating technician feedback:",
        error?.response?.data || error,
      );
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  return (
    <>
      <div className="px-4 py-8 md:px-8 lg:px-10 font-poppins min-h-screen bg-background">
        <div className="mx-auto max-w-[1400px] space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Device Information Card */}
              <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-foreground">
                    Device Information
                  </h3>
                  <button
                    className="rounded-full cursor-pointer bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                    onClick={generateInvoicePDF}
                  >
                    Invoice
                  </button>
                </div>
                <div className="bg-surface rounded-3xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center border border-border shadow-sm text-muted-foreground">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-foreground leading-tight">
                        {request.deviceModel}
                      </h4>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {request.description.slice(0, 40)}...
                      </p>
                    </div>
                  </div>
                  <div className="px-5 py-1.5 bg-[#DCFCE7] text-[#16A34A] rounded-full text-xs font-black uppercase tracking-wider">
                    {request.status.replace(/_/g, " ")}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 pt-2">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                      Request ID
                    </p>
                    <p className="text-sm font-black text-foreground">
                      #{request._id.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                      Submitted
                    </p>
                    <p className="text-sm font-black text-foreground">
                      {format(
                        new Date(request.createdAt),
                        "MMM dd, yyyy · hh:mm a",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                      Shop
                    </p>
                    <p className="text-sm font-black text-foreground">
                      {typeof request.shopkeeperId === "object"
                        ? request.shopkeeperId.shopName
                        : "Your Shop"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative border-l-2 border-border dark:border-yellow-400 ml-4 space-y-8 pb-4">
                {timelineSteps.map((step, index) => {
                  const isCompleted =
                    isCompletedStatus || index < currentStepIndex;

                  const isActive =
                    !isCompletedStatus && index === currentStepIndex;

                  let dotStyle = "bg-muted border-border text-muted-foreground"; // pending default

                  if (isCompleted) {
                    dotStyle = "bg-primary border-primary text-white shadow-sm";
                  } else if (isActive) {
                    dotStyle =
                      "bg-blue-500 border-blue-500 text-white shadow-[0_0_0_4px_rgba(59,130,246,0.2)]";
                  }

                  return (
                    <div key={step.id} className="relative pl-8">
                      {/* DOT */}
                      <div
                        className={`absolute -left-[11px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${dotStyle}`}
                      >
                        {isCompleted && <CheckCircle2 size={12} />}

                        {isActive && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}

                        {!isCompleted && !isActive && (
                          <div className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                        )}
                      </div>

                      {/* CONTENT */}
                      <div>
                        <div className="flex items-center gap-3">
                          <h4
                            className={`text-base font-bold ${
                              isCompleted || isActive
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </h4>

                          {isActive && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                              Active
                            </span>
                          )}

                          {!isCompleted && !isActive && (
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              Pending
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

              {/* Issue Description Card */}
              <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-foreground">
                  Issue Description
                </h3>
                <div className="bg-surface rounded-2xl p-6 min-h-[140px]">
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                    {request.description}
                  </p>
                </div>
              </div>

              {/* Technician Feedback Section - Only shows when status is completed */}
              {request.status === "completed" && (
                <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-black text-foreground">
                        Technician Feedback
                      </h3>
                    </div>
                    {!(request as any).technicianFeedback && (
                      <Button
                        onClick={handleGenerateTechnicianFeedback}
                        disabled={isGeneratingFeedback}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 h-10 font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                      >
                        {isGeneratingFeedback ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Generate AI Feedback"
                        )}
                      </Button>
                    )}
                  </div>

                  {(request as any).technicianFeedback ? (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                            {(request as any).technicianFeedback}
                          </p>
                          <p className="text-xs text-muted-foreground mt-3">
                            🤖 AI-generated feedback based on repair completion
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface rounded-2xl p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Click the button above to generate AI-powered technician
                        feedback for this completed repair.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Issue Description Card */}
              {/* <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-foreground">
                  Issue Description
                </h3>
                <div className="bg-surface rounded-2xl p-6 min-h-[140px]">
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                    {request.description}
                  </p>
                </div>
              </div> */}

              {/* Customer Details Card */}
              <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
                <h3 className="text-xl font-black text-foreground">
                  Customer Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-surface rounded-xl flex items-center justify-center text-muted-foreground">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                        Name
                      </p>
                      <p className="text-sm font-black text-foreground leading-none">
                        {request.firstName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-surface rounded-xl flex items-center justify-center text-muted-foreground">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                        Phone
                      </p>
                      <p className="text-sm font-black text-foreground leading-none">
                        {request.phoneNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-surface rounded-xl flex items-center justify-center text-muted-foreground">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                        Email
                      </p>
                      <p className="text-sm font-black text-foreground leading-none">
                        {request.email}
                      </p>
                    </div>
                  </div>
                  {/* <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-surface rounded-xl flex items-center justify-center text-muted-foreground">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                        Location
                      </p>
                      <p className="text-sm font-black text-foreground leading-none">
                        {typeof request.userId === "object"
                          ? request.userId.location
                          : "Lahore, Pakistan"}
                      </p>
                    </div>
                  </div> */}
                </div>
              </div>
              {/* Status Actions Section */}
              {(request.status === "submitted" ||
                request.status === "request_submitted") && (
                <div className="bg-card border border-border rounded-[32px] p-6 shadow-sm flex flex-wrap gap-4 items-center">
                  <Button
                    onClick={() => handleStatusUpdate("in_review")}
                    className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full px-8 h-12 font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-green-500/20"
                    disabled={updateStatus.isPending}
                  >
                    In Review
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("rejected")}
                    className="bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-full px-8 h-12 font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-red-500/20"
                    disabled={updateStatus.isPending}
                  >
                    Reject
                  </Button>
                </div>
              )}

              {request.status === "approved" && (
                <div className="bg-card border border-border rounded-[32px] p-6 shadow-sm flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">
                      Next Step
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      Customer has approved the quote. Start the repair when
                      ready.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleStatusUpdate("repair_in_progress")}
                    className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full px-8 h-12 font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-purple-500/20 shrink-0"
                    disabled={updateStatus.isPending}
                  >
                    Start Repair
                  </Button>
                </div>
              )}

              {request.status === "repair_in_progress" && (
                <div className="bg-card border border-border rounded-[32px] p-6 shadow-sm flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">
                      Repair Active
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      Click below once all hardware work is finished.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleStatusUpdate("completed")}
                    className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full px-8 h-12 font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-green-500/20 shrink-0"
                    disabled={updateStatus.isPending}
                  >
                    Mark as Completed
                  </Button>
                </div>
              )}

              {request.status === "quote_accepted" && (
                <div className="bg-card border border-border rounded-[32px] p-6 shadow-sm flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">
                      Quote Accepted
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      Mark the repair as completed when all work is finished.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleStatusUpdate("completed")}
                    className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full px-8 h-12 font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-green-500/20 shrink-0"
                    disabled={updateStatus.isPending}
                  >
                    Mark as Completed
                  </Button>
                </div>
              )}

              {/* Sent Notes & Quotes History */}
              {request.shopkeeperNotes &&
                request.shopkeeperNotes.length > 0 && (
                  <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-foreground">
                        Notes & Quotes History
                      </h3>
                      <span className="px-3 py-1 bg-surface rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {request.shopkeeperNotes.length} Entries
                      </span>
                    </div>
                    <div className="space-y-4">
                      {request.shopkeeperNotes
                        .slice()
                        .reverse()
                        .map((note, idx) => (
                          <div
                            key={note._id || idx}
                            className="bg-surface rounded-2xl p-5 border border-border/50 space-y-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                  {idx + 1}
                                </span>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                  {format(
                                    new Date(note.date),
                                    "MMM dd, hh:mm a",
                                  )}
                                </span>
                              </div>
                              {(note.cost || note.estimatedDays) && (
                                <div className="flex items-center gap-3">
                                  {note.cost && (
                                    <span className="text-sm font-black text-foreground">
                                      {"$"}
                                      {note.cost.toFixed(2)}
                                    </span>
                                  )}
                                  {note.estimatedDays && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-black uppercase">
                                      {note.estimatedDays} Days
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                              {note.message}
                            </p>
                            {note.images && note.images.length > 0 && (
                              <div className="flex gap-2 pt-2">
                                {note.images.map((img, i) => (
                                  <div
                                    key={i}
                                    className="relative w-12 h-12 rounded-lg overflow-hidden border border-border"
                                  >
                                    <Image
                                      src={img.url}
                                      alt="Note proof"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {request.waitingForPartsDays &&
                request.waitingForPartsDescription && (
                  <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-foreground">
                        Waiting For Parts Details
                      </h3>

                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {request.waitingForPartsDays} Days
                      </span>
                    </div>

                    <div className="bg-surface rounded-2xl p-6 border border-border/50 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                          <Clock3 className="w-5 h-5 text-blue-600" />
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-foreground">
                            Parts Currently Unavailable
                          </h4>

                          <p className="text-xs font-medium text-muted-foreground">
                            Estimated waiting time:{" "}
                            {request.waitingForPartsDays} days
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-card border border-border p-5">
                        <p className="text-sm leading-relaxed font-medium text-foreground/80">
                          {request.waitingForPartsDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Approval Required */}

              <div className="rounded-3xl border border-yellow-200 bg-yellow-50/50 p-6 shadow-sm dark:bg-yellow-900/10 dark:border-yellow-900/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-black text-foreground">
                    Change Repair Status
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      updateResentQuote.mutate({
                        id: id!,
                        status: "order-assigned",
                      });
                    }}
                    variant="outline"
                    className="flex-1 cursor-pointer rounded-full !bg-[#EF4444] hover:text-white font-bold h-11"
                  >
                    Order Assigned
                  </Button>

                  <Button
                    onClick={() => {
                      updateResentQuote.mutate({
                        id: id!,
                        status: "diagnosing",
                      });
                    }}
                    variant="outline"
                    className="flex-1 cursor-pointer rounded-full !bg-[#84CC16] hover:text-white font-bold h-11"
                  >
                    Diagonosing Device
                  </Button>

                  <Button
                    onClick={() => {
                      updateResentQuote.mutate({
                        id: id!,
                        status: "start-work",
                      });
                    }}
                    variant="outline"
                    className="flex-1 cursor-pointer rounded-full !bg-[#F59E0B] hover:text-white font-bold h-11"
                  >
                    Repairing Device
                  </Button>

                  <Button
                    onClick={() => {
                      setShowOfferModal(true);
                    }}
                    variant="outline"
                    className="flex-1 cursor-pointer rounded-full !bg-[#3B82F6] hover:text-white font-bold h-11"
                  >
                    Waiting for Parts
                  </Button>

                  <RepairOfferModal
                    isOpen={showOfferModal}
                    onClose={() => setShowOfferModal(false)}
                    id={id}
                  />

                  <Button
                    className="flex-1 rounded-full font-bold h-11 cursor-pointer !bg-[#84CC16] text-primary-foreground shadow-lg shadow-primary/20"
                    onClick={() => setIsConfirmOpen(true)}
                    // disabled={updateResentQuote.isPending}
                  >
                    Completed
                  </Button>

                  {isCompletedStatus && (
                    <Button
                      className="flex-1 rounded-full font-bold h-11 cursor-pointer !bg-[#2216cc] text-primary-foreground shadow-lg shadow-primary/20"
                      onClick={() => setIsCheckoutOpen(true)}
                      // disabled={updateResentQuote.isPending}
                    >
                      Checkout
                    </Button>
                  )}

                  <CheckoutModal
                    open={isCheckoutOpen}
                    onOpenChange={setIsCheckoutOpen}
                  />

                  {isConfirmOpen && (
                    <AlertDialog
                      open={isConfirmOpen}
                      onOpenChange={setIsConfirmOpen}
                    >
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold text-amber-600 flex items-center gap-2">
                            ⚠️ Attention Required!
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-base text-gray-700 pt-2 font-medium">
                            Please make sure to collect the{" "}
                            <strong>IMEI or Serial number</strong> from the
                            phone before completing this process.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4">
                          <AlertDialogCancel
                            className=" hover:text-foreground"
                            onClick={() => setIsConfirmOpen(false)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-[#84CC16] hover:bg-[#6da812] text-white"
                            onClick={async () => {
                              setIsConfirmOpen(false);
                              // First update status to completed
                              await updateResentQuote.mutateAsync({
                                id,
                                status: "completed",
                              });
                              // Then generate technician feedback
                              await handleGenerateTechnicianFeedback();
                            }}
                          >
                            Yes, Collected & Complete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
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
          {/* Navigation: Prev */}
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

          {/* Image */}
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

          {/* Navigation: Next */}
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

          {/* Counter & Close */}
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
