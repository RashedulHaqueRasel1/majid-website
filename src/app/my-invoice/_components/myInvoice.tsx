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
import { useRepairRequestDetails } from "@/features/customer/repairRequest/hooks/useRepairRequest";

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

export default function RepairInvoice({ id }: { id: string }) {
  const { data: detailsData, isLoading } = useRepairRequestDetails(id);
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
  const currentStatus = request?.status;

  const currentStepIndex = timelineSteps.findIndex((step) =>
    step.statuses.includes(currentStatus),
  );

  const isCompletedStatus = currentStatus === "completed";

  // Quote info
  const quoteNotes = request.shopkeeperNotes?.filter((n) => n.cost) || [];
  const latestQuote =
    quoteNotes.length > 0 ? quoteNotes[quoteNotes.length - 1] : null;

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

                <div className="relative border-l-2 border-border dark:border-yellow-400 ml-4 space-y-8 pb-4">
                  {timelineSteps.map((step, index) => {
                    const isCompleted =
                      isCompletedStatus || index < currentStepIndex;

                    const isActive =
                      !isCompletedStatus && index === currentStepIndex;

                    let dotStyle =
                      "bg-muted border-border text-muted-foreground"; // pending default

                    if (isCompleted) {
                      dotStyle =
                        "bg-primary border-primary text-white shadow-sm";
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
              </div>

              {/* Shopkeeper Notes */}
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
              {/* {currentStatus === "quote_sent" && latestQuote && (
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
                      className="flex-1 rounded-full font-bold h-11"
                      onClick={() =>
                        updateQuote.mutate({
                          id,
                          status: "rejected",
                          shopkeeperNotesId: latestQuote?._id,
                        })
                      }
                      disabled={updateQuote.isPending}
                    >
                      Reject
                    </Button>
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
              )} */}

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
