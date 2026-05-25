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
} from "lucide-react";
import { IMEIResult } from "../../scanDevice/types/scanDevice.types";
import { CertificatePDF } from "./CertificatePDF";
import { InvoiceModal, InvoiceFormData } from "./InvoiceModal";
import { useCertificateDownload } from "../hooks/useCertificateDownload";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { SmartInvoicePDF } from "./SmartInvoicePDF";

interface SingleResultViewProps {
  scanResult: IMEIResult;
  singleReportMeta: { provider?: string; serviceId?: number } | null;
  selectedService?: { name?: string; serviceId?: number | null } | null;
  onBack: () => void;
  onRegenerate?: (imei: string, serviceId: number) => Promise<void>;
  // Add these props to match what's being passed
  onDownload?: () => Promise<void> | void;
  isDownloading?: boolean;
}

export const SingleResultView = ({
  scanResult,
  singleReportMeta,
  selectedService,
  onBack,
  onRegenerate,
  onDownload, // Add this
  isDownloading: parentIsDownloading, // Add this
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

  const parsedData = (scanResult as any).parsedProviderData || {};
  const riskScore =
    typeof scanResult.riskMeter === "number"
      ? scanResult.riskMeter
      : scanResult.riskMeter?.score || 0;

  // Extract values from parsedData
  const deviceName = parsedData.device || scanResult.deviceName || "iPhone";
  const imeiValue = parsedData.imei_number || scanResult.imei;
  const imei2Value = parsedData.imei2 || parsedData.imei_2 || "";
  const serialNumber = parsedData.serial_number || "N/A";
  const eidNumber = parsedData.eid || "N/A";
  const warrantyStatus = parsedData.warranty_type || "Limited Warranty";
  const purchaseDate = parsedData.estimated_purchase_date || "N/A";
  const coverageEndDate = parsedData.warranty_expires || "N/A";
  const notice = parsedData.notice || "";
  const replacedDevice = parsedData.replaced_device || "No";
  const activationStatus = parsedData.activation_status || "Activated";
  const coverageBenefits = parsedData.coverage_benefits || "";
  const registrationStatus = parsedData.registration_status || "";
  const tempCoverage = parsedData.temp_coverage || "";
  const openRepair = parsedData.open_repair || "";
  const serialKey = parsedData.serial_key || "";

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "N/A") return "N/A";
    return dateStr;
  };

  const handleDownloadCertificate = async () => {
    // Use parent's download handler if provided, otherwise use local one
    if (onDownload) {
      await onDownload();
    } else {
      setIsCertificateDownloading(true);
      try {
        await downloadCertificatePdf(
          ["certificate-pdf-single"],
          `Certificate_${scanResult.imei}.pdf`,
        );
      } catch (error) {
        console.error("Certificate download failed:", error);
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
    } catch (error) {
      console.error("Invoice generation failed:", error);
    } finally {
      setIsInvoiceGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) {
      console.error("onRegenerate callback not provided");
      alert(
        "Regenerate function not available. Please refresh the page and try again.",
      );
      return;
    }

    const serviceId = selectedService?.serviceId ?? 6;
    const currentImei = scanResult?.imei;

    if (!currentImei || !/^\d{15}$/.test(currentImei)) {
      alert(`Valid IMEI not found. Found: "${currentImei}"`);
      return;
    }

    setIsRegenerating(true);
    try {
      await onRegenerate(currentImei, serviceId);
      alert("Report regenerated successfully!");
    } catch (error: any) {
      console.error("Regenerate error:", error);
      alert(error.message || "Failed to regenerate report");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    const textToCopy = `
Model: ${deviceName}
IMEI: ${imeiValue}
${imei2Value ? `IMEI2: ${imei2Value}` : ""}
Serial Number: ${serialNumber}
EID: ${eidNumber}
Activation Status: ${activationStatus}
Warranty Type: ${warrantyStatus}
Warranty Expires: ${formatDate(coverageEndDate)}
Estimated Purchase Date: ${formatDate(purchaseDate)}
Coverage Benefits: ${coverageBenefits}
Registration Status: ${registrationStatus}
Replaced Device: ${replacedDevice}
Temp Coverage: ${tempCoverage}
Open Repair: ${openRepair}
Notice: ${notice}
Serial Key: ${serialKey}
Risk Level: ${scanResult.riskMeter?.riskLevel || "N/A"}
Risk Score: ${riskScore}/100
AI Insight: ${scanResult.aiInsight?.message || "N/A"}
    `.trim();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDownloadingNow = parentIsDownloading || isCertificateDownloading;

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

        {/* Regenerate Warning */}
        {(scanResult as any).oldGenerated && (
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
                  From a previous report. Generate fresh for latest data.
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

        {/* Main Card - Same design for mobile and desktop */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-5 shadow-sm relative">
          <div className="space-y-3 text-center text-[14px] text-[#5F6368] leading-relaxed">
            {/* Device Image if available */}
            {parsedData.image?.src && (
              <div className="flex justify-center mb-2">
                <img
                  src={parsedData.image.src}
                  alt="Device"
                  className="h-20 w-auto object-contain"
                />
              </div>
            )}

            <p>
              <span className="font-semibold">Model:</span> {deviceName}
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
              <span className="font-semibold">Serial Number:</span>{" "}
              {serialNumber}
            </p>
            {serialKey && (
              <p>
                <span className="font-semibold">Serial Key:</span> {serialKey}
              </p>
            )}
            <p className="break-all">
              <span className="font-semibold">EID:</span> {eidNumber}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="font-semibold">Activation:</span>
              <span className="bg-[#4CAF50] text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                {activationStatus.toUpperCase()}
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

            {coverageBenefits && (
              <p>
                <span className="font-semibold">Coverage Benefits:</span>{" "}
                {coverageBenefits}
              </p>
            )}

            {registrationStatus && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">Registration:</span>
                <span className="bg-[#4CAF50] text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                  {registrationStatus.toUpperCase()}
                </span>
              </div>
            )}

            {notice && (
              <p className="text-amber-600 text-xs">
                <span className="font-semibold">Notice:</span> {notice}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-semibold">Replaced by Apple:</span>
              <span
                className={`${replacedDevice === "No" ? "bg-[#4CAF50]" : "bg-[#F44336]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase`}
              >
                {replacedDevice === "No" ? "NO" : "YES"}
              </span>
            </div>

            {tempCoverage && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">Temp Coverage:</span>
                <span className="bg-[#2196F3] text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                  {tempCoverage}
                </span>
              </div>
            )}

            {openRepair && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">Open Repair:</span>
                <span className="bg-[#FF9800] text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                  {openRepair}
                </span>
              </div>
            )}

            {/* Risk Meter Section */}
            {scanResult.riskMeter && (
              <>
                <div className="border-t border-slate-100 pt-3 mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Risk Level:</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${
                        riskScore <= 25
                          ? "bg-emerald-500"
                          : riskScore <= 60
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                    >
                      {scanResult.riskMeter.riskLevel?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Risk Score:</span>{" "}
                    {riskScore}/100
                  </div>
                  <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${riskScore <= 25 ? "bg-emerald-500" : riskScore <= 60 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${riskScore}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* AI Insight Section */}
            {scanResult.aiInsight && (
              <div className="border-t border-slate-100 pt-3 mt-2">
                <p className="font-semibold mb-1">AI Insight:</p>
                <p className="text-sm italic text-slate-600">
                  {scanResult.aiInsight.message}
                </p>
              </div>
            )}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyToClipboard}
            className="absolute bottom-4 right-4 text-slate-300 hover:text-slate-500 transition"
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
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "-10000px",
          width: "1100px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
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
