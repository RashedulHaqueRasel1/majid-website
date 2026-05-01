"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Battery,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  Smartphone,
  Star,
  Wrench,
} from "lucide-react";
import { useShopkeepers } from "../hooks/useRepairRequest";
import { Shopkeeper } from "../types/repair-request.types";
import { RepairRequestFormModal } from "./RepairRequestFormModal";
import { Button } from "@/components/ui/button";

const services = [
  { label: "Repair", icon: Wrench },
  { label: "Screen", icon: Smartphone },
  { label: "Battery", icon: Battery },
];

export default function RepairRequest() {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();
  const [selectedShopkeeper, setSelectedShopkeeper] =
    useState<Shopkeeper | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: shopkeeperData, isLoading } = useShopkeepers(
    search,
    ratingFilter,
  );

  const shopkeepers = useMemo(
    () => shopkeeperData?.data || [],
    [shopkeeperData],
  );

  const handleSelectShopkeeper = (shopkeeper: Shopkeeper) => {
    setSelectedShopkeeper(shopkeeper);
    setIsModalOpen(true);
  };

  return (
    <div className="px-4 py-8 md:px-8 lg:px-12 font-poppins min-h-screen bg-background">
      <div className="mx-auto max-w-[1200px] space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Find a Repair Shop
            </h1>
            <p className="mt-2 text-muted-foreground font-medium text-lg">
              Choose the best expert for your device&apos;s recovery
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm"
              placeholder="Search by shop name or location..."
              type="search"
            />
          </div>

          <Button
            variant={ratingFilter ? "default" : "outline"}
            onClick={() => setRatingFilter((curr) => (curr ? undefined : 4))}
            className={`h-14 rounded-2xl px-6 font-bold gap-3 border-border transition-all ${
              !ratingFilter && "hover:border-primary hover:text-primary bg-card"
            }`}
          >
            <Star
              size={20}
              className={ratingFilter ? "fill-white" : "text-primary"}
            />
            4.0+ Rating
            <SlidersHorizontal size={18} />
          </Button>
        </div>

        {/* Shopkeepers Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <ShopCardSkeleton />
          ) : shopkeepers.length > 0 ? (
            shopkeepers.map((shopkeeper) => (
              <ShopkeeperCard
                key={shopkeeper._id}
                shopkeeper={shopkeeper}
                onSelect={() => handleSelectShopkeeper(shopkeeper)}
              />
            ))
          ) : (
            <div className="col-span-full rounded-3xl border-2 border-dashed border-border p-16 text-center bg-card/50">
              <div className="mx-auto w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                <Search size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                No shops found
              </h3>
              <p className="text-muted-foreground mt-2 font-medium">
                Try adjusting your search or filters to find more repair
                experts.
              </p>
            </div>
          )}
        </div>
      </div>

      <RepairRequestFormModal
        shopkeeper={selectedShopkeeper}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

function ShopkeeperCard({
  shopkeeper,
  onSelect,
}: {
  shopkeeper: Shopkeeper;
  onSelect: () => void;
}) {
  const rating =
    shopkeeper.averageRating > 0 ? shopkeeper.averageRating.toFixed(1) : "4.8";
  const reviews = shopkeeper.totalReviews > 0 ? shopkeeper.totalReviews : 124;

  return (
    <article className="group relative rounded-[32px] border border-border bg-card p-6 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-surface border-2 border-white dark:border-white/5 shadow-sm">
          <Image
            src="/no-image.jpg"
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
          <Star size={16} fill="currentColor" />
          <span className="text-sm font-black">{rating}</span>
        </div>
      </div>

      <h2 className="text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
        {shopkeeper.shopName || "TechCare Mobile"}
      </h2>

      <div className="mt-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MapPin size={16} className="shrink-0" />
        <span className="line-clamp-1">
          {shopkeeper.shopAddress || "42 Wallaby Way, Sydney"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <span
              key={service.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-border px-3 py-1 text-[11px] font-bold text-foreground/70 uppercase tracking-wider"
            >
              <Icon size={12} />
              {service.label}
            </span>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Est. Time
          </span>
          <div className="flex items-center gap-1.5 text-sm font-black text-foreground">
            <Clock3 size={14} className="text-primary" />
            2-4 Hours
          </div>
        </div>
        <span className="text-sm font-bold text-muted-foreground">
          {reviews} reviews
        </span>
      </div>

      <Button
        onClick={onSelect}
        className="mt-6 w-full h-12 rounded-2xl font-black uppercase tracking-wider text-xs bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        Request Repair
      </Button>
    </article>
  );
}

function ShopCardSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-[340px] animate-pulse rounded-[32px] border border-border bg-muted/50"
        />
      ))}
    </>
  );
}
