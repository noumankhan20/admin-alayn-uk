"use client";

import React, { memo } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck, RefreshCw, PanelLeft, ExternalLink } from "lucide-react";
import { useAppSelector } from "@/redux/store/hooks";

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

const titlesMap: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "System Overview",
    subtitle: "Real-time telemetry and operational metrics across ALAYN platform",
  },
  "/outlets": {
    title: "Outlets & Locations",
    subtitle: "Monitor registered restaurant brands and their physical branch network",
  },
  "/coupons": {
    title: "Subscription Discount Coupons",
    subtitle: "Create and manage promotional discount codes for restaurant subscriptions",
  },
  "/profile": {
    title: "Administrator Profile",
    subtitle: "Security credentials and platform administrator details",
  },
};

export const AdminHeader = memo(function AdminHeader({
  onToggleSidebar,
}: HeaderProps) {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);

  const matched =
    titlesMap[pathname] ||
    Object.entries(titlesMap).find(([key]) => pathname.startsWith(`${key}/`))?.[1] || {
      title: "Administration",
      subtitle: "ALAYN Operations Platform Management",
    };

  return (
    <header className="h-16 bg-white border-b border-zinc-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-base font-bold text-[#1B2A4A] tracking-tight font-heading leading-tight">
            {matched.title}
          </h1>
          <p className="text-[11px] text-zinc-500 hidden sm:block leading-none mt-0.5">
            {matched.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Environment Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          System Operational
        </div>

        {/* Security Role Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 text-[#1B2A4A] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D3232A]" />
          <span className="hidden md:inline font-mono text-[11px]">SUPER_ADMIN</span>
          <span className="text-zinc-400 hidden lg:inline">|</span>
          <span className="truncate max-w-[130px] hidden lg:inline text-zinc-600">
            {user?.name || user?.email || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
});
