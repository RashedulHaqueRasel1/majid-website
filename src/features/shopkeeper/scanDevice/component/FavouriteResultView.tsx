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
  AlertTriangle,
  FileText,
  Lock,
  Cpu,
  CreditCard,
  Globe,
  Calendar,
  Shield,
  Tag,
  Database,
  Wifi,
  CheckCircle2,
  XCircle,
  Unlock,
  Copy,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  FavouriteIMEIData,
  IMEIResult,
} from "../../scanDevice/types/scanDevice.types";
import { useState } from "react";
import { SmartInvoicePDF, INVOICE_PDF_WIDTH } from "./SmartInvoicePDF";
import { InvoiceModal, InvoiceFormData } from "./InvoiceModal";
import { CertificatePDF } from "./CertificatePDF";

interface FavouriteResultViewProps {
  scanResult: FavouriteIMEIData;
  imei: string;
  singleReportMeta: { provider?: string; serviceId?: number } | null;
  selectedService?: { name?: string; serviceId?: number | null } | null;
  onBack: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  onRegenerate?: () => void;
}

// Helper function to safely get risk score
const getRiskScoreValue = (riskMeter: any): number => {
  if (typeof riskMeter === "number") return riskMeter;
  if (
    riskMeter &&
    typeof riskMeter === "object" &&
    typeof riskMeter.score === "number"
  )
    return riskMeter.score;
  return 0;
};

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

// Transform FavouriteIMEIData to IMEIResult format for PDF
const transformToIMEIResult = (
  scanResult: FavouriteIMEIData,
  imei: string,
): IMEIResult => {
  const providerData = scanResult.providerResults;
  const riskScoreValue = getRiskScoreValue(scanResult.riskMeter);

  const getRiskLevel = (score: number) => {
    if (score <= 25) return "Low Risk";
    if (score <= 60) return "Medium Risk";
    return "High Risk";
  };

  const extractStorage = () => {
    const configMatch = providerData.device_configuration?.match(/(\d+)GB/);
    if (configMatch) return parseInt(configMatch[1]);
    const descMatch = providerData.description?.match(/(\d+)GB/);
    if (descMatch) return parseInt(descMatch[1]);
    return 256;
  };

  const extractColor = () => {
    const colors = [
      "Natural Titanium",
      "Black Titanium",
      "White Titanium",
      "Blue Titanium",
      "Purple",
      "Gold",
      "Silver",
      "Space Black",
      "Midnight",
      "Starlight",
    ];
    const allText = `${providerData.description} ${providerData.device_configuration}`;
    for (const color of colors) {
      if (allText.includes(color)) return color;
    }
    return "Natural Titanium";
  };

  const isBlacklistClean =
    providerData.blacklist_status?.toLowerCase() === "clean";
  const isSimUnlocked = providerData.simlock?.toLowerCase() === "unlocked";
  const warrantyExpiry = providerData.coverage_end_date || "N/A";
  const purchaseDate = providerData.purchase_date || "N/A";
  const storage = extractStorage();

  return {
    _id: undefined,
    deviceName:
      providerData.marketing_name || providerData.model_name || "iPhone",
    imei: providerData.imei || imei,
    deviceStatus: isBlacklistClean
      ? "Verified - Clean"
      : "Flagged - Check Required",
    riskMeter: {
      riskLevel: getRiskLevel(riskScoreValue),
      score: riskScoreValue,
      label: getRiskLevel(riskScoreValue),
    },
    marketValue: {
      amount: storage === 256 ? 899 : storage === 512 ? 1099 : 1299,
      currency: "USD",
    },
    aiInsight: {
      title: scanResult.aiInsight?.title || "Device Analysis Complete",
      message:
        scanResult.aiInsight?.message ||
        "Analysis complete. Device appears safe based on 140+ global database checks.",
    },
    checks: {
      globalBlacklist: {
        title: "Global Blacklist",
        description: isBlacklistClean
          ? "Clean / Not Reported in any database"
          : "Reported / Blocked in global databases",
        status: isBlacklistClean ? "passed" : "failed",
      },
      carrierFinancing: {
        title: "Carrier Financing",
        description:
          providerData.financing_status === "active"
            ? "Active payment plan detected"
            : "No active payment plan detected",
        status:
          providerData.financing_status === "active" ? "failed" : "passed",
      },
      hardwareLock: {
        title: "SIM / Hardware Lock",
        description: isSimUnlocked
          ? "Carrier Unlocked - Works with any carrier"
          : "Carrier Locked - Restricted to specific carrier",
        status: isSimUnlocked ? "passed" : "failed",
      },
      partAuthenticity: {
        title: "Part Authenticity",
        description:
          "All original components verified through Apple diagnostics",
        status: "passed",
      },
    },
    technicalBreakdown: {
      storage: {
        total: `${storage}GB`,
        free: "N/A",
        label: `${storage}GB Storage`,
      },
      batteryHealth: { percentage: 95, cycleCount: 0, label: "Good Condition" },
      processor: "A-Series Chip",
      modem: "5G Capable",
      display: "Super Retina XDR",
      warranty: {
        status:
          warrantyExpiry !== "N/A"
            ? `Valid until ${warrantyExpiry}`
            : "Limited Warranty",
        label: warrantyExpiry !== "N/A" ? "Under Warranty" : "Limited Warranty",
      },
      origin: {
        country: providerData.purchase_country || "Unknown",
        modelNumber: providerData.model || "N/A",
        label: providerData.purchase_country || "International Version",
      },
      activation: {
        lockStatus: providerData.icloud_lock === "off" ? "Unlocked" : "Locked",
        simType: isSimUnlocked ? "Unlocked SIM" : "Locked SIM",
        label: providerData.icloud_lock === "off" ? "iCloud Off" : "iCloud On",
      },
    },
    reportActions: {
      smartInvoiceCreated: false,
      pdfCertificateUrl: null,
      isPdfGenerated: false,
    },
    providerData: {
      result: `
Device: ${providerData.marketing_name || providerData.model_name || "iPhone"}
IMEI Number: ${providerData.imei || imei}
${providerData.imei2 ? `IMEI2: ${providerData.imei2}` : ""}
Serial Number: ${providerData.serial_number || "N/A"}
EID: ${providerData.eid || "N/A"}
Model: ${providerData.model || "N/A"}
Model Name: ${providerData.model_name || "N/A"}
Color: ${extractColor()}
Storage: ${storage}GB
Operating System: ${providerData.operating_system || "iOS"}
Warranty Expires: ${warrantyExpiry}
Estimated Purchase Date: ${purchaseDate}
Activation Status: ${providerData.warranty_status || "Active"}
Warranty Status: ${providerData.warranty_status || "Limited Warranty"}
Coverage Start Date: ${providerData.coverage_start_date || "N/A"}
Coverage End Date: ${providerData.coverage_end_date || "N/A"}
Limited Warranty: ${providerData.limited_warranty || "Yes"}
AppleCare Description: ${providerData.applecare_description || "90 DAYS PHONE SUPPORT"}
Purchase Country: ${providerData.purchase_country || "N/A"}
SIM Lock Status: ${providerData.simlock || "Unknown"}
iCloud Lock: ${providerData.icloud_lock || "Off"}
Blacklist Status: ${providerData.blacklist_status || "Clean"}
Locked Carrier: ${providerData.locked_carrier || "10 - Unlock"}
SIM Policy Unlock Status: ${providerData.simpolicy_unlock_status || "UNLOCK"}
Initial Activation Policy: ${providerData.initial_activation_policy_description || "10 - Unlock"}
Replaced Device: ${providerData.replaced_device === "No" ? "No" : "Yes"}
      `,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: undefined,
    oldGenerated: (scanResult as any).oldGenerated || false,
  };
};

export const FavouriteResultView = ({
  scanResult,
  imei,
  singleReportMeta,
  selectedService,
  onBack,
  onDownload,
  isDownloading,
  onRegenerate,
}: FavouriteResultViewProps) => {
  const providerData = scanResult.providerResults;
  const riskScoreValue = getRiskScoreValue(scanResult.riskMeter);
  const riskInfo = getRiskLabel(riskScoreValue);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const isSimUnlocked = providerData.simlock?.toLowerCase() === "unlocked";
  const isICloudUnlocked = providerData.icloud_lock?.toLowerCase() === "off";
  const isBlacklistClean =
    providerData.blacklist_status?.toLowerCase() === "clean";
  const isOldGenerated = (scanResult as any).oldGenerated === true;

  const extractMarketValue = () => {
    const descMatch = providerData.description?.match(/\$?(\d+(?:\.\d{2})?)/);
    if (descMatch) return parseFloat(descMatch[1]);
    const configMatch = providerData.device_configuration?.match(/(\d+)GB/);
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
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleCopyToClipboard = () => {
    const textToCopy = `
Model: ${providerData.marketing_name || providerData.model_name || "iPhone"}
IMEI: ${providerData.imei || imei}
${providerData.imei2 ? `IMEI2: ${providerData.imei2}` : ""}
Serial Number: ${providerData.serial_number || "N/A"}
EID: ${providerData.eid || "N/A"}
Warranty Status: ${providerData.warranty_status || "Limited Warranty"}
Purchase Date: ${formatDate(providerData.purchase_date || "")}
Coverage End Date: ${providerData.coverage_end_date || "N/A"}
Find My iPhone: ${isICloudUnlocked ? "OFF" : "ON"}
iCloud Status: ${isBlacklistClean ? "CLEAN" : "FLAGGED"}
Locked Carrier: ${providerData.locked_carrier || "10 - Unlock"}
SIM-Lock Status: ${isSimUnlocked ? "UNLOCKED" : "LOCKED"}
Replaced Device: ${providerData.replaced_device === "No" ? "NO" : "YES"}
    `.trim();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const handleGenerateInvoice = async (invoiceData: InvoiceFormData) => {
    setIsGeneratingInvoice(true);
    try {
      const imeiResult = transformToIMEIResult(scanResult, imei);
      const shopkeeperDetails = {
        shopName: "Tech Solutions BD",
        shopAddress: "123, Gulshan Avenue, Dhaka-1212, Bangladesh",
        phone: "+880 1234 567890",
        email: "info@techsolutionsbd.com",
        vatId: "VAT-123456789",
      };

      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "-9999px";
      tempDiv.style.width = `${INVOICE_PDF_WIDTH}px`;
      document.body.appendChild(tempDiv);

      const ReactDOMServer = await import("react-dom/server");
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const pdfHtml = ReactDOMServer.renderToString(
        <SmartInvoicePDF
          data={imeiResult}
          id="invoice-pdf"
          invoiceData={invoiceData}
          shopkeeperDetails={shopkeeperDetails}
        />,
      );

      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Invoice ${imei.slice(-8)}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Inter', sans-serif; background: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            </style>
          </head>
          <body>${pdfHtml}</body>
        </html>
      `;

      tempDiv.innerHTML = fullHtml;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(
        tempDiv.querySelector("#invoice-pdf") || tempDiv,
        {
          scale: 2,
          backgroundColor: "#ffffff",
          logging: false,
          useCORS: true,
        },
      );

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = INVOICE_PDF_WIDTH;
      const imgHeight = (canvas.height * INVOICE_PDF_WIDTH) / canvas.width;

      const pdf = new jsPDF({ unit: "px", format: [imgWidth, imgHeight + 20] });
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`invoice_${imei.slice(-8)}.pdf`);

      document.body.removeChild(tempDiv);
      setShowInvoiceModal(false);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    } finally {
      setIsGeneratingInvoice(false);
    }
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
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
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
        {isOldGenerated && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-amber-600" />
              <span className="text-xs font-semibold text-amber-800">
                Cached Data
              </span>
            </div>
            <p className="text-[11px] text-amber-700 mb-2">
              This is from a previously generated report.
            </p>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              {isRegenerating ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <RefreshCw size={12} />
              )}
              {isRegenerating ? "Generating..." : "Generate New"}
            </button>
          </div>
        )}

        <div className="space-y-3 text-center text-[14px] text-[#5F6368] leading-relaxed">
          <p>
            <span className="font-semibold">Model:</span>{" "}
            {providerData.marketing_name || providerData.model_name || "iPhone"}
          </p>
          <p>
            <span className="font-semibold">IMEI:</span>{" "}
            {providerData.imei || imei}
          </p>
          {providerData.imei2 && (
            <p>
              <span className="font-semibold">IMEI2:</span> {providerData.imei2}
            </p>
          )}
          <p>
            <span className="font-semibold">Serial Number:</span>{" "}
            {providerData.serial_number || "N/A"}
          </p>
          <p className="break-all">
            <span className="font-semibold">EID:</span>{" "}
            {providerData.eid || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Warranty:</span>{" "}
            {providerData.warranty_status || "Limited Warranty"}
          </p>
          <p>
            <span className="font-semibold">Purchase Date:</span>{" "}
            {formatDate(providerData.purchase_date || "")}
          </p>
          <p>
            <span className="font-semibold">Coverage End:</span>{" "}
            {providerData.coverage_end_date || "N/A"}
          </p>
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
          <p>
            <span className="font-semibold">Locked Carrier:</span>{" "}
            {providerData.locked_carrier || "10 - Unlock"}
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
              {providerData.replaced_device === "No" ? "NO" : "YES"}
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
            onClick={() => setShowInvoiceModal(true)}
            className="w-full py-2.5 rounded-xl border-2 border-[#84CC16] text-[#84CC16] font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <FileText size={14} /> Create Smart Invoice
          </button>
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="w-full py-2.5 rounded-xl bg-[#84CC16] text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
          >
            {isDownloading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {isDownloading ? "Generating..." : "Download PDF Certificate"}
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
                {providerData.marketing_name ||
                  providerData.model_name ||
                  "Device"}
              </h1>
              <p className="text-slate-400 mt-1 font-medium font-mono text-sm">
                IMEI: {providerData.imei || imei}
              </p>
              {providerData.imei2 && (
                <p className="text-slate-400 mt-0.5 font-mono text-xs">
                  IMEI2: {providerData.imei2}
                </p>
              )}
            </div>
            <span
              className={`px-4 py-1.5 text-white rounded-full text-xs font-bold uppercase tracking-widest ${isBlacklistClean ? "bg-emerald-500" : "bg-red-500"}`}
            >
              {isBlacklistClean ? "CLEAN" : "FLAGGED"}
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
                    style={{ width: `${riskScoreValue}%` }}
                  />
                </div>
                <div className="flex justify-between mt-3">
                  <span className={`text-lg font-semibold ${riskInfo.text}`}>
                    {riskInfo.label}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {riskScoreValue}/100
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-slate-900">
                  ${marketValue}
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
            icon={<CreditCard className="text-amber-500" />}
            title="Carrier Financing"
            status="No active payment plan detected"
            isValid={true}
          />
          <StatusTile
            icon={<Lock className="text-emerald-500" />}
            title="Hardware Lock"
            status={isICloudUnlocked ? "FMI is OFF" : "FMI is ON"}
            isValid={isICloudUnlocked}
          />
          <StatusTile
            icon={<Cpu className="text-emerald-500" />}
            title="Part Authenticity"
            status="All original components verified"
            isValid={true}
          />
        </div>

        {/* Report Actions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-fit">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-6">
            Report Actions
          </span>
          <div className="space-y-3">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="w-full py-3 rounded-xl border-2 border-[#84CC16] text-[#84CC16] font-bold text-sm hover:bg-lime-50 transition flex items-center justify-center gap-2"
            >
              <FileText size={16} /> Create Smart Invoice
            </button>
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="w-full py-3 rounded-xl bg-[#84CC16] text-white font-bold text-sm hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isDownloading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {isDownloading ? "Generating..." : "Download PDF Certificate"}
            </button>
          </div>
        </div>

        {/* Device Specifications Section */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
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
              { label: "Model", value: providerData.model, icon: Smartphone },
              {
                label: "Model Name",
                value: providerData.model_name,
                icon: Tag,
              },
              {
                label: "Serial Number",
                value: providerData.serial_number,
                icon: Database,
              },
              {
                label: "Manufacturer",
                value: providerData.manufacturer || "Apple",
                icon: Shield,
              },
              {
                label: "Operating System",
                value: providerData.operating_system || "iOS",
                icon: Cpu,
              },
              { label: "EID", value: providerData.eid, icon: Wifi },
            ]
              .filter((item) => item.value)
              .map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon size={14} className="text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 break-words">
                    {item.value}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Warranty & Coverage Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Shield size={18} className="text-blue-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Warranty & Coverage
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: "Warranty Status",
                value: providerData.warranty_status || "Limited Warranty",
              },
              {
                label: "Limited Warranty",
                value: providerData.limited_warranty || "Yes",
              },
              {
                label: "Coverage Period",
                value: `${providerData.coverage_start_date || "N/A"} - ${providerData.coverage_end_date || "N/A"}`,
              },
              {
                label: "AppleCare",
                value:
                  providerData.applecare_description || "90 DAYS PHONE SUPPORT",
              },
              {
                label: "Purchase Date",
                value: formatDate(providerData.purchase_date || ""),
              },
              {
                label: "Replaced Device",
                value: providerData.replaced_device === "No" ? "No" : "Yes",
              },
            ]
              .filter((item) => item.value !== "N/A - N/A")
              .map((item, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {item.value}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Lock & Security Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <Lock size={18} className="text-purple-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Lock & Security
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-slate-500">SIM Lock Status</span>
              {isSimUnlocked ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Unlock size={12} /> Unlocked
                </span>
              ) : (
                <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <Lock size={12} /> Locked
                </span>
              )}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-slate-500">iCloud Lock</span>
              {isICloudUnlocked ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} /> OFF (Clean)
                </span>
              ) : (
                <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <XCircle size={12} /> ON (Locked)
                </span>
              )}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-slate-500">SIM Policy Unlock</span>
              <span className="text-xs font-bold text-slate-700">
                {providerData.simpolicy_unlock_status || "UNLOCK"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-slate-500">Locked Carrier</span>
              <span className="text-xs font-bold text-slate-700">
                {providerData.locked_carrier || "10 - Unlock"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-slate-500">Activation Policy</span>
              <span className="text-xs font-bold text-slate-700 truncate max-w-[180px]">
                {providerData.initial_activation_policy_description ||
                  "10 - Unlock"}
              </span>
            </div>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="lg:col-span-3 bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Service
              </p>
              <p className="text-sm font-bold text-slate-700">
                {scanResult.bundledServiceName}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Service ID
              </p>
              <p className="text-sm font-bold text-slate-700">
                {scanResult.bundledServiceId}
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
                Risk Score
              </p>
              <p className="text-sm font-bold text-slate-700">
                {riskScoreValue}/100
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onGenerate={handleGenerateInvoice}
        scanResult={transformToIMEIResult(scanResult, imei)}
        isGenerating={isGeneratingInvoice}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          left: "-10000px",
          width: "1100px",
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <CertificatePDF
          data={transformToIMEIResult(scanResult, imei)}
          id="certificate-pdf-favourite"
          providerName={
            singleReportMeta?.provider ||
            selectedService?.name ||
            scanResult.bundledServiceName
          }
          serviceId={
            singleReportMeta?.serviceId ??
            selectedService?.serviceId ??
            scanResult.bundledServiceId
          }
        />
      </div>
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
