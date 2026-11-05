"use client";

import React, { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  TicketPercent,
  ShieldCheck,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { logout } from "@/redux/slices/authSlice";
import { useLogoutMutation } from "@/redux/slices/authApiSlice";
import { baseApi } from "@/redux/store/baseApi";
import { showToast } from "@/lib/toast";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Outlets", href: "/outlets", icon: Store },
  { name: "Coupons", href: "/coupons", icon: TicketPercent },
];

const adminNavItems: NavItem[] = [
  { name: "Admin Profile", href: "/profile", icon: User },
];

export const AdminSidebar = memo(function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [logoutApi] = useLogoutMutation();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // ignore
    } finally {
      dispatch(logout());
      dispatch(baseApi.util.resetApiState());
      showToast.info("Signed Out", "You have been logged out of the administration platform.");
    }
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-[#1B2A4A] text-white flex flex-col justify-between border-r border-white/10 select-none shadow-xl",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Top Branding & Toggle */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center overflow-hidden transition-all duration-200",
              isCollapsed && "justify-center w-full"
            )}
          >
            {isCollapsed ? (
              <div className="w-10 h-10 flex items-center justify-center">
                <Image
                  src="/whitealogo.png"
                  alt="ALAYN"
                  width={64}
                  height={64}
                  className="w-9 h-9 object-contain scale-[2.2] shadow-sm"
                  priority
                />
              </div>
            ) : (
              <div className="w-[130px] flex items-center">
                <Image
                  src="/whitelogo.png"
                  alt="ALAYN Platform"
                  width={150}
                  height={40}
                  className="w-[130px] h-auto object-contain cursor-pointer"
                  priority
                />
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed expand button */}
        {isCollapsed && (
          <div className="flex justify-center py-2 border-b border-white/5">
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="py-4 px-3 space-y-6 overflow-y-auto">
          {/* Main Module Section */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                ALAYN Core
              </p>
            )}
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "group relative flex items-center rounded-xl text-[13.5px] font-semibold transition-all duration-200 ease-out overflow-hidden",
                      isCollapsed
                        ? "h-11 w-11 justify-center px-0 mx-auto"
                        : "h-10 px-3.5 w-full",
                      isActive
                        ? "bg-white/[0.14] text-white font-bold shadow-xs border border-white/[0.08]"
                        : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100 hover:translate-x-1"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3.5px] rounded-r-full bg-[#D3232A]" />
                    )}
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-transform duration-200",
                        !isCollapsed && "mr-3",
                        isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                      )}
                    />
                    {!isCollapsed && (
                      <span className="truncate leading-normal">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Administration Section */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                Administration
              </p>
            )}
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "group relative flex items-center rounded-xl text-[13.5px] font-semibold transition-all duration-200 ease-out overflow-hidden",
                      isCollapsed
                        ? "h-11 w-11 justify-center px-0 mx-auto"
                        : "h-10 px-3.5 w-full",
                      isActive
                        ? "bg-white/[0.14] text-white font-bold shadow-xs border border-white/[0.08]"
                        : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100 hover:translate-x-1"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3.5px] rounded-r-full bg-[#D3232A]" />
                    )}
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-transform duration-200",
                        !isCollapsed && "mr-3",
                        isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                      )}
                    />
                    {!isCollapsed && (
                      <span className="truncate leading-normal">{item.name}</span>
                    )}
                  </Link>
                );
              })}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title={isCollapsed ? "Sign Out" : undefined}
                className={cn(
                  "group relative flex items-center rounded-xl text-[13.5px] font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer overflow-hidden",
                  isCollapsed
                    ? "h-11 w-11 justify-center px-0 mx-auto"
                    : "h-10 px-3.5 w-full"
                )}
              >
                <LogOut
                  className={cn(
                    "w-4 h-4 shrink-0 text-rose-400 group-hover:text-rose-200 transition-transform",
                    !isCollapsed && "mr-3"
                  )}
                />
                {!isCollapsed && <span>Sign Out</span>}
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom User Profile Capsule */}
      <div className="p-3 border-t border-white/10 bg-[#162038]/60">
        <div
          className={cn(
            "flex items-center gap-2.5 p-2 rounded-xl transition-colors",
            isCollapsed && "justify-center p-0"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user?.name ? user.name[0].toUpperCase() : "A"}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {user?.name || "Administrator"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-white/50 font-medium truncate">
                  SUPER_ADMIN
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});
