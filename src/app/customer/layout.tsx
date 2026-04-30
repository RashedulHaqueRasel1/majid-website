import Header from "@/components/shared/customer/Header";
import Sidebar from "@/components/shared/customer/Sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "IMOSCAN | Customer",
  description: "Customer Dashboard for IMOSCAN",
  icons: {
    icon: "/images/logo.svg",
  },
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
