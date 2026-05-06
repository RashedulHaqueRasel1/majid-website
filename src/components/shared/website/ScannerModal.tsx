"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export function ScannerModal({ isOpen, onClose, onScan }: ScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "html5-qrcode-scanner";

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  }, []);

  const startScanner = useCallback(async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            onScan(decodedText);
            onClose();
          },
          () => {
            // Silence scanning errors
          },
        );
        setIsScanning(true);
      } else {
        toast.error("No camera found");
        onClose();
      }
    } catch (err) {
      console.error("Scanner error:", err);
      toast.error(
        "Failed to start camera. Please ensure camera permissions are granted.",
      );
      onClose();
    }
  }, [onScan, onClose]);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the DOM element is rendered
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }
  }, [isOpen, startScanner, stopScanner]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl rounded-[32px] overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Camera className="text-primary w-6 h-6" />
            </div>
            Scan IMEI / Barcode
          </DialogTitle>
        </DialogHeader>

        <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
          <div id={scannerId} className="w-full h-full" />

          {/* Scanning Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Dark mask around the scan area */}
            <div
              className="absolute inset-0 bg-black/40"
              style={{
                clipPath:
                  "polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, calc(50% - 125px) calc(50% - 125px), calc(50% + 125px) calc(50% - 125px), calc(50% + 125px) calc(50% + 125px), calc(50% - 125px) calc(50% + 125px), calc(50% - 125px) calc(50% - 125px))",
              }}
            />

            <div className="w-[250px] h-[250px] border-2 border-primary/50 rounded-2xl relative">
              {/* Animated scanning line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 shadow-[0_0_15px_rgba(132,204,22,0.8)] animate-[scan_2s_ease-in-out_infinite] z-10" />

              {/* Corners */}
              <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
              <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
              <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
              <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-2xl" />
            </div>
          </div>

          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center space-y-4 z-20">
              <RefreshCw className="w-12 h-12 animate-spin text-primary" />
              <p className="font-bold text-lg">Initializing Camera...</p>
              <p className="text-sm text-white/60">
                Please allow camera access if prompted
              </p>
            </div>
          )}
        </div>

        <div className="p-6 bg-muted/30 flex flex-col gap-4">
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-border">
            <p className="text-[13px] text-muted-foreground font-semibold text-center leading-relaxed">
              Position the IMEI barcode, serial number, or QR code within the
              frame. It will be detected automatically.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="h-14 rounded-2xl border-border hover:bg-muted font-black uppercase tracking-widest text-xs cursor-pointer"
          >
            Cancel Scanning
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
