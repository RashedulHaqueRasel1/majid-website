"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/shared/customer/Header";
import Sidebar from "@/components/shared/customer/Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const router = useRouter();
  const session = useSession();
  const token = session?.data?.accessToken;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-info"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/my-profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch user info");
      }

      return res.json();
    },
    enabled: !!token,
  });

  const userBalance = data?.data?.balance;
  const hasBalance = userBalance !== undefined && userBalance > 0;

  useEffect(() => {
    if (!isLoading && data) {
      if (!hasBalance) {
        router.push("/");
      }
    }
  }, [isLoading, hasBalance, router, data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Something went wrong!</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-500"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!hasBalance) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={openSidebar} onOpenChange={setOpenSidebar}>
        <SheetContent side="left" className="p-0 w-[300px] border-r-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header setOpenSidebar={setOpenSidebar} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
