"use client";

import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScannerModal } from "@/components/shared/website/ScannerModal";
import { GuestLoginModal } from "@/components/shared/website/GuestLoginModal";
import { toast } from "sonner";
import { extractImeiFromImageApi } from "../api/scanDevice.api";
import { useServices } from "../hooks/useServices";
import { useScanDevice } from "../hooks/useScanDevice";
import { useCertificateDownload } from "../hooks/useCertificateDownload";
import { usePersistedReport } from "../hooks/usePersistedReport";
import { SingleResultView } from "./SingleResultView";
import { FavouriteResultView } from "./FavouriteResultView";
import { ScanHeader } from "./ScanHeader";
import { ServiceSelector } from "./ServiceSelector";
import { ScanInput } from "./ScanInput";
import { ScanButtons } from "./ScanButtons";
import { ScanProgress } from "./ScanProgress";
import { FeaturesGrid } from "./FeaturesGrid";
import { BulkResultView } from "./BulkResultView";

export default function ScanDevice() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryImei = searchParams.get("imei");
  const queryServiceId = searchParams.get("serviceId");

  const {
    serviceCategories,
    selectedService,
    setSelectedService,
    isDropdownOpen,
    setIsDropdownOpen,
  } = useServices(queryServiceId);

  const {
    imei,
    setImei,
    isScanning,
    scanResult,
    favouriteResult,
    batchResult,
    setBatchResult,
    currentStep,
    error,
    singleReportMeta,
    handleScan,
    handleRegenerateScan,
    clearResults,
    showGuestLimitModal,
    setShowGuestLimitModal,
  } = useScanDevice();

  const { isDownloading, downloadCertificatePdf } = useCertificateDownload();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const imeiCount = imei
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0).length;

  usePersistedReport(scanResult, batchResult, 0, singleReportMeta, (state) => {
    if (state.mode === "single" && state.singleResult) {
      // Restore single result
    } else if (state.mode === "bulk" && state.batchResult) {
      setBatchResult(state.batchResult);
    }
  });

  useEffect(() => {
    if (
      queryImei &&
      selectedService &&
      !isScanning &&
      !scanResult &&
      !favouriteResult &&
      !batchResult
    ) {
      handleScan(queryImei, selectedService.serviceId || 6);
    }
  }, [
    queryImei,
    selectedService,
    isScanning,
    scanResult,
    favouriteResult,
    batchResult,
    handleScan,
  ]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      setIsUploadingImage(true);
      const result = await extractImeiFromImageApi(file);
      const imeiNumbers = (result.data?.imeiNumbers ?? [])
        .map((value) => value.replace(/\D/g, ""))
        .filter((value) => value.length >= 14 && value.length <= 16);
      const uniqueImeis = Array.from(new Set(imeiNumbers));

      if (uniqueImeis.length === 0) {
        toast.error("No IMEI found in this image");
        return;
      }

      setImei(uniqueImeis.join("\n"));
      toast.success(
        uniqueImeis.length === 1
          ? "IMEI extracted from image"
          : `${uniqueImeis.length} IMEIs extracted from image`,
      );
    } catch (uploadError) {
      console.error("❌ Image OCR upload failed:", uploadError);
      toast.error("Failed to extract IMEI from image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Favourite result view
  if (favouriteResult) {
    return (
      <FavouriteResultView
        scanResult={favouriteResult}
        imei={imei}
        singleReportMeta={singleReportMeta}
        selectedService={selectedService}
        onBack={clearResults}
        onDownload={() =>
          downloadCertificatePdf(
            ["certificate-pdf-favourite"],
            `Favourite_Certificate_${favouriteResult?.providerResults?.imei || imei}.pdf`,
          )
        }
        isDownloading={isDownloading}
        onRegenerate={() => {
          // Always use IMEI from API response
          const imeiToRegenerate = favouriteResult?.providerResults?.imei;
          if (!imeiToRegenerate) {
            console.error("❌ No IMEI found in favouriteResult");
            return Promise.reject(new Error("IMEI not found"));
          }
          const serviceId =
            singleReportMeta?.serviceId ??
            selectedService?.serviceId ??
            favouriteResult.bundledServiceId ??
            6;
          console.log(
            "🔄 Regenerating favourite with IMEI:",
            imeiToRegenerate,
            "ServiceId:",
            serviceId,
          );
          return handleRegenerateScan(imeiToRegenerate, serviceId, true);
        }}
      />
    );
  }

  // Single result view
  if (scanResult) {
    return (
      <SingleResultView
        scanResult={scanResult}
        singleReportMeta={singleReportMeta}
        selectedService={selectedService}
        onBack={clearResults}
        onDownload={() =>
          downloadCertificatePdf(
            ["certificate-pdf-single"],
            `Certificate_${scanResult.imei}.pdf`,
          )
        }
        isDownloading={isDownloading}
        onRegenerate={(imeiInput: string, serviceId: number) => {
          const imeiToRegenerate = scanResult?.imei || imeiInput;
          console.log("🔄 Regenerating single with IMEI:", imeiToRegenerate);
          return handleRegenerateScan(imeiToRegenerate, serviceId, true);
        }}
      />
    );
  }

  // Bulk result view
  if (batchResult) {
    return (
      <div className="min-h-full p-4 md:p-10 bg-background font-poppins">
        <div className="max-w-6xl mx-auto">
          <BulkResultView
            batchResult={batchResult}
            onClear={() => {
              clearResults();
              router.push("/shopkeeper/scan-device");
            }}
            onDownloadCertificate={downloadCertificatePdf}
            isDownloading={isDownloading}
            onBack={() => {
              clearResults();
              router.push("/shopkeeper/scan-device");
            }}
            onRegenerateItem={(imei, serviceId) => {
              clearResults();
              return handleRegenerateScan(imei, serviceId, true);
            }}
          />
        </div>
      </div>
    );
  }

  // Main form view
  return (
    <div className="min-h-full p-4 md:p-10 bg-background space-y-12 mx-auto font-poppins">
      <div className="max-w-6xl mx-auto">
        <ScanHeader />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-card rounded-[40px] p-6 md:p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-border"
        >
          <div className="space-y-8">
            <ServiceSelector
              serviceCategories={serviceCategories}
              selectedService={selectedService}
              setSelectedService={setSelectedService}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
              disabled={isScanning}
            />

            <ScanInput
              imei={imei}
              setImei={setImei}
              onScanClick={() => setIsScannerOpen(true)}
              disabled={isScanning}
            />

            <ScanButtons
              onScan={() => {
                console.log("🔍 Button clicked, IMEI value:", imei);
                handleScan(imei, selectedService?.serviceId || 6);
              }}
              onImageUpload={handleImageUpload}
              isScanning={isScanning}
              isUploadingImage={isUploadingImage}
              isDisabled={isScanning || !imei || !selectedService}
              imeiCount={imeiCount}
            />

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold text-center">
                {error}
              </div>
            )}

            <ScanProgress isScanning={isScanning} currentStep={currentStep} />
          </div>
        </motion.div>

        {!isScanning && <FeaturesGrid />}
      </div>

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(scannedImei) => {
          setImei(scannedImei);
        }}
      />

      <GuestLoginModal
        isOpen={showGuestLimitModal}
        onClose={() => setShowGuestLimitModal(false)}
        title="Report Limit Reached"
        message="You have reached the limit of 2 free report generations per device. Please log in or create an account to get unlimited access."
        badge="Create a free account to continue checking IMEI details."
      />
    </div>
  );
}
