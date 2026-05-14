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
} from "lucide-react";
import { IMEIResult } from "../../scanDevice/types/scanDevice.types";
import { CertificatePDF } from "./CertificatePDF";
import {
  getChecksArray,
  getStatusColor,
  getTechnicalBreakdownItems,
} from "@/utils/resultHelpers";
import { SmartInvoicePDF } from "./SmartInvoicePDF";
import { useCertificateDownload } from "../hooks/useCertificateDownload";
import { useState } from "react";

interface SingleResultViewProps {
  scanResult: IMEIResult;
  singleReportMeta: { provider?: string; serviceId?: number } | null;
  selectedService?: { name?: string; serviceId?: number | null } | null;
  onBack: () => void;
  onDownload: () => void;
  isDownloading: boolean;
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

// Helper function to parse provider data rows
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
}: SingleResultViewProps) => {
  const checksArray = getChecksArray(scanResult);
  const technicalItems = getTechnicalBreakdownItems(scanResult);
  const riskScore = scanResult.riskMeter?.score || 0;
  const riskInfo = getRiskLabel(riskScore);
  const { downloadCertificatePdf, isDownloading: hookIsDownloading } =
    useCertificateDownload();

  // Separate loading states for certificate and invoice
  const [isCertificateDownloading, setIsCertificateDownloading] =
    useState(false);
  const [isInvoiceDownloading, setIsInvoiceDownloading] = useState(false);

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

  const providerHTML = providerData?.result || "";
  const providerRows = parseProviderRows(providerHTML);

  const getDeviceImage = (html: string): string | null => {
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/);
    return imgMatch ? imgMatch[1] : null;
  };

  const deviceImage = getDeviceImage(providerHTML);
  const deviceNameFromProvider = providerRows.find(
    (r) => r.label === "Device",
  )?.value;

  // Get check statuses
  const isBlacklistClean =
    scanResult.checks?.globalBlacklist?.status === "passed";
  const isFinancingClean =
    scanResult.checks?.carrierFinancing?.status === "passed";
  const isHardwareClean = scanResult.checks?.hardwareLock?.status === "passed";
  const isPartAuthentic =
    scanResult.checks?.partAuthenticity?.status === "passed";

  // Certificate and Invoice element IDs
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

  const isAnyDownloading =
    isCertificateDownloading ||
    isInvoiceDownloading ||
    parentIsDownloading ||
    hookIsDownloading;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  ${scanResult.marketValue?.amount?.toFixed(2) || "0.00"}
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

        {/* Status Grid - Security Checks */}
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
              onClick={handleDownloadInvoice}
              disabled={isInvoiceDownloading || parentIsDownloading}
              className="w-full py-3 rounded-xl border-2 border-[#84CC16] text-[#84CC16] font-bold text-sm hover:bg-lime-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInvoiceDownloading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Receipt size={16} />
              )}
              {isInvoiceDownloading
                ? "Generating Invoice..."
                : "Create Smart Invoice"}
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

        {/* Device Specifications Section */}
        {providerRows.length > 0 && (
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
              {providerRows.slice(0, 6).map((row, idx) => (
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
          </div>
        )}

        {/* Technical Breakdown Section */}
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
      </div>

      {/* Hidden Certificate & Invoice Containers - Must be visible for html2canvas */}
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
        <SmartInvoicePDF
          data={scanResult}
          id={invoiceElementId}
          customerName="Alexander Wright"
          customerEmail="alex.wright@example.com"
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
