"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useLoginMutation } from "@/redux/slices/authApiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { setCredentials } from "@/redux/slices/authSlice";
import { showToast } from "@/lib/toast";
import { eraseCookie } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    // Clear any legacy non-HttpOnly token cookies from previous versions
    eraseCookie("alayn_admin_token");

    if (isAuthenticated && user?.role === "SUPER_ADMIN") {
      router.replace("/dashboard");
      return;
    }

    if (typeof window !== "undefined" && window.location.search.includes("expired=true")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMessage("Your session expired. Please sign in again.");
    }
  }, [isAuthenticated, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Enter your email and password.");
      return;
    }

    try {
      const response = await login({ email: trimmedEmail, password }).unwrap();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = (response as any)?.data || response;
      const loggedUser = payload?.user;

      const rawRole = (loggedUser?.role || "").toUpperCase();
      const isSuperAdmin = rawRole === "SUPER_ADMIN" || rawRole === "ADMIN";

      if (!isSuperAdmin) {
        setErrorMessage("This account doesn't have admin access. Only ALAYN platform administrators can sign in here.");
        return;
      }

      // Auth tokens are managed via backend HttpOnly cookies (credentials: "include")
      eraseCookie("alayn_admin_token");
      dispatch(setCredentials({ user: loggedUser }));
      showToast.success("Welcome back", `Signed in as ${loggedUser.name || loggedUser.email}`);
      router.replace("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg =
        err?.data?.error?.message ||
        err?.data?.message ||
        (typeof err?.data?.error === "string" ? err?.data?.error : null) ||
        (err?.status === "FETCH_ERROR" || err?.message === "Failed to fetch"
          ? "Can't reach the server. Check your connection and try again."
          : err?.message) ||
        "That email and password don't match. Please try again.";
      setErrorMessage(msg);
    }
  }

  const onPasswordKey = (e: React.KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState("CapsLock"));

  return (
    <div className="flex min-h-screen w-full bg-white lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-navy-900 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <Image
          src="/alaynimage.png"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-20 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900/60 via-navy-900/85 to-navy-950" aria-hidden />
        <div className="absolute -left-40 -top-40 size-[28rem] rounded-full bg-brand-600/20 blur-3xl" aria-hidden />

        <div className="relative">
          <Image src="/whitelogo.png" alt="ALAYN" width={160} height={48} priority className="h-10 w-auto" />
        </div>

        <div className="relative max-w-md">
          <div className="mb-6 h-1 w-10 rounded-full bg-brand-600" />
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Run the whole ALAYN platform from one place.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-navy-200">
            Look after restaurant brands and their branches, and manage subscription coupons.
          </p>
        </div>

        <p className="relative text-[13px] text-navy-300">© {new Date().getFullYear()} ALAYN</p>
      </div>

      {/* Form */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <Image
            src="/alaynlogo.png"
            alt="ALAYN"
            width={1280}
            height={297}
            priority
            className="mb-10 h-9 w-auto mix-blend-multiply lg:hidden"
          />

          <h2 className="text-2xl font-bold tracking-tight">Sign in to Admin</h2>
          <p className="mt-1.5 text-sm text-slate-500">Use your ALAYN administrator account.</p>

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-brand-800 animate-fade-in"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-brand-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="field-label">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@alayn.app"
                  autoComplete="username"
                  autoFocus
                  className="input h-11 pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={onPasswordKey}
                  onKeyDown={onPasswordKey}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className="input h-11 pl-9 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {capsLock && <p className="field-hint text-amber-700">Caps Lock is on.</p>}
            </div>

            <Button type="submit" size="lg" loading={isLoading} className="w-full">
              {isLoading ? (
                "Signing in…"
              ) : (
                <>
                  Sign in <ArrowRight />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-[13px] text-slate-400">
            For authorised ALAYN staff only. Sign-in attempts are logged.
          </p>
        </div>
      </main>
    </div>
  );
}
