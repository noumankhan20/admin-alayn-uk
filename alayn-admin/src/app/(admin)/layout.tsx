"use client";

import React, { useState } from "react";
import { AdminAuthGuard } from "@/components/layout/AdminAuthGuard";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-[#F8F9FA] flex">
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
            isCollapsed ? "md:pl-[72px]" : "md:pl-[260px]"
          )}
        >
          <AdminHeader
            isSidebarCollapsed={isCollapsed}
            onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
          />
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
