"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useLoginMutation } from "@/redux/slices/authApiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { setCredentials } from "@/redux/slices/authSlice";
import { showToast } from "@/lib/toast";
import { eraseCookie } from "@/lib/utils";

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    // Clear any legacy non-HttpOnly token cookies from previous versions
    eraseCookie("alayn_admin_token");

    if (isAuthenticated && user?.role === "SUPER_ADMIN") {
      router.replace("/dashboard");
      return;
    }

    if (typeof window !== "undefined" && window.location.search.includes("expired=true")) {
      setErrorMessage("Your administrative session has expired. Please sign in again.");
    }
  }, [isAuthenticated, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      const response = await login({
        email: trimmedEmail,
        password,
      }).unwrap();

      const payload = (response as any)?.data || response;
      const loggedUser = payload?.user;

      const rawRole = (loggedUser?.role || "").toUpperCase();
      const isSuperAdmin = rawRole === "SUPER_ADMIN" || rawRole === "ADMIN";

      if (!isSuperAdmin) {
        setErrorMessage("Access denied: You do not have Super Administrator privileges.");
        showToast.error(
          "Access Restricted",
          "This portal is exclusively for ALAYN platform administrators."
        );
        return;
      }

      // Auth tokens are managed via backend HttpOnly cookies (credentials: "include")
      eraseCookie("alayn_admin_token");
      dispatch(setCredentials({ user: loggedUser }));
      showToast.success("Welcome back", `Signed in as ${loggedUser.name || loggedUser.email}`);
      router.replace("/dashboard");
    } catch (err: any) {
      const msg =
        err?.data?.error?.message ||
        err?.data?.message ||
        (typeof err?.data?.error === "string" ? err?.data?.error : null) ||
        (err?.message === "Failed to fetch"
          ? "Cannot connect to server. Please check backend connection."
          : err?.message) ||
        "Invalid administrator credentials.";
      setErrorMessage(msg);
      showToast.error("Sign in failed", msg);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0B0E] text-white flex flex-col lg:grid lg:grid-cols-2 font-sans selection:bg-[#D3232A] selection:text-white">
      {/* ─── Left Visual Showcase ───────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden bg-gradient-to-br from-[#0B132B] via-[#121D33] to-[#0A0B0E]">
        {/* Background Ambient Layers */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/alaynimage.png"
            alt="ALAYN Management"
            fill
            priority
            className="object-cover object-center opacity-25 brightness-90 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/70 to-[#0B132B]/85" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#D3232A]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#1B2A4A]/50 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/whitelogo.png"
            alt="ALAYN Platform"
            width={160}
            height={48}
            priority
            unoptimized
            className="h-10 w-auto object-contain drop-shadow-md"
          />
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D3232A]" />
            <span className="text-[11px] font-bold text-white tracking-wider uppercase">
              Admin Gateway
            </span>
          </div>
        </div>

        {/* Editorial Text */}
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="w-12 h-1 bg-[#D3232A] rounded-full" />
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            The Official Platform Management Suite
          </h1>
          <p className="text-sm xl:text-base text-zinc-300 leading-relaxed">
            Centralized enterprise administration for multi-brand dining operations, outlets, employee governance, billing, real-time analytics, and platform control.
          </p>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} ALAYN Platform. All rights reserved.
        </div>
      </div>

      {/* ─── Right Form Panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20 bg-[#0A0B0E] relative z-10">
        
        {/* Mobile Header Logo */}
        <div className="lg:hidden mb-10 text-center">
          <Image
            src="/whitelogo.png"
            alt="ALAYN Platform"
            width={150}
            height={44}
            priority
            unoptimized
            className="h-10 w-auto object-contain mx-auto"
          />
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin Sign In
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Enter your authorized credentials to access the console.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-start gap-3 text-sm animate-in fade-in duration-200">
              <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-4 text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@alayn.app"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#D3232A] focus:ring-1 focus:ring-[#D3232A] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block"
                >
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-zinc-500 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-11 py-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#D3232A] focus:ring-1 focus:ring-[#D3232A] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-[#D3232A] cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-xs text-zinc-400 hover:text-zinc-300 cursor-pointer select-none"
              >
                Keep me signed in on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 bg-[#D3232A] hover:bg-[#b01e23] active:scale-[0.99] text-white font-bold text-sm tracking-wide rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} className="stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-8 text-center text-xs text-zinc-400">
            Authorized personnel only. All access attempts are logged.
          </div>
        </div>
      </div>
    </div>
  );
}

