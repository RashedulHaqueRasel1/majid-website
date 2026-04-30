"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ModeToggle } from "./ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const { data: session, status } = useSession();

  const getDashboardUrl = () => {
    if (
      session?.user?.role === "shopkeeper" ||
      session?.user?.role === "shopkeeper"
    ) {
      return "/shopkeeper/dashboard";
    }
    return "/shopkeeper/dashboard"; // Default to shopkeeper dashboard for now as per project structure
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-20 overflow-x-clip border-b border-border bg-background/80 backdrop-blur-md md:h-[100px]">
      <div className="mx-auto flex h-full w-full max-w-[1520px] items-center justify-between px-4 sm:px-6 lg:px-0">
        {/* Logo */}
        <Link href="/">
          <div className="relative h-8 w-[100px] shrink-0 sm:w-[128px] md:h-[50px] md:w-[200px] cursor-pointer">
            <Image
              src="/images/logo.png"
              alt="Logo"
              fill
              className="object-contain dark:invert"
            />
          </div>
        </Link>

        {/* Action buttons and Theme Toggle */}
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 md:gap-4">
          <ModeToggle />

          {/* Login button - Only show if NOT authenticated */}
          {status !== "authenticated" && (
            <Link href="/auth/login">
              <div className="hidden h-10 min-w-[72px] cursor-pointer items-center justify-center rounded-full border border-primary px-4 text-sm font-extrabold text-primary transition-all hover:bg-primary hover:text-primary-foreground min-[420px]:flex md:h-12 md:min-w-[108px] md:px-6 md:text-base">
                Login
              </div>
            </Link>
          )}

          <div className="flex items-center gap-3">
            {/* Get Started / Dashboard button */}
            <Link
              href={
                status === "authenticated"
                  ? "/shopkeeper/scan-device"
                  : "/auth/sign-up"
              }
            >
              <div className="flex h-10 min-w-[104px] cursor-pointer items-center justify-center rounded-full bg-primary px-4 text-sm font-extrabold text-primary-foreground shadow-[0_2px_4px_rgba(136,144,194,0.2),0_5px_15px_rgba(37,44,97,0.15)] transition-all hover:opacity-90 md:h-12 md:min-w-[147px] md:px-8 md:text-base">
                {status === "authenticated" ? "Scan Now" : "Get Started"}
              </div>
            </Link>

            {/* Avatar - Only show if authenticated */}
            {status === "authenticated" && (
              <Link href={getDashboardUrl()}>
                <Avatar className="h-10 w-10 cursor-pointer border-2 border-primary/20 transition-all hover:border-primary md:h-12 md:w-12">
                  <AvatarImage
                    src={session?.user?.image}
                    alt={session?.user?.name || "User"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {getInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
