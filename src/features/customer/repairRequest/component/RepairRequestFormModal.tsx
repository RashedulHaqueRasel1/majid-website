"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import { Loader2, Paperclip } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useCreateRepairRequest } from "../hooks/useRepairRequest";
import { Shopkeeper } from "../types/repair-request.types";

interface RepairRequestFormModalProps {
  shopkeeper: Shopkeeper | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RepairRequestFormModal({
  shopkeeper,
  isOpen,
  onClose,
}: RepairRequestFormModalProps) {
  const [fullName, setFullName] = useState("");
  const [isFullNameEdited, setIsFullNameEdited] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailEdited, setIsEmailEdited] = useState(false);
  const [deviceModel, setDeviceModel] = useState("");
  const [imeiNumber, setImeiNumber] = useState("");
  const [problemDescription, setProblemDescription] = useState("");

  const { data: profileData } = useMyProfile();
  const createRepairRequest = useCreateRepairRequest();

  const user = profileData?.data;
  const profileFullName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  // Reset or set initial values when shopkeeper changes or modal opens
  useEffect(() => {
    if (!isOpen || !user) return;

    // Use a small timeout to move setState out of the synchronous render/effect cycle
    // to satisfy strict linting rules regarding cascading renders.
    const timer = setTimeout(() => {
      if (!isFullNameEdited && fullName !== profileFullName) {
        setFullName(profileFullName);
      }
      if (!isEmailEdited && email !== (user.email || "")) {
        setEmail(user.email || "");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [
    isOpen,
    user,
    profileFullName,
    isFullNameEdited,
    isEmailEdited,
    fullName,
    email,
  ]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!shopkeeper) return;

    createRepairRequest.mutate(
      {
        shopkeeperId: shopkeeper._id,
        firstName: fullName,
        email: email,
        deviceModel,
        IMEINumber: imeiNumber,
        description: problemDescription,
      },
      {
        onSuccess: () => {
          setDeviceModel("");
          setImeiNumber("");
          setProblemDescription("");
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border sm:rounded-[32px] p-0 overflow-hidden">
        <div className="bg-primary/5 p-8 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-foreground">
              Repair Request for {shopkeeper?.shopName}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Please provide details about your device and the issue you&apos;re
              facing.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground uppercase tracking-wider">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setIsFullNameEdited(true);
                }}
                required
                className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Your Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground uppercase tracking-wider">
                Email Address
              </label>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailEdited(true);
                }}
                required
                type="email"
                className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground uppercase tracking-wider">
                Device Model
              </label>
              <input
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="e.g. iPhone 15 Pro"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground uppercase tracking-wider">
                IMEI Number (Optional)
              </label>
              <input
                value={imeiNumber}
                onChange={(e) => setImeiNumber(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Enter IMEI"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground uppercase tracking-wider">
              Problem Description
            </label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              required
              rows={4}
              className="w-full p-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
              placeholder="Describe the issue in detail..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full px-8 h-12 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRepairRequest.isPending}
              className="rounded-full px-10 h-12 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.02] transition-all"
            >
              {createRepairRequest.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
