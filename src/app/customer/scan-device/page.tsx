import ScanDevice from "@/features/shopkeeper/scanDevice/component/ScanDevice";
import { Suspense } from "react";

export const metadata = {
  title: "Scan Device | Customer Dashboard",
  description: "Scan your devices seamlessly.",
};

export default function ScanDevicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#84CC16] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ScanDevice />
    </Suspense>
  );
}
