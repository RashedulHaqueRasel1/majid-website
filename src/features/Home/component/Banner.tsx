"use client";

import {
  Search,
  ChevronDown,
  QrCode,
  LogIn,
  X,
  Info,
  Check,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getServicesApi } from "@/features/shopkeeper/scanDevice/api/scanDevice.api";
import {
  IMEIService,
  ServiceCategory,
} from "@/features/shopkeeper/scanDevice/types/scanDevice.types";
import { ScannerModal } from "@/components/shared/website/ScannerModal";
import { BulkImeiUploadModal } from "@/components/shared/website/BulkImeiUploadModal";

export default function Banner() {
  const [imei, setImei] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
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
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServicesApi();
        if (response.success && response.data) {
          setServiceCategories(response.data);
          // Flatten for initial selection or fallback
          const allServices = response.data.flatMap((cat) => cat.services);
          setServices(allServices);
          if (allServices.length > 0) {
            setSelectedService(
              allServices.find((s) => s.serviceId === 6) || allServices[0],
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };
    fetchServices();
  }, []);

  const filteredCategories = serviceCategories
    .map((cat) => ({
      ...cat,
      services: cat.services.filter((svc) =>
        svc.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.services.length > 0);

  const handleScanClick = () => {
    setIsScannerOpen(true);
  };

  const handleSearch = () => {
    if (!imei) return;

    if (status === "authenticated") {
      const serviceId = selectedService?.serviceId || 6;
      router.push(
        `/shopkeeper/scan-device?imei=${encodeURIComponent(imei)}&serviceId=${serviceId}`,
      );
    } else {
      setShowLoginModal(true);
    }
  };

  const quickChecks = [
    "iPhone all in one / best fee",
    "Samsung full report / best before buy",
    "Mac full check / best before buy",
  ];

  return (
    <section className="relative flex min-h-[680px] overflow-hidden lg:h-[1060px] lg:min-h-0">
      {/* ================= BACKGROUND ================= */}

      <div className="absolute inset-0 z-0 bg-background">
        <div className="absolute left-1/2 top-[42%] h-[330px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(189,230,59,0.9)_0%,rgba(124,203,180,0.72)_48%,rgba(49,138,251,0.9)_100%)] blur-[82px] md:h-[520px] md:w-[1280px] lg:h-[658px] lg:w-[1520px]" />
        <div className="absolute left-1/2 top-[42%] h-[230px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/20 blur-[60px] md:h-[420px] md:w-[900px] lg:h-[538px] lg:w-[1016px]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(90deg,var(--color-foreground),0,var(--color-foreground)_95px,var(--color-foreground)_96px,var(--color-foreground)_100px)]" />
        <div className="absolute inset-x-0 bottom-0 h-[220px] bg-gradient-to-b from-background/0 via-background/75 to-background" />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 flex w-full flex-col items-center px-4 pb-20 pt-32 text-center sm:px-6 md:pb-24 md:pt-44 lg:px-[200px] lg:pb-[120px] lg:pt-[180px]">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-[1100px] text-[28px] font-black leading-[1.12] text-white sm:text-5xl md:text-6xl lg:text-[72px] lg:leading-[1.2]"
        >
          <span className="hidden whitespace-nowrap lg:block">
            Verify Global <span className="">IMEI</span>
          </span>
          <span className="hidden whitespace-nowrap lg:block">
            <span className="text-brand-lime-soft">Intelligence</span>{" "}
            <span className="">in Real-Time</span>
          </span>
          <span className="block lg:hidden">
            Verify Global <span className="text-brand-lime-soft">IMEI</span>
          </span>
          <span className="block text-brand-lime-soft lg:hidden">
            Intelligence
          </span>
          <span className="block  lg:hidden">in Real-Time</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 max-w-[760px] text-base leading-7 text-muted-foreground text-white sm:text-lg lg:text-xl"
        >
          Advanced AI-powered diagnostics and blacklisting checks for secure{" "}
          <br className="hidden md:block" />
          device transactions and inventory management.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative mt-12 w-full max-w-[672px] pt-6"
        >
          <div className="pointer-events-none absolute inset-x-[-16px] bottom-[-16px] top-2 rounded-[200px] border-2 border-white/50" />
          <div className="pointer-events-none absolute inset-x-[-32px] bottom-[-32px] top-[-8px] rounded-[216px] border-2 border-white/20" />

          <div className="relative z-10 flex min-h-[68px] items-center gap-4 rounded-full bg-background py-2 pl-6 pr-2 shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(132,204,22,0.05)] max-md:flex-col max-md:rounded-[32px] max-md:px-4 border border-border">
            <div className="flex min-w-0 flex-1 items-center gap-3 max-md:w-full">
              <Search className="h-6 w-6 shrink-0 text-muted-foreground" />

              <input
                type="text"
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter IMEI or Serial Number..."
                className="min-w-0 flex-1 bg-transparent py-2 text-base font-medium text-foreground outline-none placeholder:text-muted-foreground"
              />

              <button
                onClick={handleScanClick}
                title="Scan IMEI"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all hover:bg-primary/10 hover:text-primary group"
              >
                <QrCode className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>

            <div className="relative shrink-0 max-md:w-full">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-full bg-primary/80 px-8 text-primary-foreground shadow-[0_2px_4px_rgba(136,144,194,0.2),0_5px_15px_rgba(37,44,97,0.15)] transition-all hover:bg-primary max-md:w-full"
              >
                <span className="whitespace-nowrap text-base font-extrabold leading-none">
                  {selectedService ? selectedService.name : "Choose Service"}
                </span>
                <ChevronDown
                  className={`h-5 w-5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                  strokeWidth={3}
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                    className="absolute right-0 top-full z-[100] mt-4 w-[min(450px,calc(100vw-32px))] overflow-hidden rounded-[32px] border border-border bg-card/95 shadow-[0_30px_70px_rgba(0,0,0,0.2)] backdrop-blur-xl"
                  >
                    {/* Search inside Dropdown */}
                    <div className="p-4 border-b border-border bg-muted/50">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search for a service..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-2xl outline-none focus:border-primary transition-all text-sm font-bold text-foreground"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-3">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => (
                          <div key={cat.category} className="mb-6 last:mb-2">
                            <h3 className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                              <div className="h-px flex-1 bg-border/50" />
                              {cat.category}
                              <div className="h-px flex-1 bg-border/50" />
                            </h3>
                            <div className="space-y-1">
                              {cat.services.map((svc) => {
                                const isApple =
                                  cat.category
                                    .toLowerCase()
                                    .includes("apple") ||
                                  svc.name.toLowerCase().includes("apple") ||
                                  svc.name.toLowerCase().includes("iphone");
                                const isSamsung =
                                  cat.category
                                    .toLowerCase()
                                    .includes("samsung") ||
                                  svc.name.toLowerCase().includes("samsung");
                                const isSelected =
                                  selectedService?._id === svc._id;

                                return (
                                  <button
                                    key={svc._id}
                                    onClick={() => {
                                      setSelectedService(svc);
                                      setIsDropdownOpen(false);
                                      setSearchTerm("");
                                    }}
                                    className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all group ${
                                      isSelected
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-lime-500/30"
                                        : "hover:bg-muted border border-transparent hover:border-border"
                                    }`}
                                  >
                                    <div
                                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected
                                          ? "bg-white/20"
                                          : isApple
                                            ? "bg-muted text-muted-foreground"
                                            : isSamsung
                                              ? "bg-blue-500/10 text-blue-500"
                                              : "bg-green-500/10 text-green-500"
                                      }`}
                                    >
                                      <Info size={22} />
                                    </div>
                                    <div className="flex flex-col items-start flex-1 min-w-0">
                                      <span
                                        className={`text-[14px] font-black truncate w-full text-left ${
                                          isSelected
                                            ? "text-white"
                                            : "text-foreground"
                                        }`}
                                      >
                                        {svc.name}
                                      </span>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span
                                          className={`text-[10px] font-bold uppercase tracking-widest ${
                                            isSelected
                                              ? "text-white/70"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          ID: {svc.serviceId || "N/A"}
                                        </span>
                                        <div className="w-1 h-1 rounded-full bg-current opacity-30" />
                                        <span
                                          className={`text-[12px] font-black ${
                                            isSelected
                                              ? "text-white"
                                              : "text-primary"
                                          }`}
                                        >
                                          {svc.priceLabel}
                                        </span>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <motion.div layoutId="selected-check">
                                        <Check size={20} strokeWidth={4} />
                                      </motion.div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center space-y-3">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground/60">
                            <Search size={30} />
                          </div>
                          <p className="text-muted-foreground font-bold text-sm">
                            No services found for &quot;{searchTerm}&quot;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-muted border-t border-border flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        {services.length} Services available
                      </span>
                      <button className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline">
                        View All
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex w-full max-w-6xl flex-wrap justify-center gap-4"
        >
          {quickChecks.map((tag, i) => (
            <button
              key={i}
              onClick={() => {
                setImei("356782084912443");
              }}
              className="h-[50px] cursor-pointer rounded-full bg-[linear-gradient(166.27deg,rgba(132,204,22,0.2)_5.25%,rgba(91,94,13,0.2)_137.31%)] px-8 text-base font-extrabold leading-none text-white shadow-[0_3px_8px_rgba(136,144,194,0.25),0_7px_21px_rgba(37,44,97,0.2)] transition hover:bg-primary/30 max-md:h-auto max-md:min-h-[44px] max-md:px-5 max-md:text-sm border border-white "
            >
              {tag}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={handleSearch}
              className="h-12 cursor-pointer rounded-full bg-primary/80 px-8 text-base font-extrabold leading-none text-primary-foreground shadow-[0_2px_4px_rgba(136,144,194,0.2),0_5px_15px_rgba(37,44,97,0.15)] transition-all hover:bg-primary active:scale-95"
            >
              Free Checks
            </button>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="h-12 cursor-pointer rounded-full bg-white/10 border border-white/20 px-8 text-base font-extrabold leading-none text-white shadow-xl backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 flex items-center gap-2"
            >
              <Upload size={18} />
              Bulk Check
            </button>
          </div>
        </motion.div>
      </div>

      {/* Login Required Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card rounded-[32px] p-8 shadow-2xl overflow-hidden border border-border"
            >
              <div className="absolute top-0 right-0 p-4">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-2 hover:bg-muted rounded-full transition text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center space-y-6 pt-4">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
                  <LogIn size={40} strokeWidth={2.5} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-foreground tracking-tight">
                    Login Required
                  </h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    To check device IMEI details and access advanced reports,
                    please login to your account first.
                  </p>
                </div>

                <div className="w-full flex flex-col gap-3">
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="w-full py-4 bg-foreground text-background font-black rounded-2xl hover:opacity-90 transition shadow-xl active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm cursor-pointer"
                  >
                    Go to Login
                  </button>
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="w-full py-4 bg-muted text-muted-foreground font-black rounded-2xl hover:bg-muted/80 transition active:scale-95 text-sm uppercase tracking-widest cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-brand-blue bg-brand-blue/10 px-4 py-2 rounded-full">
                  <Info size={14} />
                  <span>Only registered shopkeepers can verify devices.</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(imei) => setImei(imei)}
      />
      <BulkImeiUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        serviceId={selectedService?.serviceId || 6}
      />
    </section>
  );
}
