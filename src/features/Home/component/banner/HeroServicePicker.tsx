"use client";

import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import { Check, ChevronDown, Grid2X2, Info, Search, Star } from "lucide-react";
import type {
  IMEIService,
  ServiceCategory,
} from "@/features/shopkeeper/scanDevice/types/scanDevice.types";

interface HeroServicePickerProps {
  categories: ServiceCategory[];
  isLoading: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSearchTermChange: (searchTerm: string) => void;
  onSelect: (service: IMEIService) => void;
  searchTerm: string;
  selectedService: IMEIService | null;
}

export function HeroServicePicker({
  categories,
  isLoading,
  isOpen,
  onOpenChange,
  onSearchTermChange,
  onSelect,
  searchTerm,
  selectedService,
}: HeroServicePickerProps) {
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredCategories = useMemo(
    () =>
      categories
        .map((category) => ({
          ...category,
          services: category.services.filter((service) =>
            service.name.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
        }))
        .filter((category) => category.services.length > 0),
    [categories, searchTerm],
  );

  const serviceCount = categories.reduce(
    (total, category) => total + category.services.length,
    0,
  );

  const closePicker = useCallback(
    (restoreFocus = true) => {
      onOpenChange(false);
      if (restoreFocus) {
        triggerRef.current?.focus();
      }
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (!isOpen) return;

    searchRef.current?.focus();

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closePicker(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePicker();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePicker, isOpen]);

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        ref={triggerRef}
        type="button"
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={selectedService ? selectedService.name : "Choose Service"}
        onClick={() => onOpenChange(!isOpen)}
        className="group cursor-pointer flex h-14 w-full min-w-0 items-center gap-3 rounded-2xl border border-hero-border/70 bg-hero-surface px-3 text-left text-foreground shadow-[0_10px_28px_rgba(15,23,42,0.08)] outline-none transition-[border-color,box-shadow,transform] duration-200 hover:border-hero-accent/70 hover:shadow-[0_14px_34px_rgba(132,204,22,0.14)] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-hero-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hero-panel motion-reduce:transform-none lg:h-28 lg:flex-col lg:justify-center lg:gap-2 lg:rounded-[1.75rem] lg:px-4 lg:text-center"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-hero-accent-soft text-hero-emphasis lg:h-11 lg:w-11">
          <Grid2X2 aria-hidden="true" className="h-5 w-5 lg:h-6 lg:w-6" />
        </span>
        <span className="min-w-0 flex-1 lg:w-full lg:flex-none">
          <span className="block text-sm font-bold lg:text-base">Services</span>
          <span className="block truncate text-[0.6875rem] font-medium text-muted-foreground lg:mt-0.5">
            {selectedService ? selectedService.name : "Choose Service"}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 lg:absolute lg:right-3 lg:top-3 ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={2.25}
        />
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Choose Service"
          className="absolute left-0 top-full z-50 mt-3 w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-hero-border bg-hero-surface shadow-[0_24px_64px_rgba(15,23,42,0.18)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.42)]"
        >
          <div className="border-b border-hero-border p-3 sm:p-4">
            <label htmlFor={`${panelId}-search`} className="sr-only">
              Search for a service...
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                ref={searchRef}
                id={`${panelId}-search`}
                type="search"
                placeholder="Search for a service..."
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
                className="h-11 w-full rounded-xl border border-hero-border bg-hero-surface pl-10 pr-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-hero-accent focus-visible:ring-2 focus-visible:ring-hero-ring"
              />
            </div>
          </div>

          <div className="max-h-[20rem] overflow-y-auto p-2 sm:max-h-[26rem] sm:p-3">
            {isLoading ? (
              <div
                role="status"
                aria-label="Loading services"
                className="space-y-2 p-2"
              >
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-xl bg-hero-surface-muted motion-reduce:animate-none"
                  />
                ))}
              </div>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => {
                const isFavourite =
                  category.category.toLowerCase() === "fevourite";

                return (
                  <div
                    key={category.category}
                    role="group"
                    aria-label={category.category}
                    className="mb-3 last:mb-0"
                  >
                    <div className="flex items-center gap-2 px-2 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {isFavourite && (
                        <Star
                          aria-hidden="true"
                          className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
                        />
                      )}
                      <span>{category.category}</span>
                      {isFavourite && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.625rem] text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {category.services.map((service) => {
                        const isSelected = selectedService?._id === service._id;

                        return (
                          <button
                            key={service._id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => {
                              onSelect(service);
                              onSearchTermChange("");
                              closePicker();
                            }}
                            className={`group flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-hero-ring ${
                              isSelected
                                ? "border-hero-accent bg-hero-accent-soft"
                                : "border-transparent hover:border-hero-border hover:bg-hero-surface-muted"
                            }`}
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                isSelected
                                  ? "bg-hero-accent text-hero-accent-foreground"
                                  : "bg-hero-surface-muted text-muted-foreground"
                              }`}
                            >
                              {isFavourite ? (
                                <Star
                                  aria-hidden="true"
                                  className="h-4 w-4 fill-current"
                                />
                              ) : (
                                <Info aria-hidden="true" className="h-4 w-4" />
                              )}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {service.name}
                              </span>
                              <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                <span>ID: {service.serviceId || "N/A"}</span>
                                <span aria-hidden="true">•</span>
                                <span className="font-semibold text-hero-emphasis">
                                  {service.priceLabel}
                                </span>
                              </span>
                            </span>

                            {isSelected && (
                              <Check
                                aria-hidden="true"
                                className="h-5 w-5 shrink-0 text-hero-emphasis"
                                strokeWidth={2.5}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="space-y-2 px-4 py-10 text-center">
                <Search
                  aria-hidden="true"
                  className="mx-auto h-6 w-6 text-muted-foreground"
                />
                <p className="text-sm font-medium text-muted-foreground">
                  No services found for &quot;{searchTerm}&quot;
                </p>
              </div>
            )}
          </div>

          <div className="flex min-h-12 items-center justify-between gap-4 border-t border-hero-border bg-hero-surface-muted px-4 py-2">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {serviceCount} Services available
            </span>
            <button
              type="button"
              onClick={() => {
                onSearchTermChange("");
                searchRef.current?.focus();
              }}
              className="min-h-11 rounded-lg px-2 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-hero-emphasis outline-none hover:underline focus-visible:ring-2 focus-visible:ring-hero-ring"
            >
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
