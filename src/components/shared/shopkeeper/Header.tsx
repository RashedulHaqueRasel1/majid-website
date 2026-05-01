"use client";

import NotificationDropdown from "@/features/notifications/component/NotificationDropdown";
import { ModeToggle } from "../website/ModeToggle";

export default function Header() {
  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Search */}
      <div className="flex-1 max-w-xl"></div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ModeToggle />

        {/* Notifications */}
        <NotificationDropdown role="shopkeeper" />
      </div>
    </header>
  );
}
