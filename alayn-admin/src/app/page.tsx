"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store/hooks";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user?.role === "SUPER_ADMIN") {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1B2A4A]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-white/20 border-t-[#D3232A] rounded-full animate-spin" />
        <p className="text-white/70 text-xs tracking-wider uppercase font-semibold">
          Loading ALAYN Admin...
        </p>
      </div>
    </div>
  );
}
