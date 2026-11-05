"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav, accountNav, isActive, NavItem } from "./nav";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function NavLink({ item, collapsed, pathname }: { item: NavItem; collapsed: boolean; pathname: string }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.name : undefined}
      className={cn(
        "group relative flex items-center rounded-lg text-sm font-medium transition-colors",
        collapsed ? "mx-auto size-10 justify-center" : "h-10 gap-3 px-3",
        active ? "bg-white/[0.12] text-white" : "text-navy-200 hover:bg-white/[0.06] hover:text-white"
      )}
    >
      {active && (
        <span aria-hidden className="absolute -left-3 top-2 bottom-2 w-[3px] rounded-r-full bg-brand-500" />
      )}
      <Icon className={cn("size-[18px] shrink-0", active ? "text-white" : "text-navy-300 group-hover:text-white")} />
      {collapsed ? <span className="sr-only">{item.name}</span> : <span className="truncate">{item.name}</span>}
    </Link>
  );
}

function SidebarBody({ collapsed, pathname }: { collapsed: boolean; pathname: string }) {
  return (
    <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      <div className="space-y-1">
        {!collapsed && (
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-navy-400">Manage</p>
        )}
        {mainNav.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
        ))}
      </div>
      <div className="space-y-1">
        {!collapsed && (
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-navy-400">Account</p>
        )}
        {collapsed && <div className="mx-3 mb-2 border-t border-white/10" />}
        {accountNav.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
        ))}
      </div>
    </nav>
  );
}

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center rounded-md" aria-label="ALAYN Admin home">
      {collapsed ? (
        <span className="flex size-10 items-center justify-center overflow-hidden">
          <Image src="/whitealogo.png" alt="" width={64} height={64} className="size-9 scale-[2.2] object-contain" priority />
        </span>
      ) : (
        <span className="flex items-center gap-2.5">
          <Image src="/whitelogo.png" alt="ALAYN" width={150} height={40} className="h-auto w-[112px] object-contain" priority />
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy-100">
            Admin
          </span>
        </span>
      )}
    </Link>
  );
}

export function AdminSidebar({ isCollapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  // Close the mobile menu after navigating, and on Escape.
  useEffect(() => {
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onMobileClose();
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col bg-navy-800 text-white transition-[width] duration-200 ease-out lg:flex",
          isCollapsed ? "w-[72px]" : "w-[248px]"
        )}
      >
        <div className={cn("flex h-16 shrink-0 items-center border-b border-white/[0.08]", isCollapsed ? "justify-center" : "px-5")}>
          <Logo collapsed={isCollapsed} />
        </div>
        <SidebarBody collapsed={isCollapsed} pathname={pathname} />
        <div className="border-t border-white/[0.08] p-3">
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : undefined}
            className={cn(
              "flex h-9 items-center rounded-lg text-[13px] font-medium text-navy-300 transition-colors hover:bg-white/[0.06] hover:text-white",
              isCollapsed ? "mx-auto w-10 justify-center" : "w-full gap-3 px-3"
            )}
          >
            {isCollapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-navy-950/50 animate-fade-in" onClick={onMobileClose} aria-hidden />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-navy-800 text-white shadow-pop animate-slide-in-left">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-5">
              <Logo collapsed={false} />
              <button
                onClick={onMobileClose}
                aria-label="Close menu"
                className="-mr-2 rounded-lg p-2 text-navy-200 hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>
            <SidebarBody collapsed={false} pathname={pathname} />
          </aside>
        </div>
      )}
    </>
  );
}
