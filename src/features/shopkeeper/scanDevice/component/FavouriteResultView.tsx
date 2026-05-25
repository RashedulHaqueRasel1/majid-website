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
import { FavouriteIMEIData } from "../../scanDevice/types/scanDevice.types";
import { useState } from "react";
import { InvoiceModal, InvoiceFormData } from "./InvoiceModal";
import { useCertificateDownload } from "../hooks/useCertificateDownload";
import { CertificatePDF } from "./CertificatePDF";
import { SmartInvoicePDF } from "./SmartInvoicePDF";

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
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceFormData, setInvoiceFormData] =
    useState<InvoiceFormData | null>(null);
  const [isInvoiceGenerating, setIsInvoiceGenerating] = useState(false);
  const { downloadCertificatePdf } = useCertificateDownload();

  const isOldGenerated = (scanResult as any).oldGenerated === true;

  // Extract values from providerResults
  const deviceName =
    providerData.marketing_name || providerData.model_name || "iPhone";
  const imeiValue = providerData.imei || imei;
  const imei2Value = providerData.imei2 || "";
  const serialNumber = providerData.serial_number || "N/A";
  const eidNumber = providerData.eid || "N/A";
  const warrantyStatus = providerData.warranty_status || "Limited Warranty";
  const purchaseDate = providerData.purchase_date || "N/A";
  const coverageEndDate = providerData.coverage_end_date || "N/A";
  const coverageStartDate = providerData.coverage_start_date || "N/A";
  const replacedDevice = providerData.replaced_device || "No";
  const simlockStatus = providerData.simlock || "Unknown";
  const icloudLock = providerData.icloud_lock || "OFF";
  const icloudStatus = providerData.icloud_status || "CLEAN";
  const manufacturer = providerData.manufacturer || "Apple";
  const operatingSystem = providerData.operating_system || "iOS";
  const modelName = providerData.model_name || "";
  const materialNumber = providerData.material_number || "";
  const basicMaterial = providerData.basic_material || "";
  const applecareDescription = providerData.applecare_description || "";
  const limitedWarranty = providerData.limited_warranty || "Yes";
  const mdmLock = providerData.mdm_lock || "OFF";
  const simpolicyUnlockStatus =
    providerData.simpolicy_unlock_status || "UNLOCK";
  const activationPolicy =
    providerData.initial_activation_policy_description || "10 - Unlock";
  const lockedCarrier = providerData.locked_carrier || "10 - Unlock";
  const description = providerData.description || "";

  const isSimUnlocked = simlockStatus?.toLowerCase() === "unlocked";
  const isICloudUnlocked = icloudLock?.toLowerCase() === "off";
  const isBlacklistClean = icloudStatus?.toLowerCase() === "clean";

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "N/A") return "N/A";
    return dateStr;
  };

  const handleCopyToClipboard = () => {
    const textToCopy = `
Model: ${deviceName}
IMEI: ${imeiValue}
${imei2Value ? `IMEI2: ${imei2Value}` : ""}
Serial Number: ${serialNumber}
EID: ${eidNumber}
Manufacturer: ${manufacturer}
Operating System: ${operatingSystem}
Model Name: ${modelName}
Material Number: ${materialNumber}
Basic Material: ${basicMaterial}
Description: ${description}
Warranty Status: ${warrantyStatus}
Limited Warranty: ${limitedWarranty}
Purchase Date: ${formatDate(purchaseDate)}
Coverage Start Date: ${formatDate(coverageStartDate)}
Coverage End Date: ${formatDate(coverageEndDate)}
AppleCare Description: ${applecareDescription}
Find My iPhone: ${isICloudUnlocked ? "OFF" : "ON"}
iCloud Status: ${isBlacklistClean ? "CLEAN" : "FLAGGED"}
iCloud Lock: ${icloudLock}
SIM Lock Status: ${simlockStatus}
MDM Lock: ${mdmLock}
SIM Policy Unlock: ${simpolicyUnlockStatus}
Activation Policy: ${activationPolicy}
Locked Carrier: ${lockedCarrier}
Replaced Device: ${replacedDevice === "No" ? "NO" : "YES"}
Risk Score: ${riskScoreValue}/100
AI Insight: ${scanResult.aiInsight?.message || "N/A"}
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

  const handleGenerateInvoice = async (formData: InvoiceFormData) => {
    setIsInvoiceGenerating(true);
    setInvoiceFormData(formData);
    setIsInvoiceModalOpen(false);

    try {
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
      await downloadCertificatePdf(
        ["smart-invoice-pdf-container-fav"],
        `Invoice_${imei}.pdf`,
      );
    } catch (error) {
      console.error("Invoice generation failed:", error);
    } finally {
      setIsInvoiceGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-4 transition"
        >
          <ArrowLeft size={18} />
          Back to favourites
        </button>

        {/* Regenerate Warning */}
        {isOldGenerated && (
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
            <p>
              <span className="font-semibold">Service:</span>{" "}
              {scanResult.bundledServiceName}
            </p>
            <p>
              <span className="font-semibold">Service ID:</span>{" "}
              {scanResult.bundledServiceId}
            </p>

            <div className="border-t border-slate-100 pt-2 mt-1"></div>

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
            <p className="break-all">
              <span className="font-semibold">EID:</span> {eidNumber}
            </p>

            <p>
              <span className="font-semibold">Manufacturer:</span>{" "}
              {manufacturer}
            </p>
            <p>
              <span className="font-semibold">Operating System:</span>{" "}
              {operatingSystem}
            </p>
            {modelName && (
              <p>
                <span className="font-semibold">Model Name:</span> {modelName}
              </p>
            )}
            {materialNumber && (
              <p>
                <span className="font-semibold">Material Number:</span>{" "}
                {materialNumber}
              </p>
            )}
            {basicMaterial && (
              <p>
                <span className="font-semibold">Basic Material:</span>{" "}
                {basicMaterial}
              </p>
            )}
            {description && (
              <p>
                <span className="font-semibold">Description:</span>{" "}
                {description}
              </p>
            )}

            <div className="border-t border-slate-100 pt-2 mt-1"></div>

            <p>
              <span className="font-semibold">Warranty:</span> {warrantyStatus}
            </p>
            <p>
              <span className="font-semibold">Limited Warranty:</span>{" "}
              {limitedWarranty}
            </p>
            <p>
              <span className="font-semibold">Purchase Date:</span>{" "}
              {formatDate(purchaseDate)}
            </p>
            <p>
              <span className="font-semibold">Coverage Start:</span>{" "}
              {formatDate(coverageStartDate)}
            </p>
            <p>
              <span className="font-semibold">Coverage End:</span>{" "}
              {formatDate(coverageEndDate)}
            </p>
            {applecareDescription && (
              <p>
                <span className="font-semibold">AppleCare:</span>{" "}
                {applecareDescription}
              </p>
            )}

            <div className="border-t border-slate-100 pt-2 mt-1"></div>

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
              <span
                className={`${isBlacklistClean ? "bg-[#4CAF50]" : "bg-[#F44336]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase`}
              >
                {isBlacklistClean ? "CLEAN" : "FLAGGED"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-semibold">iCloud Lock:</span>
              <span
                className={`${isICloudUnlocked ? "bg-[#4CAF50]" : "bg-[#F44336]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase`}
              >
                {icloudLock}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-semibold">SIM-Lock:</span>
              <span
                className={`${isSimUnlocked ? "bg-[#4CAF50]" : "bg-[#F44336]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase`}
              >
                {simlockStatus}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-semibold">MDM Lock:</span>
              <span
                className={`${mdmLock === "OFF" ? "bg-[#4CAF50]" : "bg-[#F44336]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase`}
              >
                {mdmLock}
              </span>
            </div>

            <p>
              <span className="font-semibold">SIM Policy Unlock:</span>{" "}
              {simpolicyUnlockStatus}
            </p>
            <p>
              <span className="font-semibold">Activation Policy:</span>{" "}
              {activationPolicy}
            </p>
            <p>
              <span className="font-semibold">Locked Carrier:</span>{" "}
              {lockedCarrier}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-semibold">Replaced by Apple:</span>
              <span
                className={`${replacedDevice === "No" ? "bg-[#4CAF50]" : "bg-[#F44336]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase`}
              >
                {replacedDevice === "No" ? "NO" : "YES"}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-2 mt-1"></div>

            {/* Risk Meter Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Risk Level:</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${
                    riskScoreValue <= 25
                      ? "bg-emerald-500"
                      : riskScoreValue <= 60
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                >
                  {riskScoreValue <= 25
                    ? "LOW"
                    : riskScoreValue <= 60
                      ? "MODERATE"
                      : "HIGH"}{" "}
                  RISK
                </span>
              </div>
              <div>
                <span className="font-semibold">Risk Score:</span>{" "}
                {riskScoreValue}/100
              </div>
              <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${riskScoreValue <= 25 ? "bg-emerald-500" : riskScoreValue <= 60 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${riskScoreValue}%` }}
                />
              </div>
            </div>

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
            onClick={onDownload}
            disabled={isDownloading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#84CC16] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {isDownloading ? "Generating..." : "Download PDF Certificate"}
          </button>
        </div>
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
          data={scanResult as any}
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
        {invoiceFormData && (
          <SmartInvoicePDF
            data={scanResult as any}
            id="smart-invoice-pdf-container-fav"
            invoiceData={invoiceFormData}
          />
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onGenerate={handleGenerateInvoice}
        scanResult={scanResult as any}
        isGenerating={isInvoiceGenerating}
      />
    </div>
  );
};
