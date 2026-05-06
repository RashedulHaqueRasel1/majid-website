"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { checkImeiBatchApi } from "@/features/shopkeeper/scanDevice/api/scanDevice.api";
import type { BatchImeiResponse } from "@/features/shopkeeper/scanDevice/types/scanDevice.types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ImeiReportDetails } from "@/features/shopkeeper/scanDevice/component/ImeiReportDetails";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_EXTENSIONS = [".csv", ".xls", ".xlsx", ".pdf"];
const MAX_FILE_SIZE_MB = 5; // Reduced for IMEI check as per backend limit usually
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ─── Types ────────────────────────────────────────────────────────────────────

interface BulkImeiUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId?: number;
  onBatchComplete?: (result: BatchImeiResponse) => void;
}

type UploadPhase = "idle" | "selected" | "uploading" | "done";

// ─── Helper ───────────────────────────────────────────────────────────────────

function validateFile(file: File): string | null {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return `Invalid file type "${ext}". Please upload a .csv, .xls, .xlsx, or .pdf file.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File exceeds the ${MAX_FILE_SIZE_MB} MB size limit.`;
  }
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: "slate" | "lime" | "red";
  icon: React.ReactNode;
}) {
  const colorMap = {
    slate: "bg-slate-50 border-slate-100 text-slate-700",
    lime: "bg-lime-50 border-lime-100 text-lime-700",
    red: "bg-red-50 border-red-100 text-red-600",
  };
  const valueMap = {
    slate: "text-slate-900",
    lime: "text-lime-600",
    red: "text-red-600",
  };
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl border ${colorMap[color]}`}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-60">
          {label}
        </p>
        <p className={`text-2xl font-black ${valueMap[color]}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BulkImeiUploadModal({
  isOpen,
  onClose,
  serviceId = 6,
  onBatchComplete,
}: BulkImeiUploadModalProps) {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<BatchImeiResponse | null>(
    null,
  );
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const { status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setPhase("idle");
    setFile(null);
    setValidationError(null);
    setUploadResult(null);
    setSelectedResultIndex(0);
    setIsDragging(false);
    setIsUploading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const acceptFile = (incoming: File) => {
    const err = validateFile(incoming);
    if (err) {
      setValidationError(err);
      setFile(null);
      setPhase("idle");
      return;
    }
    setValidationError(null);
    setFile(incoming);
    setPhase("selected");
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) acceptFile(dropped);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) acceptFile(selected);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;

    if (status !== "authenticated") {
      router.push("/auth/login");
      return;
    }

    setPhase("uploading");
    setIsUploading(true);
    setUploadResult(null);

    try {
      const response = await checkImeiBatchApi(file, serviceId);

      if (!response.success) {
        throw new Error(response.message || "Failed to process IMEI batch.");
      }

      setUploadResult(response);
      setSelectedResultIndex(0);

      if (onBatchComplete) {
        onBatchComplete(response);
        handleClose();
        return;
      }

      setPhase("done");
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Upload failed. Please retry.";
      setValidationError(msg);
      setPhase("selected");
    } finally {
      setIsUploading(false);
    }
  };

  const resultRows = Array.isArray(uploadResult?.data) ? uploadResult.data : [];
  const selectedRow = resultRows[selectedResultIndex] ?? null;

  const overallStatus =
    uploadResult == null
      ? null
      : !uploadResult.success
        ? "none"
        : (uploadResult.summary?.failedCount ?? 0) === 0
          ? "success"
          : (uploadResult.summary?.successCount ?? 0) > 0
            ? "partial"
            : "none";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="bulk-imei-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            key="bulk-imei-panel"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-[32px] shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-lime-500 flex items-center justify-center shadow-md shadow-lime-500/30">
                    <Upload className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    Bulk IMEI Check
                  </h2>
                </div>
                <p className="text-sm font-medium text-slate-500 pl-[52px]">
                  Upload a <strong>.csv</strong>, <strong>.xlsx</strong>, or{" "}
                  <strong>.pdf</strong> with IMEIs — max {MAX_FILE_SIZE_MB} MB
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
              {/* ── DROP ZONE ── */}
              {(phase === "idle" || phase === "selected") && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-200 p-10 text-center
                    ${
                      isDragging
                        ? "border-lime-400 bg-lime-50/80 scale-[1.01]"
                        : file
                          ? "border-lime-300 bg-lime-50/40"
                          : "border-slate-200 bg-slate-50/60 hover:border-lime-300 hover:bg-lime-50/30"
                    }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_EXTENSIONS.join(",")}
                    className="sr-only"
                    onChange={handleFileInput}
                  />

                  <AnimatePresence mode="wait">
                    {file ? (
                      <motion.div
                        key="file-preview"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-lime-100 border border-lime-200 flex items-center justify-center">
                          <FileSpreadsheet className="w-8 h-8 text-lime-600" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm">
                            {file.name}
                          </p>
                          <p className="text-xs font-medium text-slate-400 mt-0.5">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                        <p className="text-xs font-bold text-lime-600">
                          Click or drop a new file to replace
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="drop-prompt"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex flex-col items-center gap-4"
                      >
                        <motion.div
                          animate={
                            isDragging
                              ? { scale: 1.15, rotate: -5 }
                              : { scale: 1, rotate: 0 }
                          }
                          className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center"
                        >
                          <Upload className="w-7 h-7 text-slate-400" />
                        </motion.div>
                        <div>
                          <p className="font-black text-slate-700">
                            Drop your file here
                          </p>
                          <p className="text-sm font-medium text-slate-400 mt-1">
                            or{" "}
                            <span className="text-lime-600 font-bold">
                              click to browse
                            </span>
                          </p>
                        </div>
                        <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                          CSV · XLSX · PDF
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── VALIDATION ERROR ── */}
              <AnimatePresence>
                {validationError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-red-600">
                      {validationError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── UPLOAD IN PROGRESS ── */}
              {phase === "uploading" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-6 py-10"
                >
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="none"
                        stroke="#84cc16"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="213.6"
                        initial={{ strokeDashoffset: 213.6 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{
                          duration: 2.4,
                          ease: "easeInOut",
                          repeat: Infinity,
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-7 h-7 text-lime-500 animate-spin" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-black text-slate-800">Scanning IMEIs…</p>
                    <p className="text-sm font-medium text-slate-400">
                      This may take a moment depending on the number of IMEIs.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── RESULTS ── */}
              <AnimatePresence>
                {phase === "done" && uploadResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Status banner */}
                    <div
                      className={`flex items-center gap-4 p-5 rounded-2xl border ${
                        overallStatus === "success"
                          ? "bg-lime-50 border-lime-200"
                          : overallStatus === "none"
                            ? "bg-red-50 border-red-200"
                            : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      {overallStatus === "success" && (
                        <CheckCircle2 className="w-8 h-8 text-lime-500 flex-shrink-0" />
                      )}
                      {overallStatus === "none" && (
                        <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                      )}
                      {overallStatus === "partial" && (
                        <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                      )}
                      <div>
                        <p
                          className={`font-black text-base ${
                            overallStatus === "success"
                              ? "text-lime-700"
                              : overallStatus === "none"
                                ? "text-red-700"
                                : "text-amber-700"
                          }`}
                        >
                          {overallStatus === "success"
                            ? "All IMEIs checked successfully!"
                            : overallStatus === "none"
                              ? "Processing complete (No valid IMEIs found)."
                              : "Batch check completed with some issues."}
                        </p>
                        <p
                          className={`text-sm font-medium mt-0.5 ${
                            overallStatus === "success"
                              ? "text-lime-600"
                              : overallStatus === "none"
                                ? "text-red-500"
                                : "text-amber-600"
                          }`}
                        >
                          {uploadResult.summary?.total ?? 0} IMEIs processed
                          from{" "}
                          {uploadResult.summary?.sourceFile ?? "uploaded file"}
                        </p>
                      </div>
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <SummaryCard
                        label="Total"
                        value={uploadResult.summary?.total ?? 0}
                        color="slate"
                        icon={
                          <FileSpreadsheet className="w-5 h-5 text-slate-500" />
                        }
                      />
                      <SummaryCard
                        label="Success"
                        value={uploadResult.summary?.successCount ?? 0}
                        color="lime"
                        icon={
                          <CheckCircle2 className="w-5 h-5 text-lime-500" />
                        }
                      />
                      <SummaryCard
                        label="Failed"
                        value={uploadResult.summary?.failedCount ?? 0}
                        color="red"
                        icon={<XCircle className="w-5 h-5 text-red-500" />}
                      />
                    </div>

                    {/* Result viewer */}
                    {selectedRow ? (
                      <div className="space-y-4">
                        <div className="rounded-[28px] border border-slate-100 bg-slate-50/70 p-4 md:p-5">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                                Results Breakdown
                              </h3>
                              <p className="mt-2 text-sm font-semibold text-slate-500">
                                Showing one IMEI result at a time for a cleaner
                                review flow.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                              <Select
                                value={String(selectedResultIndex)}
                                onValueChange={(value) =>
                                  setSelectedResultIndex(Number(value))
                                }
                              >
                                <SelectTrigger className="w-full min-w-[260px] rounded-xl border-slate-200 bg-white">
                                  <SelectValue placeholder="Select a result" />
                                </SelectTrigger>
                                <SelectContent>
                                  {resultRows.map((row, index) => (
                                    <SelectItem
                                      key={`${row.rowNumber}-${row.imei}-${index}`}
                                      value={String(index)}
                                    >
                                      {`Row ${row.rowNumber} - ${row.imei}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <button
                                onClick={() =>
                                  setSelectedResultIndex((current) =>
                                    Math.max(current - 1, 0),
                                  )
                                }
                                disabled={selectedResultIndex === 0}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                Prev
                              </button>

                              <button
                                onClick={() =>
                                  setSelectedResultIndex((current) =>
                                    Math.min(
                                      current + 1,
                                      resultRows.length - 1,
                                    ),
                                  )
                                }
                                disabled={
                                  selectedResultIndex === resultRows.length - 1
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Next
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${selectedRow.rowNumber}-${selectedRow.imei}-${selectedResultIndex}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                          >
                            {selectedRow.ok && selectedRow.data ? (
                              <ImeiReportDetails
                                result={selectedRow.data}
                                heading="Reports"
                                caption="Batch results are presented one report at a time so each scan stays readable."
                                meta={{
                                  provider: selectedRow.provider,
                                  serviceId: selectedRow.serviceId,
                                  cached: selectedRow.cached,
                                  message: selectedRow.message,
                                  rowNumber: selectedResultIndex + 1,
                                  totalRows: resultRows.length,
                                }}
                              />
                            ) : (
                              <div className="rounded-[32px] border border-red-100 bg-red-50 p-8">
                                <div className="flex items-start gap-3">
                                  <XCircle className="mt-0.5 h-6 w-6 text-red-500" />
                                  <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">
                                      Failed Result
                                    </p>
                                    <h4 className="mt-2 text-xl font-black text-red-700">
                                      Row {selectedRow.rowNumber} could not be
                                      processed
                                    </h4>
                                    <p className="mt-3 text-sm font-semibold text-red-600">
                                      {selectedRow.message}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                  <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-400">
                                      Row
                                    </p>
                                    <p className="mt-2 text-sm font-bold text-slate-900">
                                      {selectedRow.rowNumber}
                                    </p>
                                  </div>
                                  <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-400">
                                      IMEI
                                    </p>
                                    <p className="mt-2 text-sm font-bold text-slate-900 break-all">
                                      {selectedRow.imei}
                                    </p>
                                  </div>
                                  <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-400">
                                      Service ID
                                    </p>
                                    <p className="mt-2 text-sm font-bold text-slate-900">
                                      {selectedRow.serviceId ?? "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── TEMPLATE HINT ── */}
              {phase === "idle" && (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-xs font-bold text-slate-500">
                    Need a template?{" "}
                    <span className="text-slate-400 font-medium">
                      Ensure your file has an{" "}
                      <code className="bg-white border border-slate-200 px-1 rounded text-slate-600 font-bold">
                        imei
                      </code>{" "}
                      column. Max 20 IMEIs per file.
                    </span>
                  </p>
                  <Download className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </div>
              )}
            </div>

            {/* ── FOOTER ── */}
            <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between gap-4 flex-shrink-0 bg-white">
              {phase === "done" ? (
                <>
                  <button
                    onClick={resetState}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-black text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Check another batch
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-8 py-2.5 bg-[#84CC16] text-white font-black rounded-xl hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 active:scale-95"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 text-sm font-black text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="flex items-center gap-2 px-8 py-2.5 bg-[#84CC16] text-white font-black rounded-xl hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking…
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" strokeWidth={2.5} />
                        Start Batch Check
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
