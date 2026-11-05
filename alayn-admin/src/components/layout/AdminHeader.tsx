"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import { useAppSelector } from "@/redux/store/hooks";
import { useSignOut } from "@/lib/useSignOut";
import { Avatar } from "@/components/ui/Layout";
import { currentNavItem } from "./nav";

function AccountMenu() {
  const user = useAppSelector((state) => state.auth.user);
  const { signOut, isSigningOut } = useSignOut();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-slate-100"
      >
        <Avatar name={user?.name || user?.email} size="sm" />
        <span className="hidden max-w-[160px] truncate text-sm font-medium text-slate-700 sm:block">
          {user?.name || user?.email || "Admin"}
        </span>
        <ChevronDown className="hidden size-4 text-slate-400 sm:block" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-pop animate-scale-in"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.name || "Administrator"}</p>
            <p className="truncate text-[13px] text-slate-500">{user?.email}</p>
          </div>
          <div className="my-1 border-t border-slate-100" />
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <UserRound className="size-4 text-slate-400" />
            My account
          </Link>
          <button
            role="menuitem"
            onClick={signOut}
            disabled={isSigningOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
          >
            <LogOut className="size-4 text-slate-400" />
            {isSigningOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminHeader({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const pathname = usePathname();
  const current = currentNavItem(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          aria-label="Open menu"
          className="-ml-1.5 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <Link href="/dashboard" className="lg:hidden" aria-label="ALAYN Admin home">
          <Image src="/alaynlogo.png" alt="ALAYN" width={1280} height={297} className="h-7 w-auto mix-blend-multiply" priority />
        </Link>
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm lg:flex">
          <span className="text-slate-400">Admin</span>
          <span className="text-slate-300" aria-hidden>/</span>
          <span className="truncate font-medium text-slate-900" aria-current="page">
            {current?.name ?? "Admin"}
          </span>
        </nav>
      </div>
      <AccountMenu />
    </header>
  );
}
