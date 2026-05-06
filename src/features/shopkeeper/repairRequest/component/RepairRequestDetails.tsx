"use client";

import Image from "next/image";
import { format } from "date-fns";
import {
  Loader2,
  Smartphone,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Paperclip,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import {
  useRepairRequestDetails,
  useUpdateRepairRequestStatusByShopkeeper,
  useAddRepairRequestNote,
  useUpdateResentRepairQuoteStatus,
} from "@/features/customer/repairRequest/hooks/useRepairRequest";
import { Button } from "@/components/ui/button";

export default function RepairRequestDetails({ id }: { id: string }) {
  const { data: detailsData, isLoading } = useRepairRequestDetails(id);
  const updateStatus = useUpdateRepairRequestStatusByShopkeeper();
  const addNote = useAddRepairRequestNote();
  const updateResentQuote = useUpdateResentRepairQuoteStatus();
  const [noteMessage, setNoteMessage] = useState("");
  const [noteCost, setNoteCost] = useState("");
  const [noteDays, setNoteDays] = useState("");
  const [noteImages, setNoteImages] = useState<File[]>([]);
  const [lightbox, setLightbox] = useState<{
    urls: string[];
    index: number;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
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

  // Quote info
  const quoteNotes = request?.userNotes?.filter((n) => n.cost) || [];

  // latest ta nibo (last item)
  const latestQuote =
    quoteNotes.length > 0 ? quoteNotes[quoteNotes.length - 1] : null;

  // status check
  const isQuoteAvailable = request?.status === "quote-resent" && latestQuote;

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
          // Automatically update status to quote_sent when a note/quote is added
          updateStatus.mutate({ id, status: "quote_sent" });
        },
      },
    );
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
                <h3 className="text-xl font-black text-foreground">
                  Device Information
                </h3>
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
                      #REQ-{request._id.slice(-8).toUpperCase()}-IMS
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
                        {typeof request.userId === "object"
                          ? request.userId.phone
                          : "+92 300 1234567"}
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
                  <div className="flex items-center gap-4">
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
                  </div>
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
              {request.userNotes && request.userNotes.length > 0 && (
                <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-foreground">
                      Notes & Quotes History
                    </h3>
                    <span className="px-3 py-1 bg-surface rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {request.userNotes.length} Entries
                    </span>
                  </div>
                  <div className="space-y-4">
                    {request.userNotes
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
                                {format(new Date(note.date), "MMM dd, hh:mm a")}
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
                          {/* {note.images && note.images.length > 0 && (
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
                            )} */}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Device Proof Images Card */}

              {/* Shopkeeper Notes Card */}
              <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
                <h3 className="text-xl font-black text-foreground">
                  Shopkeeper Notes
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                      Estimated Cost
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <DollarSign size={14} />
                      </div>
                      <input
                        type="number"
                        value={noteCost}
                        onChange={(e) => setNoteCost(e.target.value)}
                        placeholder="150"
                        className="w-full h-12 pl-10 pr-4 bg-surface border border-border rounded-2xl font-bold text-sm outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                      Estimated Time (days)
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Clock size={14} />
                      </div>
                      <input
                        type="number"
                        value={noteDays}
                        onChange={(e) => setNoteDays(e.target.value)}
                        placeholder="3"
                        className="w-full h-12 pl-10 pr-4 bg-surface border border-border rounded-2xl font-bold text-sm outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <textarea
                    value={noteMessage}
                    onChange={(e) => setNoteMessage(e.target.value)}
                    placeholder="Add internal notes about this repair..."
                    className="w-full h-32 p-5 bg-surface border border-border rounded-[24px] font-bold text-sm outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                {/* Image Upload for Shopkeeper */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                    Attach Proof (Images)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {noteImages.map((file, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-xl overflow-hidden border border-border"
                      >
                        <Image
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() =>
                            setNoteImages((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {noteImages.length < 4 && (
                      <label className="w-16 h-16 rounded-xl border border-dashed border-border bg-surface flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                        <Paperclip
                          size={18}
                          className="text-muted-foreground"
                        />
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setNoteImages((prev) =>
                              [...prev, ...files].slice(0, 4),
                            );
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleAddNote}
                  disabled={addNote.isPending || !noteMessage.trim()}
                  className="w-full h-14 bg-[#84CC16] hover:bg-[#71AF12] text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-lime-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {addNote.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </div>

              {/* Approval Required */}
              {isQuoteAvailable && (
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
                      {latestQuote.message}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        updateResentQuote.mutate({
                          id: id!,
                          status: "rejected",
                          userNotesId: latestQuote._id,
                        });
                      }}
                      variant="outline"
                      className="flex-1 rounded-full hover:text-white font-bold h-11"
                    >
                      Reject Repair
                    </Button>

                    <Button
                      className="flex-1 rounded-full font-bold h-11 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      onClick={() =>
                        updateResentQuote.mutate({
                          id,
                          status: "approved",
                          userNotesId: latestQuote?._id,
                        })
                      }
                      disabled={updateResentQuote.isPending}
                    >
                      {updateResentQuote.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Approve Repair"
                      )}
                    </Button>
                  </div>
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
