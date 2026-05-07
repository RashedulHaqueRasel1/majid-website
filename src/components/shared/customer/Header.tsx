"use client";

import NotificationDropdown from "@/features/notifications/component/NotificationDropdown";
import { ModeToggle } from "../website/ModeToggle";
import { CreditCard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";

interface Props {
  setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({ setOpenSidebar }: Props) {
  const { data: profileData } = useMyProfile();

  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden rounded-xl"
          onClick={() => setOpenSidebar(true)}
        >
          <Menu size={20} />
        </Button>

        <div className="flex-1 max-w-xl"></div>

        <div className="flex-1 max-w-xl">
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-border bg-card shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#84CC16]/10">
              <CreditCard size={18} className="text-[#84CC16]" />
            </div>

            <div className="flex flex-col leading-none">
              {/* <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                Available Credits
              </span> */}

              <span className="text-[18px] font-black text-foreground tracking-tight">
                {profileData?.data?.balance?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <ModeToggle />
        <NotificationDropdown role="customer" />
      </div>
    </header>
  );
}
