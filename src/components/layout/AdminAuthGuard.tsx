"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { useGetMeQuery } from "@/redux/slices/authApiSlice";
import { setCredentials, logout } from "@/redux/slices/authSlice";
import { baseApi } from "@/redux/store/baseApi";
import { FullPageLoader } from "@/components/layout/FullPageLoader";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [checking, setChecking] = useState(true);

  const { data: meData, error: meError, isLoading: meLoading } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    // If not authenticated in store
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!meLoading) {
      if (meData) {
        const currentUser = (meData as any)?.data?.user || (meData as any)?.data || meData;
        if (currentUser && currentUser.role === "SUPER_ADMIN") {
          dispatch(setCredentials({ user: currentUser }));
          setChecking(false);
        } else {
          dispatch(logout());
          dispatch(baseApi.util.resetApiState());
          router.replace("/login");
        }
      } else if (meError) {
        dispatch(logout());
        dispatch(baseApi.util.resetApiState());
        router.replace("/login");
      } else {
        setChecking(false);
      }
    }
  }, [isAuthenticated, meData, meError, meLoading, dispatch, router]);

  if (checking || !isAuthenticated || user?.role !== "SUPER_ADMIN") {
    return <FullPageLoader label="Checking your session…" />;
  }

  return <>{children}</>;
}
