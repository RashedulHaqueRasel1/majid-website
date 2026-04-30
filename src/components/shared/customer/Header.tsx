"use client";

import { Bell, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import {
  getShopkeeperDisplayName,
  getShopkeeperImage,
  getShopkeeperSubtitle,
} from "../shopkeeper/profile-utils";

export default function Header() {
  const { data: profileData } = useMyProfile();
  const user = profileData?.data;
  const profileName = getShopkeeperDisplayName(user);
  const profileImage = getShopkeeperImage(user);
  const profileSubtitle = getShopkeeperSubtitle(user);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Search */}
      <div className="flex-1 max-w-xl"></div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2.5 bg-gray-50 text-[#64748B] rounded-2xl hover:bg-gray-100 transition group cursor-pointer">
          <Bell
            size={20}
            className="group-hover:rotate-12 transition-transform"
          />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100 cursor-pointer group">
          <div className="max-w-48 text-right">
            <p className="truncate text-sm font-black text-[#0F172A] leading-none mb-1 group-hover:text-[#84CC16] transition">
              {profileName}
            </p>
            <p className="truncate text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
              {profileSubtitle}
            </p>
          </div>
          <div className="relative h-10 w-10 rounded-2xl overflow-hidden ring-2 ring-gray-50">
            <Image
              src={profileImage}
              alt={profileName}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <ChevronDown
            size={16}
            className="text-gray-400 group-hover:text-[#0F172A] transition"
          />
        </div>
      </div>
    </header>
  );
}
