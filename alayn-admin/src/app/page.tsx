"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store/hooks";
import { FullPageLoader } from "@/components/layout/FullPageLoader";

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

  return <FullPageLoader label="Loading…" />;
}
