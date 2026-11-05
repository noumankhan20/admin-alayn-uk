"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/layout/AdminAuthGuard";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { cn } from "@/lib/utils";

const COLLAPSE_KEY = "alayn_admin_sidebar_collapsed";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Remember the sidebar preference between visits.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      return !c;
    });
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <AdminAuthGuard>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-pop"
      >
        Skip to content
      </a>
      <div className="min-h-screen">
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          mobileOpen={mobileOpen}
          onMobileClose={closeMobile}
        />
        <div
          className={cn(
            "flex min-h-screen min-w-0 flex-col transition-[padding] duration-200 ease-out",
            isCollapsed ? "lg:pl-[72px]" : "lg:pl-[248px]"
          )}
        >
          <AdminHeader onOpenMobileNav={() => setMobileOpen(true)} />
          <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
