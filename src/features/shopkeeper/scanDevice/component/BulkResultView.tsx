/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ArrowLeft,
  Copy,
  RefreshCw,
  Clock,
  Receipt,
} from "lucide-react";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CertificatePDF } from "./CertificatePDF";
import { SmartInvoicePDF } from "./SmartInvoicePDF";
import { InvoiceModal, InvoiceFormData } from "./InvoiceModal";
import { useCertificateDownload } from "../hooks/useCertificateDownload";
import {
  BatchImeiResponse,
  BatchImeiItemResult,
} from "../../scanDevice/types/scanDevice.types";

interface BulkResultViewProps {
  batchResult: BatchImeiResponse | null;
  onClear: () => void;
  onBack: () => void;
  onDownloadCertificate: (
    elementIds: string[],
    filename: string,
  ) => Promise<void>;
  isDownloading: boolean;
  onRegenerateItem?: (imei: string, serviceId: number) => Promise<void>;
}

// Helper function to get risk label
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

export const BulkResultView = ({
  batchResult,
  onClear,
  onDownloadCertificate,
  isDownloading,
  onBack,
  onRegenerateItem,
}: BulkResultViewProps) => {
  const [selectedBatchIndex, setSelectedBatchIndex] = useState(0);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceFormData, setInvoiceFormData] =
    useState<InvoiceFormData | null>(null);
  const [isInvoiceGenerating, setIsInvoiceGenerating] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const { status } = useSession();
  const isGuest = status === "unauthenticated";
  const { downloadCertificatePdf } = useCertificateDownload();

  const batchRows = useMemo(() => batchResult?.data ?? [], [batchResult]);
  const successfulBatchRows = useMemo(
    () =>
      batchRows.filter(
        (
          row,
        ): row is BatchImeiItemResult & {
          data: NonNullable<typeof row.data>;
        } => Boolean(row.ok && row.data),
      ),
    [batchRows],
  );
  const selectedBatchRow = useMemo(
    () => batchRows[selectedBatchIndex] ?? null,
    [batchRows, selectedBatchIndex],
  );

  // Get parsed data from selected row
  const parsedData = (selectedBatchRow?.data as any)?.parsedProviderData || {};
  const riskScore =
    typeof selectedBatchRow?.data?.riskMeter === "number"
      ? selectedBatchRow.data.riskMeter
      : selectedBatchRow?.data?.riskMeter?.score || 0;
  const riskInfo = getRiskLabel(riskScore);

  // Check if current selected data is old generated
  const isOldGenerated = (selectedBatchRow?.data as any)?.oldGenerated === true;

  // Extract values from parsedData
  const deviceName =
    parsedData.device || selectedBatchRow?.data?.deviceName || "iPhone";
  const imeiValue = parsedData.imei_number || selectedBatchRow?.imei;
  const imei2Value = parsedData.imei2 || "";
  const serialNumber = parsedData.serial_number || "N/A";
  const serialKey = parsedData.serial_key || "";
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

  // Risk and status determinations
  const isBlacklistClean =
    selectedBatchRow?.data?.riskMeter?.riskLevel === "low";

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
${serialKey ? `Serial Key: ${serialKey}` : ""}
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
Risk Level: ${selectedBatchRow?.data?.riskMeter?.riskLevel || "N/A"}
Risk Score: ${riskScore}/100
AI Insight: ${selectedBatchRow?.data?.aiInsight?.message || "N/A"}
    `.trim();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (onRegenerateItem && selectedBatchRow) {
      setIsRegenerating(true);
      await onRegenerateItem(
        selectedBatchRow.imei,
        selectedBatchRow.serviceId || 6,
      );
      setIsRegenerating(false);
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
        [`smart-invoice-pdf-bulk-${selectedBatchIndex}`],
        `Invoice_${imeiValue}.pdf`,
      );
    } catch (error) {
      console.error("Invoice generation failed:", error);
    } finally {
      setIsInvoiceGenerating(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!selectedBatchRow?.ok || !selectedBatchRow.data) return;
    onDownloadCertificate(
      [`certificate-pdf-bulk-${selectedBatchIndex}`],
      `Certificate_${selectedBatchRow.imei}.pdf`,
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectedBatchIndexChange = useCallback((value: number) => {
    setSelectedBatchIndex(value);
    setIsSelectOpen(false);
  }, []);

  const handlePrevClick = useCallback(() => {
    setSelectedBatchIndex((current) => Math.max(current - 1, 0));
  }, []);

  const handleNextClick = useCallback(() => {
    setSelectedBatchIndex((current) =>
      Math.min(current + 1, batchRows.length - 1),
    );
  }, [batchRows.length]);

  if (!batchResult) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-4 transition"
        >
          <ArrowLeft size={18} />
          Back to scan
        </button>

        {/* Summary Stats */}
        <div className="bg-white rounded-[32px] p-4 mb-4 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <p className="text-[10px] text-slate-400">Total</p>
              <p className="text-xl font-bold text-slate-900">
                {batchResult.summary.total}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-[10px] text-slate-400">Success</p>
              <p className="text-xl font-bold text-emerald-600">
                {batchResult.summary.successCount}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-[10px] text-slate-400">Failed</p>
              <p className="text-xl font-bold text-red-600">
                {batchResult.summary.failedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Dropdown */}
        <div className="mb-4">
          <div className="relative" ref={selectRef}>
            <button
              onClick={() => setIsSelectOpen(!isSelectOpen)}
              className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-300 transition-all"
            >
              <span className="truncate">
                {selectedBatchRow
                  ? `Device ${selectedBatchRow.rowNumber} - ${selectedBatchRow.imei} ${!selectedBatchRow.ok ? "(Failed)" : ""}`
                  : "Select a result"}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isSelectOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isSelectOpen && (
              <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                {batchRows.map((row, index) => (
                  <button
                    key={`${row.rowNumber}-${row.imei}-${index}`}
                    onClick={() => handleSelectedBatchIndexChange(index)}
                    className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-slate-50 ${
                      selectedBatchIndex === index
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "text-slate-700"
                    }`}
                  >
                    {`Device ${row.rowNumber} - ${row.imei} ${!row.ok ? "(Failed)" : ""}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center gap-3 mt-3">
            <button
              onClick={handlePrevClick}
              disabled={selectedBatchIndex === 0}
              className="flex-1 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:border-slate-300 disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              onClick={handleNextClick}
              disabled={selectedBatchIndex === batchRows.length - 1}
              className="flex-1 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:border-slate-300 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Selected Result Details */}
        {selectedBatchRow?.ok && selectedBatchRow.data ? (
          <>
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

            {/* Main Card - Same design as SingleResultView */}
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
                    <span className="font-semibold">Serial Key:</span>{" "}
                    {serialKey}
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
                  <span className="font-semibold">Warranty:</span>{" "}
                  {warrantyStatus}
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
                {selectedBatchRow.data?.riskMeter && (
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
                          {selectedBatchRow.data.riskMeter.riskLevel?.toUpperCase()}
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
                {selectedBatchRow.data?.aiInsight && (
                  <div className="border-t border-slate-100 pt-3 mt-2">
                    <p className="font-semibold mb-1">AI Insight:</p>
                    <p className="text-sm italic text-slate-600">
                      {selectedBatchRow.data.aiInsight.message}
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
            )}
          </>
        ) : selectedBatchRow ? (
          <div className="bg-white border border-red-200 rounded-[32px] p-5 shadow-sm">
            <div className="text-center">
              <XCircle size={48} className="mx-auto text-red-500 mb-3" />
              <p className="text-lg font-bold text-red-700">Failed Result</p>
              <p className="text-sm text-red-600 mt-2">
                {selectedBatchRow.message}
              </p>
              <p className="text-xs text-slate-500 mt-4">
                IMEI: {selectedBatchRow.imei}
              </p>
            </div>
          </div>
        ) : null}
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
        {selectedBatchRow?.ok && selectedBatchRow.data && (
          <>
            <CertificatePDF
              data={selectedBatchRow.data}
              id={`certificate-pdf-bulk-${selectedBatchIndex}`}
              providerName={selectedBatchRow.provider}
              serviceId={selectedBatchRow.serviceId}
            />
            {invoiceFormData && (
              <SmartInvoicePDF
                data={selectedBatchRow.data}
                id={`smart-invoice-pdf-bulk-${selectedBatchIndex}`}
                invoiceData={invoiceFormData}
              />
            )}
          </>
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onGenerate={handleGenerateInvoice}
        scanResult={selectedBatchRow?.data || null}
        isGenerating={isInvoiceGenerating}
      />
    </div>
  );
};
