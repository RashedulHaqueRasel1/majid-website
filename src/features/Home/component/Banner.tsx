"use client";

import {
  Search,
  ChevronDown,
  QrCode,
  LogIn,
  X,
  Info,
  Check,
  Star,
  SatelliteDish,
  ShieldHalf,
  Globe,
  Cloudy,
  LockKeyhole,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getServicesApi } from "@/features/shopkeeper/scanDevice/api/scanDevice.api";
import {
  IMEIService,
  ServiceCategory,
} from "@/features/shopkeeper/scanDevice/types/scanDevice.types";
import { ScannerModal } from "@/components/shared/website/ScannerModal";
import { GuestLoginModal } from "@/components/shared/website/GuestLoginModal";

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
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServicesApi();
        if (response.success && response.data) {
          setServiceCategories(response.data);
          const allServices = response.data.flatMap((cat) => cat.services);
          setServices(allServices);

          // Auto-select first free service for guest users
          if (status !== "authenticated") {
            const firstFree = allServices.find((svc) => svc.isFree);
            if (firstFree) {
              setSelectedService(firstFree);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };
    fetchServices();
  }, [status]);

  // Reorder categories: put "fevourite" first, then sort others alphabetically
  const orderedCategories = useMemo(() => {
    let categories = serviceCategories;
    if (status !== "authenticated") {
      categories = serviceCategories
        .map((cat) => ({
          ...cat,
          services: cat.services.filter((svc) => svc.isFree),
        }))
        .filter((cat) => cat.services.length > 0);
    }

    const favouriteCategory = categories.find(
      (cat) => cat.category.toLowerCase() === "fevourite",
    );
    const otherCategories = categories.filter(
      (cat) => cat.category.toLowerCase() !== "fevourite",
    );

    const sortedOtherCategories = [...otherCategories].sort((a, b) =>
      a.category.localeCompare(b.category),
    );

    return favouriteCategory
      ? [favouriteCategory, ...sortedOtherCategories]
      : sortedOtherCategories;
  }, [serviceCategories, status]);

  // Filter categories and services based on search term
  const filteredCategories = orderedCategories
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

    // Authenticated users get full access
    if (status === "authenticated") {
      const serviceId = selectedService?.serviceId || 6;
      router.push(
        `/shopkeeper/scan-device?imei=${encodeURIComponent(imei)}&serviceId=${serviceId}`,
      );
      return;
    }

    // Guest users: only allow free services
    if (selectedService?.isFree) {
      router.push(
        `/shopkeeper/scan-device?imei=${encodeURIComponent(imei)}&serviceId=${selectedService.serviceId}`,
      );
    } else {
      // No service selected or selected a paid one
      setShowLoginModal(true);
    }
  };

  const quickChecks = [
    { label: "FMI", keyword: "fmi", type: "specialized", icon: LockKeyhole },
    {
      label: "Carrier",
      keyword: "carrier",
      type: "specialized",
      icon: SatelliteDish,
    },
    { label: "MDM", keyword: "mdm", type: "specialized", icon: ShieldHalf },
    { label: "GSX", keyword: "gsx", type: "specialized", icon: Globe },
    {
      label: "Sold By Check",
      keyword: "sold by",
      type: "specialized",
      icon: Search,
    },
    {
      label: "iCloud On/Off",
      keyword: "icloud",
      type: "specialized",
      icon: Cloudy,
    },
  ];

  return (
    <section
      id="banner"
      className="relative flex min-h-[720px] overflow-hidden lg:h-[1060px] lg:min-h-0"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-background">
        <div className="absolute left-1/2 top-[42%] h-[240px] w-[90%] md:w-[1280px] md:h-[520px] lg:h-[658px] lg:w-[1520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(189,230,59,0.9)_0%,rgba(124,203,180,0.72)_48%,rgba(49,138,251,0.9)_100%)] blur-[60px] md:blur-[82px]" />
        <div className="absolute left-1/2 top-[42%] h-[180px] w-[80%] md:w-[900px] md:h-[420px] lg:h-[538px] lg:w-[1016px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/20 blur-[40px] md:blur-[60px]" />
        <div className="absolute inset-0 opacity-[0.05] md:opacity-[0.08] [background-image:repeating-linear-gradient(90deg,var(--color-foreground),0,var(--color-foreground)_95px,var(--color-foreground)_96px,var(--color-foreground)_100px)]" />
        <div className="absolute inset-x-0 bottom-0 h-[220px] bg-gradient-to-b from-background/0 via-background/75 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center px-4 pb-16 pt-24 text-center sm:px-6 md:pb-24 md:pt-44 lg:px-[200px] lg:pb-[120px] lg:pt-[180px]">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-[1100px] text-[32px] font-black leading-[1.15] text-white sm:text-5xl md:text-6xl lg:text-[72px] lg:leading-[1.2]"
        >
          <span className="hidden whitespace-nowrap lg:block">
            Verify Global <span>IMEI</span>
          </span>
          <span className="hidden whitespace-nowrap lg:block">
            <span className="text-brand-lime-soft">Intelligence</span>{" "}
            <span>in Real-Time</span>
          </span>
          <span className="block lg:hidden">
            Verify Global <span className="text-brand-lime-soft">IMEI</span>
          </span>
          <span className="block text-brand-lime-soft lg:hidden">
            Intelligence
          </span>
          <span className="block lg:hidden">in Real-Time</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 max-w-[760px] text-sm leading-6 text-muted-foreground/80 dark:text-white/80 sm:text-lg lg:text-xl"
        >
          Advanced AI-powered diagnostics and blacklisting checks for secure{" "}
          <br className="hidden md:block" />
          device transactions and inventory management.
        </motion.p>

        {/* Search Bar Wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative mt-10 w-full max-w-[672px] pt-4 md:pt-6"
        >
          {/* Decorative Rings - Hidden on very small screens to avoid overflow layout bugs */}
          <div className="pointer-events-none absolute inset-x-[-8px] md:inset-x-[-16px] bottom-[-8px] md:bottom-[-16px] top-2 rounded-[32px] md:rounded-[200px] border border-white/30 md:border-2" />
          <div className="pointer-events-none absolute inset-x-[-16px] md:inset-x-[-32px] bottom-[-16px] md:bottom-[-32px] top-[-4px] md:top-[-8px] rounded-[40px] md:rounded-[216px] border border-white/10 md:border-2 hidden sm:block" />

          {/* Main Search Input Box */}
          <div className="relative z-10 flex min-h-[64px] md:min-h-[68px] items-center gap-3 md:gap-4 rounded-[24px] md:rounded-full bg-background py-2 pl-4 pr-2 md:pl-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] max-md:flex-col max-md:p-3 border border-border">
            <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3 w-full">
              <Search className="h-5 w-5 md:h-6 md:w-6 shrink-0 text-muted-foreground" />

              <textarea
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Enter IMEI or Serial Number..."
                rows={1}
                className="min-w-0 flex-1 bg-transparent py-1.5 text-sm md:text-base font-medium text-foreground outline-none placeholder:text-muted-foreground resize-none overflow-y-auto custom-scrollbar leading-normal h-[36px] md:h-[44px] max-h-[80px]"
              />

              <button
                onClick={handleScanClick}
                title="Scan IMEI"
                className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all hover:bg-primary/10 hover:text-primary group"
              >
                <QrCode className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>

            {/* Dropdown Container */}
            <div className="relative shrink-0 w-full md:w-auto">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex h-[48px] md:h-[52px] cursor-pointer items-center justify-center gap-2 rounded-xl md:rounded-full bg-primary/80 px-5 md:px-8 text-primary-foreground shadow-md transition-all hover:bg-primary w-full"
              >
                <span className="whitespace-nowrap text-sm md:text-base font-extrabold truncate max-w-[200px] md:max-w-none">
                  {selectedService ? selectedService.name : "Choose Service"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 md:h-5 md:w-5 shrink-0 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                  strokeWidth={3}
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                    className="absolute right-0 top-full z-[100] mt-3 w-[min(450px,calc(100vw-32px))] overflow-hidden rounded-[24px] md:rounded-[32px] border border-border bg-card/95 shadow-[0_30px_70px_rgba(0,0,0,0.2)] backdrop-blur-xl"
                  >
                    {/* Search inside Dropdown */}
                    <div className="p-3 md:p-4 border-b border-border bg-muted/50">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search for a service..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-xl md:rounded-2xl outline-none focus:border-primary transition-all text-xs md:text-sm font-bold text-foreground"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Dropdown Items List */}
                    <div className="max-h-[320px] md:max-h-[450px] overflow-y-auto custom-scrollbar p-2 md:p-3">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => {
                          const isFavourite =
                            cat.category.toLowerCase() === "fevourite";

                          return (
                            <div
                              key={cat.category}
                              className={`mb-4 last:mb-1 ${isFavourite ? "bg-amber-50/20 rounded-2xl" : ""}`}
                            >
                              <h3 className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                                <div className="h-px flex-1 bg-border/50" />
                                {isFavourite && (
                                  <Star
                                    size={12}
                                    className="text-amber-500 fill-amber-500"
                                  />
                                )}
                                <span
                                  className={
                                    isFavourite ? "text-amber-500" : ""
                                  }
                                >
                                  {cat.category}
                                </span>
                                {isFavourite && (
                                  <span className="text-[8px] font-bold text-amber-600 bg-amber-200/50 px-1.5 py-0.5 rounded-full🇳">
                                    Featured
                                  </span>
                                )}
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
                                  const isFavouriteService = isFavourite;

                                  return (
                                    <button
                                      key={svc._id}
                                      onClick={() => {
                                        setSelectedService(svc);
                                        setIsDropdownOpen(false);
                                        setSearchTerm("");
                                      }}
                                      className={`w-full flex items-center gap-3 p-3 rounded-[16px] md:rounded-[20px] transition-all group ${
                                        isSelected
                                          ? "bg-primary text-primary-foreground shadow-lg shadow-lime-500/30"
                                          : isFavouriteService
                                            ? "hover:bg-amber-50/50 border border-transparent hover:border-amber-200"
                                            : "hover:bg-muted border border-transparent hover:border-border"
                                      }`}
                                    >
                                      <div
                                        className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                          isSelected
                                            ? "bg-white/20"
                                            : isFavouriteService
                                              ? "bg-amber-100 text-amber-600"
                                              : isApple
                                                ? "bg-muted text-muted-foreground"
                                                : isSamsung
                                                  ? "bg-blue-500/10 text-blue-500"
                                                  : "bg-green-500/10 text-green-500"
                                        }`}
                                      >
                                        {isFavouriteService ? (
                                          <Star
                                            size={18}
                                            className="fill-amber-500 md:w-[22px] md:h-[22px]"
                                          />
                                        ) : (
                                          <Info
                                            size={18}
                                            className="md:w-[22px] md:h-[22px]"
                                          />
                                        )}
                                      </div>
                                      <div className="flex flex-col items-start flex-1 min-w-0">
                                        <span
                                          className={`text-xs md:text-[14px] font-black truncate w-full text-left ${
                                            isSelected
                                              ? "text-white"
                                              : "text-foreground"
                                          }`}
                                        >
                                          {svc.name}
                                        </span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span
                                            className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${isSelected ? "text-white/70" : "text-muted-foreground"}`}
                                          >
                                            ID: {svc.serviceId || "N/A"}
                                          </span>
                                          <div className="w-1 h-1 rounded-full bg-current opacity-30" />
                                          <span
                                            className={`text-xs font-black ${isSelected ? "text-white" : "text-primary"}`}
                                          >
                                            {svc.priceLabel}
                                          </span>
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <motion.div
                                          layoutId="selected-check"
                                          className="shrink-0"
                                        >
                                          <Check size={18} strokeWidth={4} />
                                        </motion.div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center space-y-2">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground/60">
                            <Search size={24} />
                          </div>
                          <p className="text-muted-foreground font-bold text-xs md:text-sm">
                            No services found for &quot;{searchTerm}&quot;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-3 md:p-4 bg-muted border-t border-border flex items-center justify-between">
                      <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        {services.length} Services available
                      </span>
                      <button className="text-[10px] md:text-[11px] font-black text-primary uppercase tracking-widest hover:underline">
                        View All
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Tags/Categories Section (Unchanged as requested, perfectly optimized) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-6xl overflow-hidden"
        >
          <div className="flex w-full items-center justify-start gap-4 overflow-x-auto pb-4 px-4 scrollbar-none md:justify-center md:px-0 snap-x snap-mandatory">
            {quickChecks
              .filter((tag) => tag.type === "specialized")
              .map((tag, i) => {
                const Icon = tag.icon;

                return (
                  <motion.button
                    key={i}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSearchTerm(tag.keyword);
                      setIsDropdownOpen(true);
                    }}
                    className="
                      group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl
                      border border-white/20 bg-white/10 backdrop-blur-xl
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] 
                      transition-all duration-300 hover:bg-white/10 hover:shadow-[0_8px_25px_rgba(132,204,22,0.2)]
                      snap-center shrink-0 text-center
                      w-[140px] h-[124px] p-4
                      max-md:w-[105px] max-md:h-[100px] max-md:p-2.5
                    "
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

                    <div
                      className="relative z-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg transition-all duration-300 group-hover:from-primary/10 group-hover:to-primary/15 group-hover:shadow-primary/15
                      h-12 w-12 max-md:h-9 max-md:w-9 shrink-0 mx-auto"
                    >
                      <Icon className="text-primary h-[22px] w-[22px] max-md:h-[18px] max-md:w-[18px]" />
                    </div>

                    <div className="relative z-10 flex items-center justify-center w-full min-w-0 flex-1">
                      <span className="text-sm font-extrabold text-black/50 dark:text-white leading-tight break-words max-md:text-[11px] line-clamp-2">
                        {tag.label}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 group-hover:w-8 hidden md:block" />
                  </motion.button>
                );
              })}
          </div>
        </motion.div>

        {/* Submit Button Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 w-full flex justify-center"
        >
          <button
            onClick={handleSearch}
            className="h-12 w-full max-w-[240px] sm:w-auto cursor-pointer rounded-full bg-primary/80 px-8 text-base font-extrabold leading-none text-primary-foreground shadow-md transition-all hover:bg-primary active:scale-95"
          >
            {status !== "authenticated"
              ? "Free Check"
              : selectedService
                ? "Enter"
                : "Free Checks"}
          </button>
        </motion.div>

        {/* Guest info badge */}
        {status !== "authenticated" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
          >
            <span className="text-[11px] font-bold text-white/80">
              ✅ 2 free reports available — no account needed
            </span>
          </motion.div>
        )}
      </div>

      {/* Login Modal */}
      <GuestLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(imei) => setImei(imei)}
      />
    </section>
  );
}
