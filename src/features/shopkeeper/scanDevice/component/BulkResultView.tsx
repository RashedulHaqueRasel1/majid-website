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
  Smartphone,
  Sparkles,
  ShieldCheck,
  Wallet,
  Lock,
  Cpu,
  Check,
  AlertTriangle,
  Gauge,
  Database,
  Tag,
  Shield,
  Globe,
  CreditCard,
  Copy,
} from "lucide-react";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { CertificatePDF } from "./CertificatePDF";
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

// Helper function to parse provider data rows from HTML
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

// Helper function to get device image from HTML
const getDeviceImage = (html: string): string | null => {
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/);
  return imgMatch ? imgMatch[1] : null;
};

// Status Tile Component
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

export const BulkResultView = ({
  batchResult,
  onClear,
  onDownloadCertificate,
  isDownloading,
  onBack,
}: BulkResultViewProps) => {
  const [selectedBatchIndex, setSelectedBatchIndex] = useState(0);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

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

  // Get provider data from selected row
  const currentProviderData = selectedBatchRow?.data?.providerData as
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

  const providerHTML = currentProviderData?.result || "";
  const providerRows = parseProviderRows(providerHTML);
  const deviceImage = getDeviceImage(providerHTML);
  const deviceNameFromProvider = providerRows.find(
    (r) => r.label === "Device",
  )?.value;

  const currentData = selectedBatchRow?.data;
  const checksArray = currentData?.checks
    ? Object.values(currentData.checks)
    : [];
  const riskScore = currentData?.riskMeter?.score || 0;
  const riskInfo = getRiskLabel(riskScore);

  // Get check statuses
  const isBlacklistClean =
    currentData?.checks?.globalBlacklist?.status === "passed";
  const isFinancingClean =
    currentData?.checks?.carrierFinancing?.status === "passed";
  const isHardwareClean =
    currentData?.checks?.hardwareLock?.status === "passed";
  const isPartAuthentic =
    currentData?.checks?.partAuthenticity?.status === "passed";

  // Create provider data map for mobile view
  const providerDataMap: Record<string, string> = {};
  providerRows.forEach((row) => {
    providerDataMap[row.label] = row.value;
  });

  const imeiValue = currentProviderData?.imei || currentData?.imei;
  const imei2Value =
    providerDataMap["IMEI 2"] || providerDataMap["IMEI2 Number"];
  const serialNumber = providerDataMap["Serial Number"] || "N/A";
  const eidNumber = providerDataMap["EID"] || "N/A";
  const warrantyStatus =
    providerDataMap["Warranty Type"] || "Apple Limited Warranty";
  const purchaseDate = providerDataMap["Estimated Purchase Date"] || "N/A";
  const coverageEndDate =
    providerDataMap["Coverage End Date"] ||
    providerDataMap["Warranty Expires"] ||
    "N/A";
  const replacedDevice = providerDataMap["Replaced Device"] || "No";
  const lockedCarrier = providerDataMap["Locked Carrier"] || "Unlock";
  const isSimUnlocked = isHardwareClean;
  const isICloudUnlocked = isHardwareClean;

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "N/A") return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleCopyToClipboard = () => {
    const textToCopy = `
Model: ${deviceNameFromProvider || currentData?.deviceName || "iPhone"}
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

  const handleDownloadSelectedBulkCertificate = useCallback(() => {
    if (!selectedBatchRow?.ok || !selectedBatchRow.data) return;
    onDownloadCertificate(
      [`certificate-pdf-bulk-${selectedBatchIndex}`],
      `Certificate_${selectedBatchRow.imei}.pdf`,
    );
  }, [onDownloadCertificate, selectedBatchIndex, selectedBatchRow]);

  const handleDownloadAllBulkCertificates = useCallback(() => {
    if (successfulBatchRows.length === 0) return;
    onDownloadCertificate(
      successfulBatchRows.map(
        (_, index) => `certificate-pdf-bulk-success-${index}`,
      ),
      `Bulk_IMEI_Certificates_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  }, [onDownloadCertificate, successfulBatchRows]);

  if (!batchResult) return null;

  return (
    <div className="w-full space-y-4 md:space-y-6 pb-10 font-sans text-slate-900 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => {
          console.log("Back button clicked");
          onBack();
        }}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-2 md:mb-4 group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="text-sm md:text-base font-medium">Back to scan</span>
      </button>

      {/* --- MOBILE VIEW (Only visible on mobile) --- */}
      <div className="block md:hidden bg-white border border-slate-200 rounded-[32px] p-5 shadow-sm relative">
        <div className="space-y-3 text-center text-[14px] text-[#5F6368] leading-relaxed">
          <p>
            <span className="font-semibold">Model:</span>{" "}
            {deviceNameFromProvider || currentData?.deviceName || "iPhone"}
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

          {/* Summary Stats for Mobile */}
          <div className="flex justify-center gap-4 pt-2">
            <div className="text-center">
              <p className="text-[10px] text-slate-400">Total</p>
              <p className="text-lg font-bold text-slate-900">
                {batchResult.summary.total}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400">Success</p>
              <p className="text-lg font-bold text-emerald-600">
                {batchResult.summary.successCount}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400">Failed</p>
              <p className="text-lg font-bold text-red-600">
                {batchResult.summary.failedCount}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyToClipboard}
          className="absolute bottom-4 right-4 text-slate-300 hover:text-slate-500 transition"
        >
          <Copy size={22} />
        </button>

        {/* Mobile Action Buttons */}
        <div className="mt-6 space-y-2">
          <button
            onClick={handleDownloadSelectedBulkCertificate}
            disabled={isDownloading}
            className="w-full py-2.5 rounded-xl bg-[#84CC16] text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
          >
            {isDownloading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Download Certificate
          </button>
        </div>

        {copied && (
          <div className="absolute top-3 right-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-full animate-pulse">
            Copied!
          </div>
        )}
      </div>

      {/* --- DESKTOP VIEW (COMPLETELY UNCHANGED - Same as your original) --- */}
      <div className="hidden md:block">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm"
        >
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">
                Reports
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-slate-900">
                Bulk IMEI Scan Results
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-500 max-w-2xl">
                Results are rendered directly on this page and organized one at
                a time for easier review.
              </p>
            </div>
            <button
              onClick={() => {
                console.log("Clear button clicked");
                onClear();
              }}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              Clear Results
            </button>
          </div>

          {/* Summary Cards */}
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-slate-500" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Total
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {batchResult.summary.total}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Success
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-emerald-700">
                {batchResult.summary.successCount}
              </p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-600">
                  Failed
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-red-600">
                {batchResult.summary.failedCount}
              </p>
            </div>
          </div>

          {/* Download All Button */}
          {successfulBatchRows.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleDownloadAllBulkCertificates}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-70"
              >
                {isDownloading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Download All Certificates ({successfulBatchRows.length})
              </button>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Navigate Results
                </h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Use the selector or next and previous controls to inspect each
                  IMEI report.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                {/* Custom Dropdown */}
                <div className="relative" ref={selectRef}>
                  <button
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                    className="w-full min-w-[260px] flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-slate-300 transition-all"
                  >
                    <span className="truncate">
                      {selectedBatchRow
                        ? `Row ${selectedBatchRow.rowNumber} - ${selectedBatchRow.imei} ${!selectedBatchRow.ok ? "(Failed)" : ""}`
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
                          {`Row ${row.rowNumber} - ${row.imei} ${!row.ok ? "(Failed)" : ""}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePrevClick}
                  disabled={selectedBatchIndex === 0}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>

                <button
                  onClick={handleNextClick}
                  disabled={selectedBatchIndex === batchRows.length - 1}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Selected Result Details */}
        {selectedBatchRow?.ok && selectedBatchRow.data ? (
          <motion.div
            key={selectedBatchIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Main Header Card */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {deviceNameFromProvider ||
                      currentData?.deviceName ||
                      "Unknown Device"}
                  </h1>
                  <p className="text-slate-400 mt-1 font-medium font-mono text-sm">
                    IMEI: {currentProviderData?.imei || currentData?.imei}
                  </p>
                </div>
                <span
                  className={`px-4 py-1.5 text-white rounded-full text-xs font-bold uppercase tracking-widest ${isBlacklistClean ? "bg-emerald-500" : "bg-red-500"}`}
                >
                  {currentData?.deviceStatus?.toUpperCase() || "UNKNOWN"}
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
                      <span
                        className={`text-lg font-semibold ${riskInfo.text}`}
                      >
                        {riskInfo.label}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {riskScore}/100
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-slate-900">
                      ${currentData?.marketValue?.amount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insight Card */}
            <div className="mt-6 bg-[#F1F5F9] rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-slate-800" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  AI Insight
                </span>
              </div>
              <div className="bg-white rounded-xl p-5 flex-1 border border-slate-100 italic text-slate-500 leading-relaxed text-sm">
                &quot;
                {currentData?.aiInsight?.message ||
                  "Analysis complete. Device appears safe based on 140+ global database checks."}
                &quot;
              </div>
            </div>

            {/* Status Grid - Security Checks */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatusTile
                icon={<Globe className="text-emerald-500" />}
                title="Global Blacklist"
                status={
                  isBlacklistClean
                    ? "Clean / Not Reported"
                    : "Reported / Blocked"
                }
                isValid={isBlacklistClean}
              />
              <StatusTile
                icon={<CreditCard className="text-amber-500" />}
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

            {/* Download Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleDownloadSelectedBulkCertificate}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70"
              >
                {isDownloading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Download Certificate
              </button>
            </div>

            {/* Device Specifications Section */}
            {providerRows.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <Smartphone size={18} className="text-emerald-500" />
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

            {/* Security Checks Details */}
            <div className="mt-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                Security Checks Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checksArray.map((check: any, idx: number) => {
                  const isPassed = check.status === "passed";
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${isPassed ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}
                        >
                          <ShieldCheck size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {check.title}
                          </p>
                          <p className="text-xs text-slate-500 max-w-[200px]">
                            {check.description}
                          </p>
                        </div>
                      </div>
                      {isPassed ? (
                        <CheckCircle2 className="text-emerald-500" size={20} />
                      ) : (
                        <AlertTriangle className="text-amber-500" size={20} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="mt-6 bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Provider
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {selectedBatchRow.provider || "API"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Service ID
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {selectedBatchRow.serviceId ?? "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Row Number
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {selectedBatchRow.rowNumber} / {batchRows.length}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Balance
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {currentProviderData?.balance !== undefined
                      ? `$${currentProviderData.balance.toFixed(3)}`
                      : "N/A"}
                  </p>
                </div>
              </div>
              {selectedBatchRow.message && (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    <span className="font-bold">Message:</span>{" "}
                    {selectedBatchRow.message}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : selectedBatchRow ? (
          <motion.div
            key={selectedBatchIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-500">
              Failed Result
            </p>
            <h3 className="mt-2 text-2xl font-bold text-red-700">
              Row {selectedBatchRow.rowNumber} could not be processed
            </h3>
            <p className="mt-3 text-sm font-semibold text-red-600">
              {selectedBatchRow.message}
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-400">
                  Row
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  {selectedBatchRow.rowNumber}
                </p>
              </div>
              <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-400">
                  IMEI
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900 break-all">
                  {selectedBatchRow.imei}
                </p>
              </div>
              <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-400">
                  Service ID
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  {selectedBatchRow.serviceId ?? "N/A"}
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* Hidden Certificate Containers */}
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
        {successfulBatchRows.map((row, index) => (
          <CertificatePDF
            key={`bulk-certificate-${row.rowNumber}-${row.imei}-${index}`}
            data={row.data}
            id={`certificate-pdf-bulk-success-${index}`}
            providerName={row.provider}
            serviceId={row.serviceId}
          />
        ))}
        {selectedBatchRow?.ok && selectedBatchRow.data && (
          <CertificatePDF
            key={`selected-bulk-certificate-${selectedBatchIndex}`}
            data={selectedBatchRow.data}
            id={`certificate-pdf-bulk-${selectedBatchIndex}`}
            providerName={selectedBatchRow.provider}
            serviceId={selectedBatchRow.serviceId}
          />
        )}
      </div>
    </div>
  );
};
