"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ShieldCheck,
  Zap,
  Lock,
  Loader2,
  QrCode,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Download,
  Cpu,
  Wallet,
  ChevronDown,
  Upload,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  checkIMEIApi,
  getServicesApi,
} from "../../scanDevice/api/scanDevice.api";
import {
  BatchImeiResponse,
  IMEIResult,
  IMEIService,
  ServiceCategory,
} from "../../scanDevice/types/scanDevice.types";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { ScannerModal } from "@/components/shared/website/ScannerModal";
import { BulkImeiUploadModal } from "@/components/shared/website/BulkImeiUploadModal";
import { ImeiReportDetails } from "./ImeiReportDetails";
import {
  CertificatePDF,
  CERTIFICATE_PDF_HEIGHT,
  CERTIFICATE_PDF_WIDTH,
} from "./CertificatePDF";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LAST_REPORT_STORAGE_KEY = "imoscan:last-report:v1";

type PersistedReportState = {
  version: 1;
  mode: "single" | "bulk";
  savedAt: string;
  singleResult?: IMEIResult | null;
  singleMeta?: {
    provider?: string;
    serviceId?: number;
  };
  batchResult?: BatchImeiResponse | null;
  selectedBatchIndex?: number;
};

export default function ScanDevice() {
  const [imei, setImei] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<IMEIResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    [],
  );
  const [services, setServices] = useState<IMEIService[]>([]);
  const [selectedService, setSelectedService] = useState<IMEIService | null>(
    null,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchImeiResponse | null>(
    null,
  );
  const [selectedBatchIndex, setSelectedBatchIndex] = useState(0);
  const [singleReportMeta, setSingleReportMeta] = useState<{
    provider?: string;
    serviceId?: number;
  } | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServicesApi();
        if (response.success && response.data) {
          setServiceCategories(response.data);
          const allServices = response.data.flatMap((cat) => cat.services);
          setServices(allServices);

          // Initial selection based on query or default
          const queryServiceId = searchParams.get("serviceId");
          if (queryServiceId) {
            const found = allServices.find(
              (s) => s.serviceId === parseInt(queryServiceId),
            );
            if (found) setSelectedService(found);
          } else {
            const found =
              allServices.find((s) => s.serviceId === 6) || allServices[0];
            if (found) setSelectedService(found);
          }
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };
    fetchServices();
  }, [searchParams]);

  useEffect(() => {
    const queryImei = searchParams.get("imei");
    const queryServiceId = searchParams.get("serviceId");

    if (queryImei) {
      setImei(queryImei);
    }
    if (queryServiceId && services.length > 0) {
      const found = services.find(
        (s) => s.serviceId === parseInt(queryServiceId),
      );
      if (found) setSelectedService(found);
    }
  }, [searchParams, services]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(LAST_REPORT_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as PersistedReportState;
      if (!parsed || parsed.version !== 1) return;

      if (parsed.mode === "single" && parsed.singleResult) {
        setScanResult(parsed.singleResult);
        setBatchResult(null);
        setSingleReportMeta(parsed.singleMeta ?? null);
        return;
      }

      if (parsed.mode === "bulk" && parsed.batchResult) {
        setBatchResult(parsed.batchResult);
        setScanResult(null);
        setSingleReportMeta(null);
        const maxIndex = Math.max(
          0,
          (parsed.batchResult.data?.length ?? 1) - 1,
        );
        setSelectedBatchIndex(
          Math.min(Math.max(parsed.selectedBatchIndex ?? 0, 0), maxIndex),
        );
      }
    } catch (error) {
      console.error("Failed to restore last IMEI report:", error);
      window.localStorage.removeItem(LAST_REPORT_STORAGE_KEY);
    }
  }, []);

  const steps = [
    { id: 1, label: "Fetching Data", progress: 100 },
    { id: 2, label: "Analyzing Components", progress: 100 },
    { id: 3, label: "Generating Report", progress: 100 },
  ];

  const handleScan = useCallback(
    async (manualImei?: string) => {
      const imeiToScan = manualImei || imei;
      if (!imeiToScan || !selectedService) return;
      setIsScanning(true);
      setScanResult(null);
      setBatchResult(null);
      setError(null);
      setCurrentStep(1);

      try {
        // Simulate progress steps
        setTimeout(() => setCurrentStep(2), 1500);
        setTimeout(() => setCurrentStep(3), 3000);

        const response = await checkIMEIApi(
          imeiToScan,
          selectedService.serviceId || 6,
        );

        if (response.success && response.data) {
          // Wait for animations to finish before showing results
          setTimeout(() => {
            setScanResult(response.data!);
            setSingleReportMeta({
              provider: selectedService?.name,
              serviceId: selectedService?.serviceId ?? undefined,
            });
            setIsScanning(false);
          }, 4500);
        } else {
          setError(response.message || "Failed to check IMEI");
          setIsScanning(false);
        }
      } catch (err: unknown) {
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setError(
          error.response?.data?.message ||
            error.message ||
            "Something went wrong",
        );
        setIsScanning(false);
      }
    },
    [imei, selectedService],
  );

  // A separate effect to trigger scan once imei is set from query
  useEffect(() => {
    const queryImei = searchParams.get("imei");
    const queryServiceId = searchParams.get("serviceId") || "6";

    if (
      queryImei &&
      imei === queryImei &&
      selectedService?.serviceId === parseInt(queryServiceId) &&
      !isScanning &&
      !scanResult
    ) {
      handleScan();
    }
  }, [imei, selectedService, searchParams, handleScan, isScanning, scanResult]);

  useEffect(() => {
    if (typeof window === "undefined" || !scanResult) return;

    const payload: PersistedReportState = {
      version: 1,
      mode: "single",
      savedAt: new Date().toISOString(),
      singleResult: scanResult,
      singleMeta: singleReportMeta ?? undefined,
    };

    window.localStorage.setItem(
      LAST_REPORT_STORAGE_KEY,
      JSON.stringify(payload),
    );
  }, [scanResult, singleReportMeta]);

  useEffect(() => {
    if (typeof window === "undefined" || !batchResult) return;

    const payload: PersistedReportState = {
      version: 1,
      mode: "bulk",
      savedAt: new Date().toISOString(),
      batchResult,
      selectedBatchIndex,
    };

    window.localStorage.setItem(
      LAST_REPORT_STORAGE_KEY,
      JSON.stringify(payload),
    );
  }, [batchResult, selectedBatchIndex]);

  const downloadCertificatePdf = useCallback(
    async (elementIds: string[], filename: string) => {
      if (elementIds.length === 0) return;
      setIsDownloading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 400));

        const styleSheets = Array.from(
          document.querySelectorAll("style, link[rel='stylesheet']"),
        ) as (HTMLStyleElement | HTMLLinkElement)[];
        const originalMedias = styleSheets.map((s) => s.media || "");

        styleSheets.forEach((s) => (s.media = "none"));

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [CERTIFICATE_PDF_WIDTH, CERTIFICATE_PDF_HEIGHT],
        });

        try {
          for (let index = 0; index < elementIds.length; index += 1) {
            const element = document.getElementById(elementIds[index]);
            if (!element) {
              throw new Error(
                `Certificate element "${elementIds[index]}" not found in DOM`,
              );
            }

            const canvas = await html2canvas(element, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: "#ffffff",
              width: CERTIFICATE_PDF_WIDTH,
              height: CERTIFICATE_PDF_HEIGHT,
            });

            const imgData = canvas.toDataURL("image/png", 1.0);

            if (index > 0) {
              pdf.addPage(
                [CERTIFICATE_PDF_WIDTH, CERTIFICATE_PDF_HEIGHT],
                "portrait",
              );
            }

            pdf.addImage(
              imgData,
              "PNG",
              0,
              0,
              CERTIFICATE_PDF_WIDTH,
              CERTIFICATE_PDF_HEIGHT,
            );
          }
        } finally {
          styleSheets.forEach((s, i) => (s.media = originalMedias[i]));
        }

        pdf.save(filename);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Certificate PDF generation failed:", error);
        alert(
          `Failed to generate certificate PDF: ${error.message || "Unknown error"}.`,
        );
      } finally {
        setIsDownloading(false);
      }
    },
    [],
  );

  const handleDownloadSingleCertificate = useCallback(() => {
    if (!scanResult) return;
    void downloadCertificatePdf(
      ["certificate-pdf-single"],
      `Certificate_${scanResult.imei}.pdf`,
    );
  }, [downloadCertificatePdf, scanResult]);

  const batchRows = Array.isArray(batchResult?.data) ? batchResult.data : [];
  const successfulBatchRows = batchRows.filter(
    (row): row is typeof row & { data: IMEIResult } =>
      Boolean(row.ok && row.data),
  );
  const selectedBatchRow = batchRows[selectedBatchIndex] ?? null;

  const handleDownloadSelectedBulkCertificate = useCallback(() => {
    if (!selectedBatchRow?.ok || !selectedBatchRow.data) return;
    void downloadCertificatePdf(
      [`certificate-pdf-bulk-${selectedBatchIndex}`],
      `Certificate_${selectedBatchRow.imei}.pdf`,
    );
  }, [downloadCertificatePdf, selectedBatchIndex, selectedBatchRow]);

  const handleDownloadAllBulkCertificates = useCallback(() => {
    if (successfulBatchRows.length === 0) return;
    void downloadCertificatePdf(
      successfulBatchRows.map(
        (_, index) => `certificate-pdf-bulk-success-${index}`,
      ),
      `Bulk_IMEI_Certificates_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  }, [downloadCertificatePdf, successfulBatchRows]);

  if (scanResult) {
    return (
      <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-8 font-poppins">
        {/* Back Button */}
        <button
          onClick={() => {
            setScanResult(null);
            setSingleReportMeta(null);
          }}
          className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] font-bold transition group cursor-pointer"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Scan another device
        </button>

        {/* Header Section: Main Info & AI Insight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-1">
                  {scanResult.deviceName}
                </h1>
                <p className="text-[#64748B] font-bold text-sm">
                  IMEI: {scanResult.imei}
                </p>
              </div>
              <span className="px-6 py-2 bg-[#3B82F6] text-white text-[12px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20">
                {scanResult.deviceStatus}
              </span>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                    Risk Meter
                  </span>
                  <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                    {scanResult.riskMeter.score}/100
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-1000"
                    style={{ width: `${scanResult.riskMeter.score}%` }}
                  />
                </div>
                <p className="text-sm font-bold text-[#0F172A]">
                  {scanResult.riskMeter.label}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">
                  Market Value
                </p>
                <p className="text-3xl font-black text-[#0F172A]">
                  ${scanResult.marketValue.amount.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* AI Insight Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#F8FAFC] rounded-[32px] p-8 border border-gray-100 flex flex-col gap-6"
          >
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Zap size={18} className="text-[#0F172A]" />
              </div>
              <span className="text-[12px] font-black text-[#0F172A] uppercase tracking-widest">
                {scanResult.aiInsight.title}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex-1">
              <p className="text-[#64748B] text-[13px] font-semibold leading-relaxed italic">
                &quot;{scanResult.aiInsight.message}&quot;
              </p>
            </div>
          </motion.div>
        </div>

        {/* Middle Section: Check Cards & Report Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              Object.values(scanResult.checks) as Array<{
                title: string;
                description: string;
                status: string;
              }>
            ).map((check, i) => (
              <motion.div
                key={check.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white rounded-[24px] p-6 border border-gray-100 flex items-center justify-between group hover:border-[#84CC16]/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${check.status === "passed" ? "bg-[#84CC16]/10 text-[#84CC16]" : "bg-red-50 text-red-500"}`}
                  >
                    {check.title === "Global Blacklist" && (
                      <ShieldCheck size={20} />
                    )}
                    {check.title === "Carrier Financing" && (
                      <Wallet size={20} />
                    )}
                    {check.title === "Hardware Lock" && <Lock size={20} />}
                    {check.title === "Part Authenticity" && <Cpu size={20} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0F172A]">
                      {check.title}
                    </h3>
                    <p className="text-[12px] font-medium text-[#64748B]">
                      {check.description}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${check.status === "passed" ? "bg-[#84CC16] text-white" : "bg-red-500 text-white"}`}
                >
                  {check.status === "passed" ? (
                    <Check size={14} strokeWidth={4} />
                  ) : (
                    <AlertTriangle size={14} strokeWidth={4} />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-[32px] p-8 border border-gray-100 space-y-4"
          >
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
              Report Actions
            </span>
            <div className="space-y-3">
              <button className="w-full py-4 rounded-xl border-2 border-[#84CC16] text-[#84CC16] font-black text-sm hover:bg-[#84CC16]/5 transition flex items-center justify-center gap-2 cursor-pointer">
                <FileText size={18} />
                Create Smart Invoice
              </button>
              <button
                onClick={handleDownloadSingleCertificate}
                disabled={isDownloading}
                className="w-full py-4 rounded-xl bg-[#84CC16] text-white font-black text-sm hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
              >
                {isDownloading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                {isDownloading ? "Generating..." : "Download PDF Certificate"}
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-sm"
        >
          <h2 className="text-xl font-black text-[#0F172A] mb-10">
            Technical Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8">
            {[
              {
                label: "Processor",
                value: scanResult.technicalBreakdown.processor,
              },
              {
                label: "Battery Health",
                value: scanResult.technicalBreakdown.batteryHealth.label,
              },
              {
                label: "Storage",
                value: scanResult.technicalBreakdown.storage.label,
              },
              {
                label: "Modem",
                value: scanResult.technicalBreakdown.modem,
              },
              {
                label: "Display",
                value: scanResult.technicalBreakdown.display,
              },
              {
                label: "Warranty",
                value: scanResult.technicalBreakdown.warranty.label,
              },
              {
                label: "Origin",
                value: scanResult.technicalBreakdown.origin.label,
              },
              {
                label: "Activation",
                value: scanResult.technicalBreakdown.activation.label,
              },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest block">
                  {item.label}
                </span>
                <p
                  className="text-sm font-bold text-[#0F172A] truncate"
                  title={item.value}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <ImeiReportDetails
            result={scanResult}
            caption="The scan response is organized into readable report fields for quick review."
            meta={{
              provider: singleReportMeta?.provider || selectedService?.name,
              serviceId:
                singleReportMeta?.serviceId ??
                selectedService?.serviceId ??
                undefined,
              message: "Single IMEI check completed successfully.",
            }}
          />
        </motion.div>

        <div
          id="certificate-pdf-single-container"
          style={{
            position: "fixed",
            top: 0,
            left: "-10000px",
            width: `${CERTIFICATE_PDF_WIDTH}px`,
            minHeight: `${CERTIFICATE_PDF_HEIGHT}px`,
            backgroundColor: "white",
            pointerEvents: "none",
            zIndex: -1,
            overflow: "hidden",
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 md:p-10 bg-background space-y-12 mx-auto  font-poppins">
      <div className=" space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-black text-foreground tracking-tight"
        >
          Scan Device
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg font-medium   leading-relaxed"
        >
          Enter your device details for a comprehensive security and diagnostic
          analysis.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full bg-card  rounded-[40px] p-6 md:p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-border"
      >
        <div className="space-y-8">
          <div className="relative">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block ml-4">
              Select Diagnostic Service
            </span>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isScanning}
              className="w-full flex items-center justify-between px-8 py-5 rounded-3xl border dark:bg-white hover:border-[#84CC16]/30 transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex flex-col items-start">
                <span className="text-lg font-black text-[#0F172A] group-hover:text-[#84CC16] transition-colors">
                  {selectedService ? selectedService.name : "Select Service"}
                </span>
                {selectedService && (
                  <span className="text-[12px] font-bold text-[#84CC16]">
                    Price: {selectedService.priceLabel}
                  </span>
                )}
              </div>
              <ChevronDown
                size={24}
                className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 right-0 mt-4 bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden z-[100] max-h-[400px] overflow-y-auto custom-scrollbar p-3"
                >
                  {serviceCategories.map((cat) => (
                    <div key={cat.category} className="mb-4 last:mb-0">
                      <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-2">
                        {cat.category}
                      </div>
                      {cat.services.map((svc) => (
                        <button
                          key={svc._id}
                          onClick={() => {
                            setSelectedService(svc);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex flex-col items-start p-4 rounded-2xl transition-all mb-1 ${
                            selectedService?._id === svc._id
                              ? "bg-[#84CC16]/10 border-2 border-[#84CC16]/20"
                              : "hover:bg-gray-50 border-2 border-transparent"
                          }`}
                        >
                          <span
                            className={`text-[15px] font-black text-left ${
                              selectedService?._id === svc._id
                                ? "text-[#84CC16]"
                                : "text-[#0F172A]"
                            }`}
                          >
                            {svc.name}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                              Price:
                            </span>
                            <span className="text-[12px] font-black text-[#84CC16]">
                              {svc.priceLabel}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative group">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-4">
              Device Identifier
            </span>
            <input
              type="text"
              placeholder="Enter IMEI / Serial Number"
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              disabled={isScanning}
              className="w-full px-8 py-6 rounded-full border border-gray-100 bg-[#FBFBFB] focus:border-[#84CC16] focus:bg-white focus:ring-4 focus:ring-[#84CC16]/5 outline-none transition-all text-lg font-semibold text-[#0F172A] placeholder:text-gray-400 disabled:opacity-50"
            />
            <button
              onClick={() => setIsScannerOpen(true)}
              disabled={isScanning}
              title="Scan Barcode/QR"
              className="absolute right-6 top-[70%] -translate-y-1/2 p-2 text-gray-400 hover:text-[#84CC16] hover:bg-[#84CC16]/5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <QrCode size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleScan()}
              disabled={isScanning || !imei || !selectedService}
              className="w-full bg-[#84CC16] hover:bg-[#76b813] text-white font-black py-4 rounded-full shadow-lg shadow-lime-500/20 transition-all text-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Scanning...
                </>
              ) : (
                "Scan Now"
              )}
            </button>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              disabled={isScanning}
              className="w-full bg-white border-2 border-gray-100 text-[#0F172A] hover:border-[#84CC16]/30 hover:bg-gray-50 font-black py-4 rounded-full transition-all text-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Upload size={24} />
              Bulk Check
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
                    <span className="text-[13px] font-black text-[#84CC16] tracking-widest uppercase">
                      AI Analyzing...
                    </span>
                  </div>
                  <span className="text-[13px] font-bold text-gray-300 tracking-wider">
                    Session ID: IMS-482-901
                  </span>
                </div>

                <div className="space-y-8 pt-6">
                  {steps.map((step, index) => {
                    const status =
                      index + 1 < currentStep
                        ? "COMPLETED"
                        : index + 1 === currentStep
                          ? "IN PROGRESS"
                          : "PENDING";
                    return (
                      <div key={step.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${status === "COMPLETED" ? "border-[#84CC16] bg-[#84CC16]/5" : status === "IN PROGRESS" ? "border-[#84CC16] bg-white" : "border-gray-100 bg-white"}`}
                            >
                              {status === "COMPLETED" ? (
                                <Check size={18} className="text-[#84CC16]" />
                              ) : status === "IN PROGRESS" ? (
                                <div className="w-2 h-2 rounded-full bg-[#84CC16]" />
                              ) : (
                                <span className="text-gray-300 text-sm font-bold">
                                  {step.id}
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-[17px] font-bold transition-colors ${status === "PENDING" ? "text-gray-300" : "text-[#0F172A]"}`}
                            >
                              {step.id}. {step.label}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] font-black tracking-widest uppercase transition-colors ${status === "COMPLETED" ? "text-[#84CC16]" : status === "IN PROGRESS" ? "text-[#84CC16] animate-pulse" : "text-gray-200"}`}
                          >
                            {status}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden ml-14">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width:
                                status === "COMPLETED"
                                  ? "100%"
                                  : status === "IN PROGRESS"
                                    ? "65%"
                                    : "0%",
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${status === "PENDING" ? "bg-gray-100" : "bg-[#84CC16]"}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {!isScanning && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pb-10">
          {[
            {
              title: "Global Database",
              desc: "Verified against 140+ global carrier and stolen device registries.",
              icon: <ShieldCheck size={20} className="text-[#0F172A]" />,
              color: "bg-[#E0EEFF]",
            },
            {
              title: "Instant Results",
              desc: "Neural processing ensures reports are generated in under 12 seconds.",
              icon: <Zap size={20} className="text-[#0F172A]" />,
              color: "bg-[#F0E8FF]",
            },
            {
              title: "Private & Secure",
              desc: "End-to-end encrypted scans with zero data retention for unpaid tiers.",
              icon: <Lock size={20} className="text-[#0F172A]" />,
              color: "bg-[#F0FDCF]",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={`${feature.color} p-8 rounded-[32px] space-y-4 hover:scale-[1.02] transition-transform cursor-default`}
            >
              <div className="w-10 h-10 flex items-center">{feature.icon}</div>
              <h3 className="text-xl font-black text-[#0F172A] tracking-tight">
                {feature.title}
              </h3>
              <p className="text-[#0F172A]/60 text-sm font-semibold leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(scannedImei) => {
          setImei(scannedImei);
          // Automatically trigger scan if service is selected
          if (selectedService) {
            handleScan(scannedImei);
          }
        }}
      />
      <BulkImeiUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        serviceId={selectedService?.serviceId || 6}
        onBatchComplete={(result) => {
          setScanResult(null);
          setBatchResult(result);
          setSelectedBatchIndex(0);
          setSingleReportMeta(null);
          setError(null);
        }}
      />

      {batchResult && selectedBatchRow && (
        <div className="w-full space-y-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-gray-100 bg-white p-6 md:p-8 shadow-sm"
          >
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#84CC16]">
                  Reports
                </p>
                <h2 className="mt-2 text-2xl md:text-3xl font-black text-[#0F172A]">
                  Bulk IMEI Scan Results
                </h2>
                <p className="mt-2 text-sm font-medium text-[#64748B] max-w-2xl">
                  Results are rendered directly on this page and organized one
                  at a time for easier review.
                </p>
              </div>

              <button
                onClick={() => {
                  setBatchResult(null);
                  setSelectedBatchIndex(0);
                  if (typeof window !== "undefined") {
                    window.localStorage.removeItem(LAST_REPORT_STORAGE_KEY);
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-black text-[#64748B] transition hover:bg-gray-50 hover:text-[#0F172A]"
              >
                Clear Results
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-slate-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Total
                  </span>
                </div>
                <p className="mt-3 text-2xl font-black text-slate-900">
                  {batchResult.summary?.total ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border border-lime-100 bg-lime-50 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-lime-600" />
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-lime-700">
                    Success
                  </span>
                </div>
                <p className="mt-3 text-2xl font-black text-lime-700">
                  {batchResult.summary?.successCount ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-red-600">
                    Failed
                  </span>
                </div>
                <p className="mt-3 text-2xl font-black text-red-600">
                  {batchResult.summary?.failedCount ?? 0}
                </p>
              </div>
            </div>

            {successfulBatchRows.length > 0 ? (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleDownloadAllBulkCertificates}
                  disabled={isDownloading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-5 py-3 text-sm font-black text-white transition hover:bg-[#76b813] disabled:cursor-wait disabled:opacity-70"
                >
                  {isDownloading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  Download All Certificates
                </button>
              </div>
            ) : null}

            <div className="mt-6 rounded-[28px] border border-gray-100 bg-[#F8FAFC] p-4 md:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#94A3B8]">
                    Navigate Results
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-[#64748B]">
                    Use the selector or next and previous controls to inspect
                    each IMEI report.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                  <Select
                    value={String(selectedBatchIndex)}
                    onValueChange={(value) =>
                      setSelectedBatchIndex(Number(value))
                    }
                  >
                    <SelectTrigger className="w-full min-w-[260px] rounded-xl border-slate-200 bg-white">
                      <SelectValue placeholder="Select a result" />
                    </SelectTrigger>
                    <SelectContent>
                      {batchRows.map((row, index) => (
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
                      setSelectedBatchIndex((current) =>
                        Math.max(current - 1, 0),
                      )
                    }
                    disabled={selectedBatchIndex === 0}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>

                  <button
                    onClick={() =>
                      setSelectedBatchIndex((current) =>
                        Math.min(current + 1, batchRows.length - 1),
                      )
                    }
                    disabled={selectedBatchIndex === batchRows.length - 1}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {selectedBatchRow.ok && selectedBatchRow.data ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={handleDownloadSelectedBulkCertificate}
                    disabled={isDownloading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-[#0F172A] transition hover:bg-gray-50 disabled:cursor-wait disabled:opacity-70"
                  >
                    {isDownloading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    Download This Certificate
                  </button>
                </div>
                <ImeiReportDetails
                  result={selectedBatchRow.data}
                  caption="Provider data is used as the primary source and organized into a clean report."
                  meta={{
                    provider: selectedBatchRow.provider,
                    serviceId: selectedBatchRow.serviceId,
                    cached: selectedBatchRow.cached,
                    message: selectedBatchRow.message,
                    rowNumber: selectedBatchIndex + 1,
                    totalRows: batchRows.length,
                  }}
                />
              </div>
            ) : (
              <div className="rounded-[32px] border border-red-100 bg-red-50 p-8 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">
                  Failed Result
                </p>
                <h3 className="mt-2 text-2xl font-black text-red-700">
                  Row {selectedBatchRow.rowNumber} could not be processed
                </h3>
                <p className="mt-3 text-sm font-semibold text-red-600">
                  {selectedBatchRow.message}
                </p>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-400">
                      Row
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {selectedBatchRow.rowNumber}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-400">
                      IMEI
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900 break-all">
                      {selectedBatchRow.imei}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-400">
                      Service ID
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {selectedBatchRow.serviceId ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <div
            style={{
              position: "fixed",
              top: 0,
              left: "-10000px",
              width: `${CERTIFICATE_PDF_WIDTH}px`,
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
            {selectedBatchRow?.ok && selectedBatchRow.data ? (
              <CertificatePDF
                key={`selected-bulk-certificate-${selectedBatchIndex}`}
                data={selectedBatchRow.data}
                id={`certificate-pdf-bulk-${selectedBatchIndex}`}
                providerName={selectedBatchRow.provider}
                serviceId={selectedBatchRow.serviceId}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
