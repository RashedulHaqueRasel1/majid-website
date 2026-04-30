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
  Smartphone,
  Cpu,
  Battery,
  HardDrive,
  Globe,
  Radio,
  History,
  BadgeCheck,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  checkIMEIApi,
  getServicesApi,
} from "../../scanDevice/api/scanDevice.api";
import {
  IMEIResult,
  IMEIService,
} from "../../scanDevice/types/scanDevice.types";
import { CertificatePDF } from "./CertificatePDF";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function ScanDevice() {
  const [imei, setImei] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<IMEIResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [services, setServices] = useState<IMEIService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("6");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServicesApi();
        if (
          response.success &&
          response.data &&
          response.data["Service List"]
        ) {
          setServices(response.data["Service List"]);
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const queryImei = searchParams.get("imei");
    const queryServiceId = searchParams.get("serviceId");

    if (queryImei) {
      setImei(queryImei);
    }
    if (queryServiceId) {
      setSelectedServiceId(queryServiceId);
    }
  }, [searchParams]);

  // A separate effect to trigger scan once imei is set from query
  useEffect(() => {
    const queryImei = searchParams.get("imei");
    const queryServiceId = searchParams.get("serviceId") || "6";

    if (
      queryImei &&
      imei === queryImei &&
      selectedServiceId === queryServiceId &&
      !isScanning &&
      !scanResult
    ) {
      handleScan();
    }
  }, [imei, selectedServiceId, searchParams]);

  const steps = [
    { id: 1, label: "Fetching Data", progress: 100 },
    { id: 2, label: "Analyzing Components", progress: 100 },
    { id: 3, label: "Generating Report", progress: 100 },
  ];

  const handleScan = async () => {
    if (!imei) return;
    setIsScanning(true);
    setScanResult(null);
    setError(null);
    setCurrentStep(1);

    try {
      // Simulate progress steps
      setTimeout(() => setCurrentStep(2), 1500);
      setTimeout(() => setCurrentStep(3), 3000);

      const response = await checkIMEIApi(imei, parseInt(selectedServiceId));

      if (response.success && response.data) {
        // Wait for animations to finish before showing results
        setTimeout(() => {
          setScanResult(response.data!);
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
  };

  const handleDownloadPDF = async () => {
    if (!scanResult) return;
    setIsDownloading(true);

    try {
      console.log("Starting PDF generation process...");

      // Wait for elements to be ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const element = document.getElementById("certificate-pdf-container");
      if (!element) {
        throw new Error(
          "Target element 'certificate-pdf-container' not found in DOM",
        );
      }

      // FINAL REMEDY for oklch error:
      // html2canvas parses all stylesheets in the document. Tailwind v4's oklch colors crash it.
      // We temporarily disable all stylesheets on the main document just for the capture.
      // Since our CertificatePDF uses 100% inline HEX styles, it will still render perfectly.
      const styleSheets = Array.from(
        document.querySelectorAll("style, link[rel='stylesheet']"),
      ) as (HTMLStyleElement | HTMLLinkElement)[];
      const originalMedias = styleSheets.map((s) => s.media || "");

      console.log(
        `Temporarily disabling ${styleSheets.length} stylesheets to avoid oklch error...`,
      );
      styleSheets.forEach((s) => (s.media = "none"));

      let canvas;
      try {
        canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: "#ffffff",
          width: 800,
          height: 1120,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById(
              "certificate-pdf-container",
            );
            if (clonedElement) {
              clonedElement.style.opacity = "1";
              clonedElement.style.visibility = "visible";
              clonedElement.style.position = "static";
              clonedElement.style.display = "block";
              clonedElement.style.backgroundColor = "#ffffff";
            }
          },
        });
      } finally {
        // RESTORE stylesheets immediately
        console.log("Restoring stylesheets...");
        styleSheets.forEach((s, i) => (s.media = originalMedias[i]));
      }

      if (!canvas) throw new Error("Canvas capture failed");

      console.log("Canvas captured successfully. Generating PDF...");
      const imgData = canvas.toDataURL("image/png", 1.0);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [800, 1120],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 800, 1120);
      pdf.save(`Certificate_${scanResult.imei}.pdf`);
      console.log("PDF saved successfully.");
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Detailed PDF Generation Error:", error);
      alert(
        `Failed to generate PDF: ${error.message || "Unknown error"}. Please check the console for details.`,
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (scanResult) {
    return (
      <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-8 font-poppins">
        {/* Back Button */}
        <button
          onClick={() => setScanResult(null)}
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
          {/* Check Cards Grid */}
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

          {/* Report Actions Card */}
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
                onClick={handleDownloadPDF}
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

        {/* Bottom Section: Technical Breakdown */}
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
                icon: <Cpu size={16} />,
              },
              {
                label: "Battery Health",
                value: scanResult.technicalBreakdown.batteryHealth.label,
                icon: <Battery size={16} />,
              },
              {
                label: "Storage",
                value: scanResult.technicalBreakdown.storage.label,
                icon: <HardDrive size={16} />,
              },
              {
                label: "Modem",
                value: scanResult.technicalBreakdown.modem,
                icon: <Globe size={16} />,
              },
              {
                label: "Display",
                value: scanResult.technicalBreakdown.display,
                icon: <Smartphone size={16} />,
              },
              {
                label: "Warranty",
                value: scanResult.technicalBreakdown.warranty.label,
                icon: <History size={16} />,
              },
              {
                label: "Origin",
                value: scanResult.technicalBreakdown.origin.label,
                icon: <Radio size={16} />,
              },
              {
                label: "Activation",
                value: scanResult.technicalBreakdown.activation.label,
                icon: <BadgeCheck size={16} />,
              },
            ].map((item, i) => (
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

        {/* Hidden Certificate for PDF Capture - Keep it in DOM but invisible */}
        <div
          id="certificate-pdf-container"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "800px",
            height: "1120px",
            backgroundColor: "white",
            pointerEvents: "none",
            zIndex: -9999,
            opacity: 0,
            visibility: "hidden",
            overflow: "hidden",
          }}
        >
          <CertificatePDF
            data={scanResult}
            id="certificate-pdf"
            ref={certificateRef}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 md:p-10 flex flex-col items-center justify-center space-y-12 max-w-4xl mx-auto font-poppins">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight"
        >
          Scan Device
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[#64748B] text-lg font-medium max-w-md mx-auto leading-relaxed"
        >
          Enter your device details for a comprehensive security and diagnostic
          analysis.
        </motion.p>
      </div>

      {/* Main Scan Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full bg-white rounded-[40px] p-6 md:p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-gray-100"
      >
        <div className="space-y-8">
          {/* Service Selection Section */}
          <div className="relative">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-4">
              Select Diagnostic Service
            </span>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isScanning}
              className="w-full flex items-center justify-between px-8 py-5 rounded-3xl border border-gray-100 bg-[#FBFBFB] hover:bg-white hover:border-[#84CC16]/30 transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex flex-col items-start">
                <span className="text-lg font-black text-[#0F172A] group-hover:text-[#84CC16] transition-colors">
                  {services.find((s) => s.service === selectedServiceId)
                    ?.name || "Select Service"}
                </span>
                <span className="text-[12px] font-bold text-[#84CC16]">
                  Price: $
                  {services.find((s) => s.service === selectedServiceId)
                    ?.price || "0.00"}
                </span>
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
                  {services.map((svc) => (
                    <button
                      key={svc.service}
                      onClick={() => {
                        setSelectedServiceId(svc.service);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex flex-col items-start p-4 rounded-2xl transition-all mb-1 ${
                        selectedServiceId === svc.service
                          ? "bg-[#84CC16]/10 border-2 border-[#84CC16]/20"
                          : "hover:bg-gray-50 border-2 border-transparent"
                      }`}
                    >
                      <span
                        className={`text-[15px] font-black text-left ${
                          selectedServiceId === svc.service
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
                          ${svc.price}
                        </span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Section */}
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
            <div className="absolute right-6 top-[70%] -translate-y-1/2 p-2 text-gray-400">
              <QrCode size={24} />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleScan}
            disabled={isScanning || !imei}
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

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold text-center">
              {error}
            </div>
          )}

          {/* Analysis Status Section (Visible only when scanning) */}
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

                {/* Progress Steps */}
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
                        {/* Progress Bar */}
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

      {/* Feature Cards (Hidden when scanning) */}
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
    </div>
  );
}
