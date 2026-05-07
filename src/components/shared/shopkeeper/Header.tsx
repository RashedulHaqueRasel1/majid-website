// "use client";

// import NotificationDropdown from "@/features/notifications/component/NotificationDropdown";
// import { ModeToggle } from "../website/ModeToggle";

// export default function Header() {
//   return (
//     <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border px-8 flex items-center justify-between sticky top-0 z-30">
//       {/* Left: Search */}
//       <div className="flex-1 max-w-xl"></div>

//       {/* Right: Actions */}
//       <div className="flex items-center gap-4">
//         {/* Theme Toggle */}
//         <ModeToggle />

//         {/* Notifications */}
//         <NotificationDropdown role="shopkeeper" />
//       </div>
//     </header>
//   );
// }

"use client";

import NotificationDropdown from "@/features/notifications/component/NotificationDropdown";
import { ModeToggle } from "../website/ModeToggle";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({ setOpenSidebar }: Props) {
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
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <ModeToggle />
        <NotificationDropdown role="shopkeeper" />
      </div>
    </header>
  );
}
