"use client";

import React from "react";
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  KeyRound,
  LogOut,
  Lock,
  Calendar,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/store/hooks";
import { logout } from "@/redux/slices/authSlice";
import { useLogoutMutation } from "@/redux/slices/authApiSlice";
import { baseApi } from "@/redux/store/baseApi";
import { showToast } from "@/lib/toast";

export default function AdminProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleSignOut = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // ignore
    } finally {
      dispatch(logout());
      dispatch(baseApi.util.resetApiState());
      showToast.info("Session Ended", "You have signed out of the administration platform.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1B2A4A] text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white/20">
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1B2A4A] font-heading">
                  {user?.name || "Administrator"}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D3232A]/10 text-[#D3232A] border border-[#D3232A]/20 uppercase">
                  <ShieldCheck className="w-3 h-3" />
                  SUPER_ADMIN
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                ALAYN Platform Master Administrator Account
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="btn-ghost text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-zinc-100 text-xs">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              ADMINISTRATOR EMAIL
            </span>
            <p className="text-sm font-bold text-zinc-800 font-mono">
              {user?.email || "admin@alayn.app"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-zinc-500" />
              CONTACT PHONE
            </span>
            <p className="text-sm font-bold text-zinc-800 font-mono">
              {user?.phoneNo || "+91 (System default)"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-zinc-500" />
              AUTHENTICATION MECHANISM
            </span>
            <p className="text-sm font-bold text-zinc-800">
              HTTP-Only Cookies (Dual JWT Token)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
              ACCESS LEVEL
            </span>
            <p className="text-sm font-bold text-emerald-700">
              Unrestricted Global Platform Access
            </p>
          </div>
        </div>
      </div>

      {/* Security Policies Info Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/5 text-[#1B2A4A] flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1B2A4A] font-heading">
              Platform Security Guidelines
            </h3>
            <p className="text-xs text-zinc-500">Security configurations active on this administrative surface</p>
          </div>
        </div>

        <ul className="text-xs text-zinc-600 space-y-2.5 pl-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>Server-Side Pricing Authority:</strong> Subscription prices and coupon discounts are calculated strictly in the backend, preventing client-side price manipulation.
          </li>
          <li>
            <strong>Token Isolation:</strong> Access tokens and refresh tokens are stored in HTTP-Only, Secure, SameSite=Lax cookies, inaccessible to client JavaScript.
          </li>
          <li>
            <strong>Cross-Subdomain Session:</strong> Cookies are scoped to <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-[11px]">.alaynai.com</code> in production for secure administrative single-sign-on.
          </li>
          <li>
            <strong>Strict RBAC Enforcement:</strong> All administrative endpoints verify <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-[11px]">SUPER_ADMIN</code> role at the network boundary.
          </li>
        </ul>
      </div>
    </div>
  );
}
