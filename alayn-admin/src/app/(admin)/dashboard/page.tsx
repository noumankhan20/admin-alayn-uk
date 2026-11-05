"use client";

import React from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  TicketPercent,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useGetDashboardQuery } from "@/redux/slices/adminApiSlice";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data, error, isLoading, refetch, isFetching } = useGetDashboardQuery();

  const metrics = data?.data;

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-[#1B2A4A] tracking-tight font-heading">
            Platform Operations Dashboard
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time multi-tenant monitoring across ALAYN restaurant hospitality network
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-ghost text-xs py-2 px-3"
            title="Refresh real-time telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>{isFetching ? "Refreshing..." : "Refresh Telemetry"}</span>
          </button>
          <Link href="/coupons" className="btn-primary text-xs py-2 px-3.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Coupon</span>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-[#D3232A] text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Failed to load platform dashboard metrics</p>
            <p className="text-rose-600 mt-0.5">Please check network connection or verify admin permissions.</p>
          </div>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Total Outlets */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs hover:border-[#1B2A4A]/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Total Outlets
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 flex items-center justify-center text-[#1B2A4A] group-hover:bg-[#1B2A4A] group-hover:text-white transition-colors">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-10 w-24 bg-zinc-200 rounded animate-pulse" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#1B2A4A] font-heading">
                  {metrics?.totalOutlets ?? 0}
                </span>
                <span className="text-xs font-semibold text-zinc-500">Enterprises</span>
              </div>
            )}
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
              <span>Parent restaurant brands registered</span>
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
            <Link
              href="/outlets"
              className="text-xs font-bold text-[#D3232A] hover:text-[#b01e23] inline-flex items-center gap-1 group/link"
            >
              <span>View Outlets Directory</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Metric 2: Total Branches */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs hover:border-[#1B2A4A]/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Total Branches
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-10 w-24 bg-zinc-200 rounded animate-pulse" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#1B2A4A] font-heading">
                  {metrics?.totalBranches ?? 0}
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {metrics?.activeBranches ?? 0} Active Subscriptions
                </span>
              </div>
            )}
            <p className="text-xs text-zinc-500 mt-2">
              Physical locations & kitchen terminals
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
            <Link
              href="/outlets"
              className="text-xs font-bold text-[#D3232A] hover:text-[#b01e23] inline-flex items-center gap-1 group/link"
            >
              <span>Explore Branch Distribution</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Metric 3: Active Coupon */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs hover:border-[#1B2A4A]/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Active Coupon
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#D3232A]/10 border border-[#D3232A]/20 flex items-center justify-center text-[#D3232A] group-hover:bg-[#D3232A] group-hover:text-white transition-colors">
              <TicketPercent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-10 w-32 bg-zinc-200 rounded animate-pulse" />
            ) : metrics?.activeCoupon ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-[#1B2A4A] font-mono tracking-wider bg-zinc-100 px-2.5 py-0.5 rounded-md border border-zinc-200">
                    {metrics.activeCoupon.code}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {metrics.activeCoupon.discountType === "PERCENTAGE"
                      ? `${metrics.activeCoupon.discountValue}% OFF`
                      : `₹${metrics.activeCoupon.discountValue} OFF`}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {metrics.activeCoupon.usageLimit
                    ? `${metrics.activeCoupon.usageCount} / ${metrics.activeCoupon.usageLimit} redemptions`
                    : `${metrics.activeCoupon.usageCount} redemptions (No limit)`}
                </p>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-bold text-zinc-400 font-heading">
                  None
                </span>
                <p className="text-xs text-zinc-500 mt-2">
                  No active discount coupon currently running
                </p>
              </div>
            )}
          </div>
          <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
            <Link
              href="/coupons"
              className="text-xs font-bold text-[#D3232A] hover:text-[#b01e23] inline-flex items-center gap-1 group/link"
            >
              <span>Manage Coupons</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Overview: Recent Outlets Activity & Platform Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Registered Outlets (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#1B2A4A] font-heading">
                Recently Registered Outlets
              </h3>
              <p className="text-xs text-zinc-500">
                Latest restaurant brands onboarded to ALAYN
              </p>
            </div>
            <Link
              href="/outlets"
              className="text-xs font-semibold text-[#D3232A] hover:underline"
            >
              View All Outlets
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-zinc-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !metrics?.recentOutlets || metrics.recentOutlets.length === 0 ? (
            <div className="py-10 text-center text-zinc-400 text-xs">
              No outlets have been registered yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {metrics.recentOutlets.map((outlet) => (
                <div
                  key={outlet.id}
                  className="py-3.5 flex items-center justify-between hover:bg-zinc-50 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 flex items-center justify-center font-bold text-xs text-[#1B2A4A]">
                      {outlet.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1B2A4A]">
                        {outlet.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {outlet.businessType} • Registered {formatDate(outlet.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {outlet.branchCount} {outlet.branchCount === 1 ? "branch" : "branches"}
                    </span>
                    <Link
                      href={`/outlets`}
                      className="p-1 text-zinc-400 hover:text-zinc-700"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Administration Platform Health Card (1 col) */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1B2A4A] font-heading">
                  Platform Readiness
                </h3>
                <p className="text-[11px] text-zinc-500">Infrastructure & RBAC state</p>
              </div>
            </div>

            <div className="space-y-3.5 mt-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-600">Database Engine</span>
                <span className="font-semibold text-zinc-900 font-mono">PostgreSQL 15</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-600">Admin Authorization</span>
                <span className="font-semibold text-emerald-600">SUPER_ADMIN RBAC Active</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-600">Session Security</span>
                <span className="font-semibold text-zinc-900">HTTP-Only Cookies</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-600">Total System Coupons</span>
                <span className="font-semibold text-zinc-900 font-mono">
                  {metrics?.totalCoupons ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-zinc-600">Subscription Gateway</span>
                <span className="font-semibold text-zinc-900">Cashfree PG v2023-08</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100">
            <p className="text-[11px] text-zinc-400 text-center">
              ALAYN Operations Platform v1.0.0 • Production Build
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
