/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Loader2,
  Smartphone,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Cpu,
  CreditCard,
  Globe,
  Gauge,
  Database,
  Tag,
  Shield,
  Receipt,
  Check,
  Wallet,
  Copy,
  RefreshCw,
  Clock,
} from "lucide-react";
import { IMEIResult } from "../../scanDevice/types/scanDevice.types";
import { CertificatePDF } from "./CertificatePDF";
import {
  getChecksArray,
  getStatusColor,
  getTechnicalBreakdownItems,
} from "@/utils/resultHelpers";
import { InvoiceModal, InvoiceFormData } from "./InvoiceModal";
import { useCertificateDownload } from "../hooks/useCertificateDownload";
import { useState } from "react";
import { SmartInvoicePDF } from "./SmartInvoicePDF";

interface SingleResultViewProps {
  scanResult: IMEIResult;
  singleReportMeta: { provider?: string; serviceId?: number } | null;
  selectedService?: { name?: string; serviceId?: number | null } | null;
  onBack: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  onRegenerate?: () => Promise<void> | void;
}

const getRiskLabel = (score: number) => {
  if (score <= 25)
    return {
      label: "Low Risk",
      color: "bg-emerald-500",
      text: "text-emerald-500",
    };
  if (score <= 60)
    return {
      label: "Moderate Risk",
      color: "bg-amber-500",
      text: "text-amber-500",
    };
  return { label: "High Risk", color: "bg-red-500", text: "text-red-500" };
};

const parseProviderRows = (
  html: string,
): { label: string; value: string }[] => {
  if (!html) return [];
  const cleanText = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(font|span|b|strong|i|em)[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim();
  const rows: { label: string; value: string }[] = [];
  const lines = cleanText.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex > 0) {
      const label = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      rows.push({ label, value });
    } else {
      rows.push({ label: "Info", value: trimmed });
    }
  }
  return rows;
};

export const SingleResultView = ({
  scanResult,
  singleReportMeta,
  selectedService,
  onBack,
  onDownload,
  isDownloading: parentIsDownloading,
  onRegenerate,
}: SingleResultViewProps) => {
  const checksArray = getChecksArray(scanResult);
  const technicalItems = getTechnicalBreakdownItems(scanResult);
  const riskScore = scanResult.riskMeter?.score || 0;
  const riskInfo = getRiskLabel(riskScore);
  const { downloadCertificatePdf, isDownloading: hookIsDownloading } =
    useCertificateDownload();

  const [isCertificateDownloading, setIsCertificateDownloading] =
    useState(false);
  const [isInvoiceDownloading, setIsInvoiceDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceFormData, setInvoiceFormData] =
    useState<InvoiceFormData | null>(null);
  const [isInvoiceGenerating, setIsInvoiceGenerating] = useState(false);

  const providerData = scanResult.providerData as
    | {
        result?: string;
        imei?: string;
        balance?: number;
        price?: string;
        id?: number;
        status?: string;
        ip?: string;
      }
    | undefined;

  const parsedData = (scanResult as any).parsedProviderData || {};
  const hasParsedData = Object.keys(parsedData).length > 0;

  const providerHTML = providerData?.result || "";

  const providerRows = hasParsedData
    ? Object.entries(parsedData).map(([label, value]) => ({
        label,
        value: String(value),
      }))
    : parseProviderRows(providerHTML);

  const providerDataMap: Record<string, string> = {};
  if (hasParsedData) {
    Object.entries(parsedData).forEach(([k, v]) => {
      providerDataMap[k] = String(v);
    });
  } else {
    providerRows.forEach((row) => {
      providerDataMap[row.label] = row.value;
    });
  }

  const normalizedDataMap: Record<string, string> = {};
  Object.entries(providerDataMap).forEach(([k, v]) => {
    const normKey = k
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    normalizedDataMap[normKey] = v;
  });

  const getNormalizedValue = (
    possibleKeys: string[],
    defaultValue = "",
  ): string => {
    for (const key of possibleKeys) {
      const normalizedKey = key
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      if (normalizedDataMap[normalizedKey] !== undefined) {
        return normalizedDataMap[normalizedKey];
      }
    }
    return defaultValue;
  };

  const deviceNameFromProvider =
    getNormalizedValue(["Device", "Model", "marketing_name", "model_name"]) ||
    scanResult.deviceName;
  const imeiValue =
    getNormalizedValue(["IMEI Number", "IMEI", "imei"]) || scanResult.imei;
  const imei2Value = getNormalizedValue([
    "IMEI 2",
    "IMEI2 Number",
    "imei2",
    "imei_2",
  ]);
  const serialNumber = getNormalizedValue(
    ["Serial Number", "serial_number"],
    "N/A",
  );
  const eidNumber = getNormalizedValue(["EID", "eid"], "N/A");
  const warrantyExpiry = getNormalizedValue(
    ["Warranty Expires", "coverage_end_date", "warranty_expires"],
    "N/A",
  );
  const purchaseDate = getNormalizedValue(
    ["Estimated Purchase Date", "purchase_date", "estimated_purchase_date"],
    "N/A",
  );
  const coverageEndDate =
    getNormalizedValue(["Coverage End Date", "coverage_end_date"]) ||
    warrantyExpiry;
  const warrantyStatus = getNormalizedValue(
    ["Warranty Type", "warranty_status", "warranty_type"],
    "Apple Limited Warranty",
  );
  const replacedDevice = getNormalizedValue(
    ["Replaced Device", "replaced_device"],
    "No",
  );
  const lockedCarrier = getNormalizedValue(
    ["Locked Carrier", "locked_carrier"],
    "Unlock",
  );
  const notice = getNormalizedValue(["Notice", "notice"], "");

  const isOldGenerated = (scanResult as any).oldGenerated === true;

  const isBlacklistClean =
    scanResult.checks?.globalBlacklist?.status === "passed" ||
    getNormalizedValue([
      "Blacklist Status",
      "blacklist_status",
    ]).toLowerCase() === "clean";

  const financeValue = getNormalizedValue([
    "Financing Status",
    "financing_status",
  ]);
  const isFinancingClean =
    scanResult.checks?.carrierFinancing?.status === "passed" ||
    financeValue.toLowerCase() === "clean" ||
    getNormalizedValue([
      "Financial Status",
      "financial_status",
    ]).toLowerCase() === "clean" ||
    !financeValue ||
    financeValue === "N/A";

  const isHardwareClean =
    scanResult.checks?.hardwareLock?.status === "passed" ||
    getNormalizedValue(["Find My iPhone", "find_my_iphone"]).toLowerCase() ===
      "off" ||
    getNormalizedValue(["iCloud Lock", "icloud_lock"]).toLowerCase() === "off";

  const isPartAuthentic =
    scanResult.checks?.partAuthenticity?.status === "passed" || true;

  const isSimUnlocked =
    scanResult.checks?.hardwareLock?.status === "passed" ||
    getNormalizedValue(["SIM Lock", "sim_lock", "simlock"]).toLowerCase() ===
      "unlocked";

  const isICloudUnlocked = isHardwareClean;

  const extractMarketValue = () => {
    if (scanResult.marketValue?.amount) {
      return scanResult.marketValue.amount;
    }
    const descriptionText = getNormalizedValue(["Description", "description"]);
    const descMatch = descriptionText.match(/\$?(\d+(?:\.\d{2})?)/);
    if (descMatch) return parseFloat(descMatch[1]);

    const configText = getNormalizedValue([
      "Device Configuration",
      "device_configuration",
    ]);
    const configMatch = configText.match(/(\d+)GB/);
    if (configMatch) {
      const storage = parseInt(configMatch[1]);
      if (storage === 256) return 899;
      if (storage === 512) return 1099;
      if (storage === 1024) return 1299;
      return 699;
    }

    return 0;
  };

  const marketValue = extractMarketValue();

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "N/A") return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const displayValue = (value: unknown): string => {
    if (value === undefined || value === null || value === "") return "N/A";
    if (Array.isArray(value))
      return value.map((v) => displayValue(v)).join(", ");
    if (typeof value === "object") {
      const obj = value as Record<string, unknown>;
      // If it looks like an image object, return the src
      if (obj.src && typeof obj.src === "string") return obj.src;
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Check if a value is an image object
  const isImageObject = (
    value: unknown,
  ): value is { src: string; height?: number; html?: string } => {
    if (typeof value !== "object" || value === null) return false;
    const obj = value as Record<string, unknown>;
    return typeof obj.src === "string" && obj.src.length > 0;
  };

  // Render a provider field value — returns a React-renderable string or JSX info
  const renderFieldValue = (
    value: unknown,
  ): { isImage: boolean; src?: string; text?: string } => {
    if (isImageObject(value)) {
      return { isImage: true, src: (value as { src: string }).src };
    }
    return { isImage: false, text: displayValue(value) };
  };

  const certificateElementId = "certificate-pdf-single";
  const invoiceElementId = "smart-invoice-pdf-container";

  const handleDownloadCertificate = async () => {
    setIsCertificateDownloading(true);
    try {
      await downloadCertificatePdf(
        [certificateElementId],
        `Certificate_${scanResult.imei}.pdf`,
      );
    } catch (error) {
      console.error("Certificate download failed:", error);
    } finally {
      setIsCertificateDownloading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoiceFormData) {
      setIsInvoiceModalOpen(true);
      return;
    }
    setIsInvoiceDownloading(true);
    try {
      await downloadCertificatePdf(
        [invoiceElementId],
        `Invoice_${scanResult.imei}.pdf`,
      );
    } catch (error) {
      console.error("Invoice download failed:", error);
    } finally {
      setIsInvoiceDownloading(false);
    }
  };

  const handleGenerateInvoice = async (formData: InvoiceFormData) => {
    setIsInvoiceGenerating(true);
    setInvoiceFormData(formData);
    setIsInvoiceModalOpen(false);

    try {
      await downloadCertificatePdf(
        [invoiceElementId],
        `Invoice_${scanResult.imei}.pdf`,
      );
    } catch (error) {
      console.error("Invoice generation failed:", error);
    } finally {
      setIsInvoiceGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (onRegenerate) {
      setIsRegenerating(true);
      try {
        await onRegenerate();
      } finally {
        setIsRegenerating(false);
      }
    }
  };

  const handleCopyToClipboard = () => {
    const textToCopy = `
Model: ${deviceNameFromProvider || "iPhone"}
IMEI: ${imeiValue}
${imei2Value ? `IMEI2: ${imei2Value}` : ""}
Serial Number: ${serialNumber}
EID: ${eidNumber}
Activation Status: ACTIVATED
Warranty Status: ${warrantyStatus}
Estimated Purchase Date: ${formatDate(purchaseDate)}
Coverage End Date: ${formatDate(coverageEndDate)}
Find My iPhone: ${isICloudUnlocked ? "OFF" : "ON"}
iCloud Status: ${isBlacklistClean ? "CLEAN" : "FLAGGED"}
US Block Status: ${isBlacklistClean ? "CLEAN" : "FLAGGED"}
Locked Carrier: ${lockedCarrier}
SIM-Lock Status: ${isSimUnlocked ? "UNLOCKED" : "LOCKED"}
    `.trim();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:py-10 max-w-6xl mx-auto space-y-6 font-sans text-slate-900 bg-[#F8FAFC] min-h-screen">
      {/* Back Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 group"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="font-medium">Back to scan</span>
      </button>

      {/* Old Data Warning Banner */}
      {isOldGenerated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
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
                This information is from a previously generated report. For the
                most up-to-date data, please generate a fresh report.
              </p>
            </div>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegenerating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {isRegenerating ? "Generating..." : "Generate New"}
          </button>
        </motion.div>
      )}

      {/* --- MOBILE VIEW --- */}
      <div className="block md:hidden bg-white border border-slate-200 rounded-[32px] p-5 shadow-sm relative">
        <div className="space-y-3 text-center text-[14px] text-[#5F6368] leading-relaxed">
          <p>
            <span className="font-semibold">Model:</span>{" "}
            {deviceNameFromProvider || scanResult.deviceName || "iPhone"}
          </p>
          <p>
            <span className="font-semibold">IMEI:</span> {imeiValue}
          </p>
          {imei2Value && (
            <p>
              <span className="font-semibold">IMEI2:</span> {imei2Value}
            </p>
          )}
          <p>
            <span className="font-semibold">Serial Number:</span> {serialNumber}
          </p>
          <p className="break-all">
            <span className="font-semibold">EID:</span> {eidNumber}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="font-semibold">Activation:</span>
            <span className="bg-[#4CAF50] text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
              ACTIVATED
            </span>
          </div>

          <p>
            <span className="font-semibold">Warranty:</span> {warrantyStatus}
          </p>
          <p>
            <span className="font-semibold">Purchase Date:</span>{" "}
            {formatDate(purchaseDate)}
          </p>
          <p>
            <span className="font-semibold">Coverage End:</span>{" "}
            {formatDate(coverageEndDate)}
          </p>

          {notice && (
            <p className="text-amber-600 text-xs">
              <span className="font-semibold">Notice:</span> {notice}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-semibold">Find My iPhone:</span>
            <span
              className={`${!isICloudUnlocked ? "bg-[#F44336]" : "bg-[#4CAF50]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold`}
            >
              {!isICloudUnlocked ? "ON" : "OFF"}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-semibold">iCloud Status:</span>
            <span className="bg-[#4CAF50] text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
              {isBlacklistClean ? "CLEAN" : "FLAGGED"}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-semibold">US Block:</span>
            <span className="bg-[#4CAF50] text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
              {isBlacklistClean ? "CLEAN" : "FLAGGED"}
            </span>
          </div>

          <p>
            <span className="font-semibold">Locked Carrier:</span>{" "}
            {lockedCarrier}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-semibold">SIM-Lock:</span>
            <span
              className={`${isSimUnlocked ? "bg-[#4CAF50]" : "bg-[#F44336]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase`}
            >
              {isSimUnlocked ? "UNLOCKED" : "LOCKED"}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-semibold">Replaced by Apple:</span>
            <span className="bg-[#4CAF50] text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
              {replacedDevice === "No" ? "NO" : "YES"}
            </span>
          </div>
        </div>

        <button
          onClick={handleCopyToClipboard}
          className="absolute bottom-4 right-4 text-slate-300 hover:text-slate-500 transition"
        >
          <Copy size={22} />
        </button>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            disabled={isInvoiceDownloading || isInvoiceGenerating}
            className="w-full py-2.5 rounded-xl border-2 border-[#84CC16] text-[#84CC16] font-bold text-sm transition flex items-center justify-center gap-2"
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
            disabled={isCertificateDownloading}
            className="w-full py-2.5 rounded-xl bg-[#84CC16] text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
          >
            {isCertificateDownloading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {isCertificateDownloading
              ? "Generating..."
              : "Download PDF Certificate"}
          </button>
        </div>

        {copied && (
          <div className="absolute top-3 right-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-full animate-pulse">
            Copied!
          </div>
        )}
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Header Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {deviceNameFromProvider ||
                  scanResult.deviceName ||
                  "Unknown Device"}
              </h1>
              <p className="text-slate-400 mt-1 font-medium font-mono text-sm">
                IMEI: {providerData?.imei || scanResult.imei}
              </p>
            </div>
            <span
              className={`px-4 py-1.5 text-white rounded-full text-xs font-bold uppercase tracking-widest ${isBlacklistClean ? "bg-emerald-500" : "bg-red-500"}`}
            >
              {scanResult.deviceStatus?.toUpperCase() || "UNKNOWN"}
            </span>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Risk Meter
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Market Value
              </span>
            </div>
            <div className="flex justify-between items-center gap-8">
              <div className="flex-1">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${riskInfo.color} transition-all duration-1000`}
                    style={{ width: `${riskScore}%` }}
                  />
                </div>
                <div className="flex justify-between mt-3">
                  <span className={`text-lg font-semibold ${riskInfo.text}`}>
                    {riskInfo.label}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {riskScore}/100
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-slate-900">
                  ${marketValue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-[#F1F5F9] rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-slate-800" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              AI Insight
            </span>
          </div>
          <div className="bg-white rounded-xl p-5 flex-1 border border-slate-100 italic text-slate-500 leading-relaxed text-sm">
            &quot;
            {scanResult.aiInsight?.message ||
              "Analysis complete. Device appears safe based on 140+ global database checks."}
            &quot;
          </div>
        </div>

        {/* Status Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusTile
            icon={<Globe className="text-emerald-500" />}
            title="Global Blacklist"
            status={
              isBlacklistClean ? "Clean / Not Reported" : "Reported / Blocked"
            }
            isValid={isBlacklistClean}
          />
          <StatusTile
            icon={<Wallet className="text-amber-500" />}
            title="Carrier Financing"
            status={
              isFinancingClean
                ? "No active payment plan"
                : "Active payment plan detected"
            }
            isValid={isFinancingClean}
          />
          <StatusTile
            icon={<Lock className="text-emerald-500" />}
            title="Hardware Lock"
            status={
              isHardwareClean
                ? "No hardware lock detected"
                : "Hardware lock detected"
            }
            isValid={isHardwareClean}
          />
          <StatusTile
            icon={<Cpu className="text-emerald-500" />}
            title="Part Authenticity"
            status={
              isPartAuthentic
                ? "All original components"
                : "Aftermarket parts detected"
            }
            isValid={isPartAuthentic}
          />
        </div>

        {/* Report Actions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-fit">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-6">
            Report Actions
          </span>
          <div className="space-y-3">
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              disabled={
                isInvoiceDownloading ||
                isInvoiceGenerating ||
                parentIsDownloading
              }
              className="w-full py-3 rounded-xl border-2 border-[#84CC16] text-[#84CC16] font-bold text-sm hover:bg-lime-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isInvoiceGenerating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Receipt size={16} />
              )}
              Create Smart Invoice
            </button>
            <button
              onClick={handleDownloadCertificate}
              disabled={isCertificateDownloading || parentIsDownloading}
              className="w-full py-3 rounded-xl bg-[#84CC16] text-white font-bold text-sm hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
              {isCertificateDownloading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {isCertificateDownloading
                ? "Generating Certificate..."
                : "Download PDF Certificate"}
            </button>
          </div>
        </div>

        {/* Device Specifications Section — curated key fields */}
        {/* <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-lime-500/10 rounded-xl">
              <Smartphone size={18} className="text-lime-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Device Specifications
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Device",
                value: deviceNameFromProvider || scanResult.deviceName || "N/A",
              },
              { label: "IMEI", value: imeiValue || "N/A" },
              ...(imei2Value ? [{ label: "IMEI 2", value: imei2Value }] : []),
              { label: "Serial Number", value: serialNumber },
              { label: "Warranty Type", value: warrantyStatus },
              { label: "Warranty Expires", value: warrantyExpiry },
              { label: "Purchase Date", value: purchaseDate },
            ].map((row, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-xl p-4 border border-slate-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={14} className="text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {row.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800 break-words">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Technical Breakdown */}
        {technicalItems.length > 0 && (
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Database size={18} className="text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Technical Breakdown
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {technicalItems.map((item, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 break-words">
                    {String(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notice Section */}
        {/* {notice && (
          <div className="lg:col-span-3 bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">ℹ️ Notice:</span> {notice}
            </p>
          </div>
        )} */}

        {/* Metadata Footer */}
        <div className="lg:col-span-3 bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Provider
              </p>
              <p className="text-sm font-bold text-slate-700">
                {singleReportMeta?.provider ||
                  selectedService?.name ||
                  "IMEI Service"}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Service ID
              </p>
              <p className="text-sm font-bold text-slate-700">
                {singleReportMeta?.serviceId ??
                  selectedService?.serviceId ??
                  "N/A"}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Scan Date
              </p>
              <p className="text-sm font-bold text-slate-700">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Balance
              </p>
              <p className="text-sm font-bold text-slate-700">
                {providerData?.balance !== undefined
                  ? `$${providerData.balance.toFixed(3)}`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Full API Response Fields (Desktop) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 rounded-xl">
              <Database size={18} className="text-slate-700" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Full Response Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(
              [
                {
                  label: "Service Name",
                  raw:
                    singleReportMeta?.provider ||
                    selectedService?.name ||
                    "IMEI Service",
                },
                {
                  label: "Service ID",
                  raw:
                    singleReportMeta?.serviceId ??
                    selectedService?.serviceId ??
                    "N/A",
                },
                {
                  label: "Risk Score",
                  raw: riskScore !== undefined ? `${riskScore}/100` : "N/A",
                },
                {
                  label: "AI Insight Title",
                  raw: scanResult.aiInsight?.title || "N/A",
                },
                {
                  label: "AI Insight Message",
                  raw: scanResult.aiInsight?.message || "N/A",
                },
                ...Object.entries(parsedData).map(([label, value]) => ({
                  label,
                  raw: value,
                })),
              ] as { label: string; raw: unknown }[]
            ).map((item, idx) => {
              const rendered = renderFieldValue(item.raw);
              return (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                >
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {item.label.replace(/_/g, " ")}
                  </p>
                  {rendered.isImage ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={rendered.src}
                        alt="Device"
                        className="h-16 w-auto object-contain rounded-lg bg-white border border-slate-200 p-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span className="text-xs text-slate-400 break-all">
                        {rendered.src}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 break-words">
                      {rendered.text}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hidden Certificate & Invoice Containers */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "-10000px",
          width: "1100px",
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        <CertificatePDF
          data={scanResult}
          id={certificateElementId}
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
            id={invoiceElementId}
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

/* Helper Components */
function StatusTile({
  icon,
  title,
  status,
  isValid,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
  isValid: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500 font-medium max-w-[200px]">
            {status}
          </p>
        </div>
      </div>
      {isValid ? (
        <CheckCircle2 className="text-emerald-500" size={20} />
      ) : (
        <AlertTriangle className="text-amber-500" size={20} />
      )}
    </div>
  );
}
