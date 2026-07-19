import { ArrowUp, ScanLine } from "lucide-react";
import type {
  IMEIService,
  ServiceCategory,
} from "@/features/shopkeeper/scanDevice/types/scanDevice.types";
import { HeroServicePicker } from "./HeroServicePicker";

interface HeroVerificationConsoleProps {
  categories: ServiceCategory[];
  ctaLabel: string;
  imei: string;
  isPickerOpen: boolean;
  isServicesLoading: boolean;
  onImeiChange: (imei: string) => void;
  onPickerOpenChange: (isOpen: boolean) => void;
  onScan: () => void;
  onSearchTermChange: (searchTerm: string) => void;
  onSelectService: (service: IMEIService) => void;
  onSubmit: () => void;
  searchTerm: string;
  selectedService: IMEIService | null;
}

export function HeroVerificationConsole({
  categories,
  ctaLabel,
  imei,
  isPickerOpen,
  isServicesLoading,
  onImeiChange,
  onPickerOpenChange,
  onScan,
  onSearchTermChange,
  onSelectService,
  onSubmit,
  searchTerm,
  selectedService,
}: HeroVerificationConsoleProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="relative w-full pb-10 sm:pb-12"
    >
      <div className="relative isolate rounded-[2rem] border border-hero-accent/45 bg-hero-panel p-3 shadow-[0_24px_70px_rgba(132,204,22,0.14),0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:shadow-[0_24px_70px_rgba(132,204,22,0.08),0_18px_50px_rgba(0,0,0,0.3)] lg:rounded-[3rem] lg:p-4">
        <div
          aria-hidden="true"
          className="hero-console-wave pointer-events-none absolute inset-x-[16%] bottom-0 -z-10 h-16 opacity-70 lg:inset-x-[18%] lg:h-20"
        />
        <div className="grid grid-cols-[minmax(0,1fr)_3.5rem] gap-3 lg:grid-cols-[12rem_1px_minmax(0,1fr)_1px_6.5rem] lg:items-center lg:gap-5">
          <div className="min-w-0">
            <HeroServicePicker
              categories={categories}
              isLoading={isServicesLoading}
              isOpen={isPickerOpen}
              onOpenChange={onPickerOpenChange}
              onSearchTermChange={onSearchTermChange}
              onSelect={onSelectService}
              searchTerm={searchTerm}
              selectedService={selectedService}
            />
          </div>

          <div
            aria-hidden="true"
            className="hidden h-20 w-px bg-hero-accent/35 lg:block"
          />

          <div className="hero-input-field relative col-span-2 row-start-2 flex min-h-14 min-w-0 items-center overflow-hidden rounded-2xl border border-hero-border/70 bg-hero-surface/75 px-4 transition-[border-color,box-shadow] focus-within:border-hero-accent focus-within:ring-2 focus-within:ring-hero-ring lg:col-span-1 lg:row-auto lg:min-h-28 lg:border-0 lg:bg-transparent lg:px-5 lg:focus-within:ring-offset-0">
            <span
              aria-hidden="true"
              className="hero-input-scan pointer-events-none absolute inset-y-2 left-0 z-0 w-24 rounded-full motion-reduce:hidden"
            />
            <label htmlFor="hero-device-identifier" className="sr-only">
              Enter IMEI or Serial Number...
            </label>
            <input
              id="hero-device-identifier"
              type="text"
              required
              autoComplete="off"
              spellCheck={false}
              value={imei}
              onChange={(event) => onImeiChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Enter IMEI or Serial Number..."
              className="relative z-10 h-14 min-w-0 flex-1 bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground lg:h-20 lg:text-center lg:text-xl"
            />
          </div>

          <div
            aria-hidden="true"
            className="hidden h-20 w-px bg-hero-accent/35 lg:block"
          />

          <button
            type="submit"
            aria-label={ctaLabel}
            title={ctaLabel}
            className="group cursor-pointer col-start-2 row-start-1 flex h-14 w-14 items-center justify-center justify-self-end rounded-2xl bg-gradient-to-br from-hero-accent to-hero-accent-end text-hero-accent-foreground shadow-[0_14px_34px_rgba(34,197,94,0.3)] outline-none transition-[filter,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_18px_40px_rgba(34,197,94,0.36)] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-hero-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hero-panel motion-reduce:transform-none lg:col-auto lg:row-auto lg:h-24 lg:w-24 lg:rounded-[1.75rem]"
          >
            <ArrowUp
              aria-hidden="true"
              className="h-7 w-7 transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1 motion-reduce:transform-none lg:h-10 lg:w-10"
              strokeWidth={2.25}
            />
            <span className="sr-only">{ctaLabel}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onScan}
          aria-label="Scan IMEI"
          title="Scan IMEI"
          className="hero-scanner-button group absolute bottom-0 left-1/2 z-20 flex h-16 w-16 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-gradient-to-br from-hero-accent to-hero-accent-end text-hero-accent-foreground shadow-[0_14px_34px_rgba(34,197,94,0.35)] ring-8 ring-hero-panel outline-none transition-[filter,box-shadow,transform] duration-200 hover:brightness-105 hover:shadow-[0_18px_42px_rgba(34,197,94,0.42)] focus-visible:ring-[10px] focus-visible:ring-hero-ring motion-reduce:transition-none sm:h-20 sm:w-20 lg:h-20 lg:w-20"
        >
          <span
            aria-hidden="true"
            className="hero-scanner-radar pointer-events-none absolute inset-1 rounded-full border border-hero-accent-foreground/45 motion-reduce:hidden"
          />
          <ScanLine
            aria-hidden="true"
            className="relative z-10 h-7 w-7 transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transform-none sm:h-9 sm:w-9"
            strokeWidth={2.25}
          />
        </button>
      </div>
    </form>
  );
}
