/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Loader2,
  Receipt,
  Copy,
  RefreshCw,
  Clock,
  Shield,
} from "lucide-react";
import { IMEIResult } from "../../scanDevice/types/scanDevice.types";
import { CertificatePDF } from "./CertificatePDF";
import { InvoiceModal, InvoiceFormData } from "./InvoiceModal";
import { useCertificateDownload } from "../hooks/useCertificateDownload";
import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { SmartInvoicePDF } from "./SmartInvoicePDF";
import { toast } from "sonner";
import Image from "next/image";

interface SingleResultViewProps {
  scanResult: IMEIResult;
  singleReportMeta: { provider?: string; serviceId?: number } | null;
  selectedService?: { name?: string; serviceId?: number | null } | null;
  onBack: () => void;
  onRegenerate?: (imei: string, serviceId: number) => Promise<void>;
  onDownload?: () => Promise<void> | void;
  isDownloading?: boolean;
}

// Constants
const DEFAULT_SERVICE_ID = 6;
const RISK_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 60,
};

// Helper functions
const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr || dateStr === "N/A") return "N/A";

  try {
    // Handle DD/MM/YY format
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
      const [day, month, year] = dateStr.split("/");
      const date = new Date(
        2000 + parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
      );
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    // Handle YYYY-MM-DD format
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    // Handle date already formatted
    if (dateStr.match(/^[A-Za-z]+ \d{1,2}, \d{4}$/)) {
      return dateStr;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const getRiskColor = (score: number): string => {
  if (score <= RISK_THRESHOLDS.LOW) return "bg-emerald-500";
  if (score <= RISK_THRESHOLDS.MEDIUM) return "bg-amber-500";
  return "bg-red-500";
};

const getRiskTextColor = (score: number): string => {
  if (score <= RISK_THRESHOLDS.LOW) return "text-emerald-600";
  if (score <= RISK_THRESHOLDS.MEDIUM) return "text-amber-600";
  return "text-red-600";
};

const getRiskBadgeColor = (score: number): string => {
  if (score <= RISK_THRESHOLDS.LOW) return "bg-emerald-100 text-emerald-700";
  if (score <= RISK_THRESHOLDS.MEDIUM) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
};

interface ExtractedDeviceData {
  deviceName: string;
  imeiValue: string;
  imei2Value: string;
  meidValue: string;
  serialNumber: string;
  eidNumber: string;
  warrantyStatus: string;
  purchaseDate: string;
  coverageEndDate: string;
  notice: string;
  replacedDevice: string;
  activationStatus: string;
  coverageBenefits: string;
  registrationStatus: string;
  tempCoverage: string;
  openRepair: string;
  serialKey: string;
  iCloudLock: string;
  iCloudStatus: string;
  mdmLock: string;
  unlockStatus: string;
  simlockStatus: string;
  carrierName: string;
  productDescription: string;
  modelNumber: string;
  partNumber: string;
  capacity: string;
  color: string;
  hasError: boolean;
  errorMessage: string;
  isEmpty: boolean;
  riskScore: number;
  riskLevel: string;
  image: string | null;
  parsedProviderData: any;
  rawData: any;
  aiInsight: any;
  provider: string | null;
  oldGenerated: boolean;
}

const extractDeviceData = (scanResult: IMEIResult): ExtractedDeviceData => {
  // Get the raw data from various possible structures
  const resultData = (scanResult as any).data || scanResult;
  const rawData = resultData?.data || resultData;

  // Handle array response (sometimes data is array)
  const actualData =
    Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
  const mainData = actualData?.data || actualData;

  const parsedProviderData = mainData?.parsedProviderData || {};
  const riskMeterData = mainData?.riskMeter || scanResult?.riskMeter || {};

  // Extract provider
  const provider = mainData?.provider || parsedProviderData?.provider || null;

  // Check if old generated
  const oldGenerated =
    mainData?.oldGenerated === true || actualData?.oldGenerated === true;

  // Handle different riskMeter formats (object, number, or undefined)
  let riskScore = 0;
  let riskLevel = "N/A";

  if (typeof riskMeterData === "number") {
    riskScore = riskMeterData;
    riskLevel =
      riskScore <= RISK_THRESHOLDS.LOW
        ? "low"
        : riskScore <= RISK_THRESHOLDS.MEDIUM
          ? "medium"
          : "high";
  } else if (typeof riskMeterData === "object" && riskMeterData !== null) {
    riskScore = riskMeterData.score || riskMeterData.riskMeter || 0;
    riskLevel =
      riskMeterData.riskLevel ||
      (riskScore <= RISK_THRESHOLDS.LOW
        ? "low"
        : riskScore <= RISK_THRESHOLDS.MEDIUM
          ? "medium"
          : "high");
  }

  // Extract device name from various possible fields
  const deviceName =
    parsedProviderData.device ||
    parsedProviderData.model_name ||
    parsedProviderData.model ||
    parsedProviderData.marketing_name ||
    parsedProviderData.product_description?.split(",")[0] ||
    parsedProviderData.device_configuration?.split(" ")[0] ||
    scanResult.deviceName ||
    "iPhone";

  // Extract IMEI
  const imeiValue =
    parsedProviderData.imei_number ||
    parsedProviderData.imei ||
    parsedProviderData.deviceid ||
    scanResult.imei ||
    "";

  // Extract IMEI2
  const imei2Value =
    parsedProviderData.imei2_number ||
    parsedProviderData.imei2 ||
    parsedProviderData.imei_2 ||
    "";

  // Extract MEID
  const meidValue =
    parsedProviderData.meid_number || parsedProviderData.meid || "";

  // Extract Serial Number
  const serialNumber =
    parsedProviderData.serial_number ||
    parsedProviderData.serial ||
    parsedProviderData.sn ||
    "N/A";

  // Extract EID
  const eidNumber =
    parsedProviderData.eid || parsedProviderData.csncsn2eid || "N/A";

  // Extract Warranty Status
  let warrantyStatus =
    parsedProviderData.warranty_type ||
    parsedProviderData.warranty_status ||
    "N/A";
  if (parsedProviderData.warranty_status_code === "LP")
    warrantyStatus = "Limited Warranty";
  if (parsedProviderData.applecare_covered === "Yes")
    warrantyStatus = "AppleCare+";

  // Extract Purchase Date
  let purchaseDate =
    parsedProviderData.estimated_purchase_date ||
    parsedProviderData.purchase_date ||
    "N/A";
  if (parsedProviderData.estimated_purchase_date === "2026-05-06")
    purchaseDate = formatDate("May 6, 2026");

  // Extract Coverage End Date
  let coverageEndDate =
    parsedProviderData.warranty_expires ||
    parsedProviderData.coverage_end_date ||
    "N/A";
  if (parsedProviderData.repairs_and_service_expiration_date)
    coverageEndDate = parsedProviderData.repairs_and_service_expiration_date;

  // Extract Notice
  const notice = parsedProviderData.notice || "";

  // Extract Replaced Device
  const replacedDevice =
    parsedProviderData.replaced_device === "Yes" ? "Yes" : "No";

  // Extract Activation Status
  const activationStatus =
    parsedProviderData.activation_status ||
    (parsedProviderData.device_activation === "No"
      ? "Not Activated"
      : "Activated") ||
    "Activated";

  // Extract Coverage Benefits
  const coverageBenefits =
    parsedProviderData.coverage_benefits ||
    parsedProviderData.applecare_description ||
    "";

  // Extract Registration Status
  let registrationStatus = parsedProviderData.registration_status || "";
  if (registrationStatus === "Yes") registrationStatus = "Registered";
  if (parsedProviderData.icloud_status === "CLEAN")
    registrationStatus = "Clean";

  // Extract Temp Coverage
  const tempCoverage =
    parsedProviderData.temp_coverage === "Yes" ? "Yes" : "No";

  // Extract Open Repair
  const openRepair = parsedProviderData.open_repair === "Yes" ? "Yes" : "No";

  // Extract Serial Key
  const serialKey = parsedProviderData.serial_key || "";

  // Extract iCloud Status
  let iCloudLock = "N/A";
  if (parsedProviderData.icloud_lock === "ON") iCloudLock = "Locked";
  if (parsedProviderData.icloud_lock === "OFF") iCloudLock = "Unlocked";

  const iCloudStatus = parsedProviderData.icloud_status || "N/A";

  // Extract MDM Lock
  let mdmLock = "N/A";
  if (parsedProviderData.mdm_lock === "ON") mdmLock = "Locked";
  if (parsedProviderData.mdm_lock === "OFF") mdmLock = "Unlocked";

  // Extract Unlock Status (SIM Policy)
  let unlockStatus = "N/A";
  if (parsedProviderData.simpolicy_unlock_status) {
    unlockStatus = parsedProviderData.simpolicy_unlock_status;
  } else if (
    parsedProviderData.initial_activation_policy_description?.includes("UNLOCK")
  ) {
    unlockStatus = "UNLOCKED";
  } else if (
    parsedProviderData.last_activation_policy_description?.includes("UNLOCK")
  ) {
    unlockStatus = "UNLOCKED";
  } else if (parsedProviderData.simlock_status === "Unlocked") {
    unlockStatus = "UNLOCKED";
  } else if (parsedProviderData.locked_carrier === "10 - Unlock") {
    unlockStatus = "UNLOCKED";
  }

  // Extract SIM Lock Status
  const simlockStatus = parsedProviderData.simlock_status || "N/A";

  // Extract Carrier Name
  const carrierName = parsedProviderData.carrier_name || "N/A";

  // Extract Product Description
  const productDescription =
    parsedProviderData.product_description ||
    parsedProviderData.config_description ||
    "";

  // Extract Model Number
  const modelNumber =
    parsedProviderData.model_number ||
    parsedProviderData.basic_material ||
    "N/A";

  // Extract Part Number
  const partNumber =
    parsedProviderData.part_number ||
    parsedProviderData.material_number ||
    "N/A";

  // Extract Capacity
  let capacity = parsedProviderData.capacity || "";
  if (productDescription.includes("256GB")) capacity = "256GB";
  if (productDescription.includes("128GB")) capacity = "128GB";
  if (productDescription.includes("512GB")) capacity = "512GB";
  if (productDescription.includes("1TB")) capacity = "1TB";

  // Extract Color
  let color = "";
  if (productDescription.includes("DBLUE")) color = "Deep Blue";
  if (productDescription.includes("BLU")) color = "Blue";
  if (productDescription.includes("BLACK")) color = "Black";
  if (productDescription.includes("WHITE")) color = "White";
  if (productDescription.includes("GOLD")) color = "Gold";
  if (productDescription.includes("PURPLE")) color = "Purple";

  // Check if there's an error
  const hasError =
    !!parsedProviderData.error_r01 || !!parsedProviderData.failed_reason;
  const errorMessage =
    parsedProviderData.error_r01 || parsedProviderData.failed_reason || "";

  // Check if data is empty
  const isEmpty = Object.keys(parsedProviderData).length === 0;

  // Extract image
  const image = parsedProviderData.image?.src || null;

  // Extract AI Insight
  const aiInsight = mainData?.aiInsight || null;

  return {
    deviceName,
    imeiValue,
    imei2Value,
    meidValue,
    serialNumber,
    eidNumber,
    warrantyStatus,
    purchaseDate,
    coverageEndDate,
    notice,
    replacedDevice,
    activationStatus,
    coverageBenefits,
    registrationStatus,
    tempCoverage,
    openRepair,
    serialKey,
    iCloudLock,
    iCloudStatus,
    mdmLock,
    unlockStatus,
    simlockStatus,
    carrierName,
    productDescription,
    modelNumber,
    partNumber,
    capacity,
    color,
    hasError,
    errorMessage,
    isEmpty,
    riskScore,
    riskLevel,
    image,
    parsedProviderData,
    rawData: mainData,
    aiInsight,
    provider,
    oldGenerated,
  };
};

export const SingleResultView = ({
  scanResult,
  singleReportMeta,
  selectedService,
  onBack,
  onRegenerate,
  onDownload,
  isDownloading: parentIsDownloading,
}: SingleResultViewProps) => {
  const { status } = useSession();
  const isGuest = status === "unauthenticated";
  const { downloadCertificatePdf } = useCertificateDownload();

  const [isCertificateDownloading, setIsCertificateDownloading] =
    useState(false);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceFormData, setInvoiceFormData] =
    useState<InvoiceFormData | null>(null);
  const [isInvoiceGenerating, setIsInvoiceGenerating] = useState(false);

  // Extract data with useMemo for performance
  const extractedData = useMemo(
    () => extractDeviceData(scanResult),
    [scanResult],
  );

  const {
    deviceName,
    imeiValue,
    imei2Value,
    meidValue,
    serialNumber,
    eidNumber,
    warrantyStatus,
    purchaseDate,
    coverageEndDate,
    notice,
    replacedDevice,
    activationStatus,
    coverageBenefits,
    registrationStatus,
    tempCoverage,
    openRepair,
    serialKey,
    iCloudLock,
    iCloudStatus,
    mdmLock,
    unlockStatus,
    simlockStatus,
    carrierName,
    productDescription,
    modelNumber,
    partNumber,
    capacity,
    color,
    hasError,
    errorMessage,
    isEmpty,
    riskScore,
    riskLevel,
    image,
    aiInsight,
    provider,
    oldGenerated,
  } = extractedData;

  // Generate copy text dynamically
  const generateCopyText = useCallback(() => {
    const fields: { label: string; value: string; condition?: boolean }[] = [
      { label: "Model", value: deviceName },
      { label: "IMEI", value: imeiValue },
      {
        label: "IMEI2",
        value: imei2Value,
        condition: Boolean(imei2Value && imei2Value !== "N/A"),
      },
      {
        label: "MEID",
        value: meidValue,
        condition: Boolean(meidValue && meidValue !== "N/A"),
      },
      { label: "Serial Number", value: serialNumber },
      {
        label: "EID",
        value: eidNumber,
        condition: Boolean(eidNumber && eidNumber !== "N/A"),
      },
      { label: "Capacity", value: capacity, condition: Boolean(capacity) },
      { label: "Color", value: color, condition: Boolean(color) },
      {
        label: "Model Number",
        value: modelNumber,
        condition: modelNumber !== "N/A",
      },
      {
        label: "Part Number",
        value: partNumber,
        condition: partNumber !== "N/A",
      },
      { label: "Activation Status", value: activationStatus },
      { label: "Warranty Type", value: warrantyStatus },
      { label: "Warranty Expires", value: formatDate(coverageEndDate) },
      { label: "Estimated Purchase Date", value: formatDate(purchaseDate) },
      {
        label: "Coverage Benefits",
        value: coverageBenefits,
        condition: Boolean(coverageBenefits),
      },
      {
        label: "Registration Status",
        value: registrationStatus,
        condition: Boolean(registrationStatus),
      },
      { label: "Replaced Device", value: replacedDevice },
      {
        label: "iCloud Lock",
        value: iCloudLock,
        condition: iCloudLock !== "N/A",
      },
      {
        label: "iCloud Status",
        value: iCloudStatus,
        condition: iCloudStatus !== "N/A",
      },
      { label: "MDM Lock", value: mdmLock, condition: mdmLock !== "N/A" },
      {
        label: "Unlock Status",
        value: unlockStatus,
        condition: unlockStatus !== "N/A",
      },
      {
        label: "SIM Lock Status",
        value: simlockStatus,
        condition: simlockStatus !== "N/A",
      },
      {
        label: "Carrier",
        value: carrierName,
        condition: carrierName !== "N/A",
      },
      {
        label: "Temp Coverage",
        value: tempCoverage,
        condition: tempCoverage === "Yes",
      },
      {
        label: "Open Repair",
        value: openRepair,
        condition: openRepair === "Yes",
      },
      { label: "Notice", value: notice, condition: Boolean(notice) },
      { label: "Serial Key", value: serialKey, condition: Boolean(serialKey) },
      { label: "Risk Level", value: riskLevel.toUpperCase() },
      { label: "Risk Score", value: `${riskScore}/100` },
    ];

    if (aiInsight?.message) {
      fields.push({ label: "AI Insight", value: aiInsight.message });
    }

    return fields
      .filter(
        (field) =>
          field.condition !== false && field.value && field.value !== "N/A",
      )
      .map((field) => `${field.label}: ${field.value}`)
      .join("\n");
  }, [
    deviceName,
    imeiValue,
    imei2Value,
    meidValue,
    serialNumber,
    eidNumber,
    capacity,
    color,
    modelNumber,
    partNumber,
    activationStatus,
    warrantyStatus,
    coverageEndDate,
    purchaseDate,
    coverageBenefits,
    registrationStatus,
    replacedDevice,
    iCloudLock,
    iCloudStatus,
    mdmLock,
    unlockStatus,
    simlockStatus,
    carrierName,
    tempCoverage,
    openRepair,
    notice,
    serialKey,
    riskLevel,
    riskScore,
    aiInsight,
  ]);

  const handleCopyToClipboard = useCallback(() => {
    const text = generateCopyText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [generateCopyText]);

  const handleDownloadCertificate = async () => {
    if (onDownload) {
      await onDownload();
    } else {
      setIsCertificateDownloading(true);
      try {
        await downloadCertificatePdf(
          ["certificate-pdf-single"],
          `Certificate_${scanResult.imei}.pdf`,
        );
        toast.success("Certificate downloaded successfully!");
      } catch (error) {
        console.error("Certificate download failed:", error);
        toast.error("Failed to download certificate");
      } finally {
        setIsCertificateDownloading(false);
      }
    }
  };

  const handleGenerateInvoice = async (formData: InvoiceFormData) => {
    setIsInvoiceGenerating(true);
    setInvoiceFormData(formData);
    setIsInvoiceModalOpen(false);

    try {
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
      await downloadCertificatePdf(
        ["smart-invoice-pdf-container"],
        `Invoice_${scanResult.imei}.pdf`,
      );
      toast.success("Invoice generated successfully!");
    } catch (error) {
      console.error("Invoice generation failed:", error);
      toast.error("Failed to generate invoice");
    } finally {
      setIsInvoiceGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) {
      toast.error(
        "Regenerate function not available. Please refresh the page and try again.",
      );
      return;
    }

    const serviceId = selectedService?.serviceId ?? DEFAULT_SERVICE_ID;
    const currentImei = scanResult?.imei;

    if (!currentImei || !/^\d{15}$/.test(currentImei)) {
      toast.error(`Valid IMEI not found. Found: "${currentImei}"`);
      return;
    }

    setIsRegenerating(true);
    try {
      await onRegenerate(currentImei, serviceId);
      toast.success("Report regenerated successfully!");
    } catch (error: any) {
      console.error("Regenerate error:", error);
      toast.error(error.message || "Failed to regenerate report");
    } finally {
      setIsRegenerating(false);
    }
  };

  const isDownloadingNow = parentIsDownloading || isCertificateDownloading;

  // Show error or empty state
  if (hasError || isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-4 transition"
          >
            <ArrowLeft size={18} />
            Back to scan
          </button>

          <div className="bg-white border border-slate-200 rounded-[32px] p-8 text-center">
            <div className="text-slate-400 text-6xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              {hasError ? "Unable to Retrieve Data" : "No Data Available"}
            </h3>
            <p className="text-slate-500">
              {hasError && errorMessage
                ? errorMessage
                : hasError
                  ? "Could not fetch device information from the service provider"
                  : "No device information available from this service"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-4 transition"
        >
          <ArrowLeft size={18} />
          Back to scan
        </button>

        {/* Provider Badge */}
        {provider && (
          <div className="mb-3 flex justify-end">
            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
              Provider: {provider === "sickw" ? "Sickw" : "Apple Official"}
            </span>
          </div>
        )}

        {/* Regenerate Warning - only show for cached data */}
        {oldGenerated === true && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-[32px] p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Cached Data Notice
                </p>
                <p className="text-xs text-amber-700">
                  This data is from a previous report. Click &quot;Generate
                  New&quot; for the latest information.
                </p>
              </div>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 flex-shrink-0 transition"
            >
              {isRegenerating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {isRegenerating ? "Generating..." : "Generate New"}
            </button>
          </motion.div>
        )}

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-5 shadow-sm relative">
          <div className="space-y-3 text-center text-[14px] text-[#5F6368] leading-relaxed">
            {/* Device Image if available */}
            {image && (
              <div className="flex justify-center mb-2">
                <img
                  src={image}
                  alt="Device"
                  className="h-20 w-auto object-contain"
                />
              </div>
            )}

            {/* Device Name with Capacity & Color */}
            <p>
              <span className="font-semibold">Model:</span> {deviceName}
              {capacity && ` ${capacity}`}
              {color && ` ${color}`}
            </p>

            {/* Product Description (if available) */}
            {productDescription && productDescription !== deviceName && (
              <p className="text-xs text-slate-400">{productDescription}</p>
            )}

            <p>
              <span className="font-semibold">IMEI:</span> {imeiValue}
            </p>

            {imei2Value && imei2Value !== "N/A" && (
              <p>
                <span className="font-semibold">IMEI2:</span> {imei2Value}
              </p>
            )}

            {meidValue && meidValue !== "N/A" && (
              <p>
                <span className="font-semibold">MEID:</span> {meidValue}
              </p>
            )}

            <p>
              <span className="font-semibold">Serial Number:</span>{" "}
              {serialNumber}
            </p>

            {serialKey && serialKey !== "N/A" && (
              <p>
                <span className="font-semibold">Serial Key:</span> {serialKey}
              </p>
            )}

            {modelNumber !== "N/A" && (
              <p>
                <span className="font-semibold">Model Number:</span>{" "}
                {modelNumber}
              </p>
            )}

            {partNumber !== "N/A" && (
              <p>
                <span className="font-semibold">Part Number:</span> {partNumber}
              </p>
            )}

            {eidNumber && eidNumber !== "N/A" && (
              <p className="break-all">
                <span className="font-semibold">EID:</span> {eidNumber}
              </p>
            )}

            {/* SIM/Network Info */}
            {carrierName !== "N/A" && (
              <p>
                <span className="font-semibold">Carrier:</span> {carrierName}
              </p>
            )}

            {unlockStatus !== "N/A" && (
              <p>
                <span className="font-semibold">Unlock Status:</span>{" "}
                <span
                  className={
                    unlockStatus === "UNLOCKED"
                      ? "text-green-600"
                      : "text-amber-600"
                  }
                >
                  {unlockStatus}
                </span>
              </p>
            )}

            {simlockStatus !== "N/A" && (
              <p>
                <span className="font-semibold">SIM Lock:</span> {simlockStatus}
              </p>
            )}

            {/* Security/Lock Status */}
            {iCloudLock !== "N/A" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">iCloud Lock:</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    iCloudLock === "Unlocked"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {iCloudLock === "Unlocked" ? "🔓 UNLOCKED" : "🔒 LOCKED"}
                </span>
              </div>
            )}

            {iCloudStatus !== "N/A" && iCloudStatus !== "Not Found" && (
              <p>
                <span className="font-semibold">iCloud Status:</span>{" "}
                {iCloudStatus}
              </p>
            )}

            {mdmLock !== "N/A" && (
              <p>
                <span className="font-semibold">MDM Lock:</span>{" "}
                <span
                  className={
                    mdmLock === "Unlocked" ? "text-green-600" : "text-red-600"
                  }
                >
                  {mdmLock}
                </span>
              </p>
            )}

            {/* Activation Status */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="font-semibold">Activation:</span>
              <span
                className={`${
                  activationStatus === "Activated"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                } px-2 py-0.5 rounded-md text-[10px] font-bold`}
              >
                {activationStatus === "Activated"
                  ? "✓ ACTIVATED"
                  : activationStatus.toUpperCase()}
              </span>
            </div>

            {/* Warranty Section */}
            <p>
              <span className="font-semibold">Warranty:</span> {warrantyStatus}
            </p>

            {purchaseDate !== "N/A" && (
              <p>
                <span className="font-semibold">Purchase Date:</span>{" "}
                {formatDate(purchaseDate)}
              </p>
            )}

            {coverageEndDate !== "N/A" && (
              <p>
                <span className="font-semibold">Coverage End:</span>{" "}
                {formatDate(coverageEndDate)}
              </p>
            )}

            {coverageBenefits && coverageBenefits !== "N/A" && (
              <p>
                <span className="font-semibold">Coverage Benefits:</span>{" "}
                {coverageBenefits}
              </p>
            )}

            {/* Registration Status */}
            {registrationStatus && registrationStatus !== "N/A" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">Registration:</span>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  {registrationStatus.toUpperCase()}
                </span>
              </div>
            )}

            {/* Notices */}
            {notice && (
              <p className="text-amber-600 text-xs">
                <span className="font-semibold">Notice:</span> {notice}
              </p>
            )}

            {/* Status Flags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="font-semibold">Replaced Device:</span>
              <span
                className={`${
                  replacedDevice === "No"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                } px-2 py-0.5 rounded-md text-[10px] font-bold uppercase`}
              >
                {replacedDevice === "No" ? "✓ NO" : "⚠ YES"}
              </span>
            </div>

            {tempCoverage === "Yes" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">Temp Coverage:</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  {tempCoverage}
                </span>
              </div>
            )}

            {openRepair === "Yes" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">Open Repair:</span>
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  ⚠ OPEN REPAIR
                </span>
              </div>
            )}

            {/* Risk Meter Section */}
            <div className="border-t border-slate-100 pt-3 mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Risk Level:</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getRiskBadgeColor(riskScore)}`}
                >
                  {riskLevel.toUpperCase()} RISK
                </span>
              </div>
              <div>
                <span className="font-semibold">Risk Score:</span> {riskScore}
                /100
              </div>
              <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getRiskColor(riskScore)}`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
            </div>

            {/* AI Insight Section */}
            {aiInsight && aiInsight.message && (
              <div className="border-t border-slate-100 pt-3 mt-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Shield size={14} className="text-indigo-500" />
                  <p className="font-semibold text-indigo-600">
                    {aiInsight.title || "AI INSIGHT"}
                  </p>
                </div>
                <p className="text-sm italic text-slate-600">
                  {aiInsight.message}
                </p>
              </div>
            )}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyToClipboard}
            className="absolute bottom-4 right-4 text-slate-300 hover:text-slate-500 transition"
            title="Copy to clipboard"
          >
            <Copy size={22} />
          </button>

          {/* Copied Notification */}
          {copied && (
            <div className="absolute top-3 right-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-full animate-pulse">
              Copied!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isGuest && (
          <div className="mt-4 flex gap-2 flex-col sm:flex-row">
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              disabled={isInvoiceGenerating}
              className="flex-1 py-2.5 px-4 rounded-xl border-2 border-[#84CC16] text-[#84CC16] font-bold text-sm flex items-center justify-center gap-2 hover:bg-lime-50 transition disabled:opacity-50"
            >
              {isInvoiceGenerating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Receipt size={14} />
              )}
              Create Smart Invoice
            </button>
            <button
              onClick={handleDownloadCertificate}
              disabled={isDownloadingNow}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#84CC16] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 disabled:opacity-50"
            >
              {isDownloadingNow ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {isDownloadingNow ? "Generating..." : "Download PDF Certificate"}
            </button>
          </div>
        )}
      </div>

      {/* Hidden PDF Containers */}
      <div className="fixed top-0 left-[-10000px] w-[1100px] pointer-events-none z-0">
        <CertificatePDF
          data={scanResult}
          id="certificate-pdf-single"
          providerName={singleReportMeta?.provider || selectedService?.name}
          serviceId={
            singleReportMeta?.serviceId ??
            selectedService?.serviceId ??
            undefined
          }
        />
        {invoiceFormData && (
          <SmartInvoicePDF
            data={scanResult}
            id="smart-invoice-pdf-container"
            invoiceData={invoiceFormData}
          />
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onGenerate={handleGenerateInvoice}
        scanResult={scanResult}
        isGenerating={isInvoiceGenerating}
      />
    </div>
  );
};
