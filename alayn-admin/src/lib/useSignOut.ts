"use client";

import { useCallback } from "react";
import { useAppDispatch } from "@/redux/store/hooks";
import { logout } from "@/redux/slices/authSlice";
import { useLogoutMutation } from "@/redux/slices/authApiSlice";
import { baseApi } from "@/redux/store/baseApi";
import { showToast } from "@/lib/toast";

/** Ends the server session (best effort) and clears local auth state. */
export function useSignOut() {
  const dispatch = useAppDispatch();
  const [logoutApi, { isLoading }] = useLogoutMutation();

  const signOut = useCallback(async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // The local session is cleared below regardless of the server response.
    } finally {
      dispatch(logout());
      dispatch(baseApi.util.resetApiState());
      showToast.info("Signed out", "See you next time.");
    }
  }, [dispatch, logoutApi]);

  return { signOut, isSigningOut: isLoading };
}
