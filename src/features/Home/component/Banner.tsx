"use client";

import {
  Search,
  SatelliteDish,
  ShieldHalf,
  Globe,
  Cloudy,
  LockKeyhole,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getServicesApi } from "@/features/shopkeeper/scanDevice/api/scanDevice.api";
import type {
  IMEIService,
  ServiceCategory,
} from "@/features/shopkeeper/scanDevice/types/scanDevice.types";
import { ScannerModal } from "@/components/shared/website/ScannerModal";
import { GuestLoginModal } from "@/components/shared/website/GuestLoginModal";
import { HeroVerificationConsole } from "./banner/HeroVerificationConsole";

export default function Banner() {
  const [imei, setImei] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    [],
  );
  const [selectedService, setSelectedService] = useState<IMEIService | null>(
    null,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      setIsServicesLoading(true);

      try {
        const response = await getServicesApi();
        if (response.success && response.data) {
          setServiceCategories(response.data);
          const allServices = response.data.flatMap((cat) => cat.services);

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
      } finally {
        setIsServicesLoading(false);
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

  const heroBackgroundColumns = Array.from({ length: 20 });

  return (
    <section
      id="banner"
      className="relative flex min-h-[720px] overflow-hidden lg:h-[1060px] lg:min-h-0"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-background">
        <div className="absolute left-1/2 top-[42%] h-[320px] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[1] bg-[linear-gradient(90deg,rgba(183,255,72,0.96)_0%,rgba(138,226,116,0.82)_24%,rgba(102,200,194,0.56)_50%,rgba(62,146,255,0.84)_68%,rgba(31,105,235,0.96)_100%)] blur-[58px] md:h-[560px] md:w-[1120px] md:blur-[88px] lg:h-[720px] lg:w-[1280px] lg:blur-[108px]" />
        <div className="absolute left-1/2 top-[42%] h-[300px] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.46] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8)_0%,rgba(231,255,236,0.44)_28%,rgba(199,234,255,0.2)_52%,rgba(255,255,255,0)_78%)] blur-[22px] dark:hidden md:h-[480px] md:w-[920px] md:blur-[34px] lg:h-[560px] lg:w-[1060px] lg:blur-[42px]" />
        <div className="absolute left-1/2 top-[42%] hidden h-[300px] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[1] bg-[radial-gradient(ellipse_at_center,rgba(148,163,184,0.18)_0%,rgba(103,232,249,0.14)_26%,rgba(59,130,246,0.12)_48%,rgba(255,255,255,0)_78%)] blur-[24px] dark:block md:h-[480px] md:w-[920px] md:blur-[36px] lg:h-[560px] lg:w-[1060px] lg:blur-[44px]" />
        <div className="absolute left-1/2 top-[42%] h-[340px] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/8 opacity-[0.7] [mask-image:radial-gradient(ellipse_68%_60%_at_50%_50%,black_0%,black_58%,rgba(0,0,0,0.68)_74%,transparent_100%)] backdrop-blur-[18px] dark:hidden md:h-[520px] md:w-[980px] lg:h-[610px] lg:w-[1160px]" />
        <div className="absolute left-1/2 top-[42%] hidden h-[340px] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900/0 opacity-[0.55] [mask-image:radial-gradient(ellipse_68%_60%_at_50%_50%,black_0%,black_58%,rgba(0,0,0,0.68)_74%,transparent_100%)] backdrop-blur-[18px] dark:block md:h-[520px] md:w-[980px] lg:h-[610px] lg:w-[1160px]" />
        <div className="absolute left-1/2 top-[42%] hidden h-[760px] w-[1540px] -translate-x-1/2 -translate-y-1/2 items-start opacity-[.5] [mask-image:radial-gradient(ellipse_63%_38%_at_50%_42%,black_0%,black_58%,rgba(0,0,0,0.65)_72%,transparent_100%)] lg:flex">
          {heroBackgroundColumns.map((_, index) => (
            <div key={index} className="relative h-[1200px] w-24 shrink-0">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.14)_42%,rgba(255,255,255,0.04)_100%)] dark:bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_0%,rgba(148,163,184,0.08)_42%,rgba(255,255,255,0.02)_100%)]" />
              <div className="absolute inset-y-0 left-[1px] w-[94px] bg-white/10 blur-[0.5px] dark:bg-slate-200/5" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 opacity-[0.7] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.34),rgba(255,255,255,0)_32%)] dark:opacity-[0.22] dark:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.16),rgba(255,255,255,0)_32%)]" />
        <div className="absolute inset-0 opacity-[0.7] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0)_22%,rgba(255,255,255,0.18)_54%,rgba(255,255,255,0.58)_76%,rgba(255,255,255,0.96)_100%)] dark:opacity-[0.18] dark:bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0)_22%,rgba(15,23,42,0.08)_54%,rgba(15,23,42,0.28)_76%,rgba(15,23,42,0.56)_100%)]" />
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
            Verify Global <span className="text-primary">IMEI</span>
          </span>
          <span className="hidden whitespace-nowrap lg:block">
            <span className="text-primary">Intelligence</span>{" "}
            <span>in Real-Time</span>
          </span>
          <span className="block lg:hidden">
            Verify Global <span className="text-[#BEFB6D]">IMEI</span>
          </span>
          <span className="block text-[#BEFB6D] lg:hidden">Intelligence</span>
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

        {/* Verification console */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-40 mt-10 w-full max-w-5xl" // Increased z-index to z-40 so dropdown overlaps tags
        >
          <HeroVerificationConsole
            categories={orderedCategories}
            ctaLabel={
              status !== "authenticated"
                ? "Free Check"
                : selectedService
                  ? "Enter"
                  : "Free Checks"
            }
            imei={imei}
            isPickerOpen={isDropdownOpen}
            isServicesLoading={isServicesLoading}
            onImeiChange={setImei}
            onPickerOpenChange={setIsDropdownOpen}
            onScan={() => setIsScannerOpen(true)}
            onSearchTermChange={setSearchTerm}
            onSelectService={setSelectedService}
            onSubmit={handleSearch}
            searchTerm={searchTerm}
            selectedService={selectedService}
          />
        </motion.div>

        {/* Tags/Categories Section - Enhanced Designs & Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 mt-12 w-full max-w-6xl overflow-hidden" // Lowered z-index to z-10
        >
          <div className="flex w-full items-center justify-start gap-4 overflow-x-auto pb-4 px-4 scrollbar-none md:justify-center md:px-0 snap-x snap-mandatory">
            {quickChecks
              .filter((tag) => tag.type === "specialized")
              .map((tag, i) => {
                const Icon = tag.icon;

                return (
                  <motion.button
                    key={i}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSearchTerm(tag.keyword);
                      setIsDropdownOpen(true);
                    }}
                    className="
                      group relative flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl
                      border border-white/10 bg-slate-50/5 backdrop-blur-md dark:bg-slate-900/20
                      transition-all duration-300 ease-out
                      hover:border-primary/40 hover:bg-primary/5 hover:shadow-[0_10px_30px_-10px_rgba(132,204,22,0.4)]
                      snap-center shrink-0 text-center
                      w-[130px] h-[120px] p-4
                      max-md:w-[110px] max-md:h-[100px] max-md:p-2.5
                    "
                  >
                    {/* Subtle Background Gradient on Hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Icon Box */}
                    <div className="relative z-10 flex items-center justify-center rounded-xl bg-white/10 border border-white/10 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 group-hover:border-primary/40 max-md:p-2">
                      <Icon className="h-8 w-8 text-primary transition-colors duration-300 group-hover:text-[#BEFB6D]" />
                    </div>

                    {/* Label */}
                    <div className="relative z-10 flex items-center justify-center w-full min-w-0">
                      <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300 leading-tight break-words transition-colors duration-300 group-hover:text-slate-900 dark:group-hover:text-white max-md:text-[11px] line-clamp-2">
                        {tag.label}
                      </span>
                    </div>

                    {/* Animated Bottom Accent Bar */}
                    <div className="absolute bottom-0 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-t-full bg-primary transition-all duration-300 ease-out group-hover:w-12" />
                  </motion.button>
                );
              })}
          </div>
        </motion.div>

        {/* Guest info badge */}
        {status !== "authenticated" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
          >
            <span className="text-[11px] font-bold text-slate-600 dark:text-white/80">
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
