"use client";

import React, { useState } from "react";
import { Clock, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { useUpdateResentRepairQuoteStatus } from "../../repairRequest/hooks/useRepairRequest";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
}

const RepairOfferModal = ({ isOpen, onClose, id }: Props) => {
  const [waitingDays, setWaitingDays] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, setIsPending] = useState(false);

  const updateResentQuote = useUpdateResentRepairQuoteStatus();

  const handleSubmit = async () => {
    try {
      setIsPending(true);

      await updateResentQuote.mutateAsync({
        id: id!,
        status: "waiting-for-parts",
        waitingForPartsDays: waitingDays ? Number(waitingDays) : undefined,
        waitingForPartsDescription: description,
      });

      // reset fields
      setWaitingDays("");
      setDescription("");

      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg">
        <div className="bg-card border border-border w-full rounded-[40px] p-8 shadow-2xl space-y-6 relative">
          {/* Header */}
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              Waiting For Parts
            </h3>

            <p className="text-sm font-medium text-muted-foreground">
              Inform the customer about the parts delay.
            </p>
          </div>

          {/* Waiting Days */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Estimated Waiting Days
            </label>

            <div className="relative">
              <Clock
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="number"
                value={waitingDays}
                onChange={(e) => setWaitingDays(e.target.value)}
                placeholder="3"
                className="w-full h-12 pl-10 pr-4 bg-surface border border-border rounded-2xl font-bold text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Parts are currently unavailable and expected soon..."
              className="w-full h-32 p-5 bg-surface border border-border rounded-[24px] font-bold text-sm outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isPending}
              className="flex-1 h-14 rounded-full font-black text-sm uppercase tracking-widest"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 h-14 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20"
            >
              <Wrench size={18} className="mr-2" />

              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RepairOfferModal;
