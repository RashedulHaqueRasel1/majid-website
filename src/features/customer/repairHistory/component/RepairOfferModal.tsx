"use client";

import React, { useState } from "react";
import { DollarSign, Clock, Send, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUpdateRepairQuoteStatus } from "../../repairRequest/hooks/useRepairRequest";
import { resentRepairRequestNote } from "../../repairRequest/api/repair-request.api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
  shopkeeperId?: string | null;
}

const RepairOfferModal = ({ isOpen, onClose, id, shopkeeperId }: Props) => {
  const [noteCost, setNoteCost] = useState("");
  const [noteDays, setNoteDays] = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const updateQuote = useUpdateRepairQuoteStatus();

  const handleSendOffer = async () => {
    try {
      setIsPending(true);

      await resentRepairRequestNote({
        id: id as string,
        payload: {
          message: noteMessage,
          cost: noteCost ? Number(noteCost) : undefined,
          estimatedDays: noteDays ? Number(noteDays) : undefined,
        },
      });

      onClose();
    } catch (error) {
      console.error("Failed to send offer:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg">
        <div className="bg-card border border-border w-full rounded-[40px] p-8 shadow-2xl space-y-6 relative">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              Repair Action
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
              Send an offer or reject the request.
            </p>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Estimated Cost
              </label>
              <div className="relative">
                <DollarSign
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="number"
                  value={noteCost}
                  onChange={(e) => setNoteCost(e.target.value)}
                  placeholder="1500"
                  className="w-full h-12 pl-10 pr-4 bg-surface border border-border rounded-2xl font-bold text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Estimated Days
              </label>
              <div className="relative">
                <Clock
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
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

          <textarea
            value={noteMessage}
            onChange={(e) => setNoteMessage(e.target.value)}
            placeholder="Add your message here..."
            className="w-full h-32 p-5 bg-surface border border-border rounded-[24px] font-bold text-sm outline-none focus:border-primary transition-colors resize-none"
          />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => {
                updateQuote.mutate({
                  id: id!,
                  status: "rejected",
                  shopkeeperNotesId: shopkeeperId!,
                });
                onClose();
              }}
              variant="outline"
              disabled={isPending}
              className="flex-1 h-14 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full font-black text-sm uppercase tracking-widest"
            >
              <Ban size={18} className="mr-2" /> Reject
            </Button>

            <Button
              onClick={handleSendOffer}
              disabled={isPending}
              className="flex-1 h-14 bg-[#84CC16] hover:bg-[#71AF12] text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-lime-500/20"
            >
              <Send size={18} className="mr-2" />
              {isPending ? "Sending..." : "Send Offer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RepairOfferModal;
