"use client";

import React, { useState } from "react";
import {
  X,
  Store,
  MapPin,
  Clock,
  CreditCard,
  Users,
  UtensilsCrossed,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Smartphone,
  QrCode,
  Banknote,
  Check,
  RefreshCw,
  Printer,
  Monitor,
  Layers,
} from "lucide-react";
import {
  useGetOutletDetailQuery,
  useDeleteBranchMutation,
} from "@/redux/slices/adminApiSlice";
import { formatDate } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";

interface DrawerProps {
  businessId: string | null;
  onClose: () => void;
}

export function BranchDetailsDrawer({ businessId, onClose }: DrawerProps) {
  const [branchToDelete, setBranchToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useGetOutletDetailQuery(businessId!, {
    skip: !businessId,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const [deleteBranch, { isLoading: isDeletingBranch }] = useDeleteBranchMutation();

  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;
    try {
      await deleteBranch(branchToDelete.id).unwrap();
      showToast.success(
        "Branch Deleted",
        `Branch "${branchToDelete.name}" was permanently removed from the database.`
      );
      setBranchToDelete(null);
    } catch (err: any) {
      showToast.error(
        "Deletion Failed",
        err?.data?.message || "Could not delete branch from database."
      );
    }
  };

  if (!businessId) return null;

  const detail = data?.data;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 bg-[#1B2A4A] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white text-lg">
                {detail?.name ? detail.name[0].toUpperCase() : "O"}
              </div>
              <div>
                <h2 className="text-base font-bold font-heading text-white truncate max-w-md">
                  {detail?.name || "Loading Outlet Details..."}
                </h2>
                <p className="text-xs text-white/60">
                  {detail?.businessType || "Restaurant Enterprise"} • Registered {formatDate(detail?.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
                title="Sync and fetch latest branch data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-emerald-400" : ""}`} />
                <span className="hidden sm:inline">Sync</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#D3232A]" />
                <p className="text-xs text-zinc-500 font-medium">Fetching branch topology...</p>
              </div>
            ) : error || !detail ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-[#D3232A] text-xs">
                Failed to load outlet details.
              </div>
            ) : (
              <>
                {/* Enterprise Summary Card */}
                <div className="p-4 rounded-xl bg-[#F4F5F8] border border-zinc-200/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium">Business Owner</span>
                    <span className="font-bold text-[#1B2A4A]">
                      {detail.owner?.name || "Not assigned"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium">Owner Email</span>
                    <span className="font-mono text-zinc-800">
                      {detail.owner?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium">Contact Phone</span>
                    <span className="font-mono text-zinc-800">
                      {detail.contactDetail || detail.owner?.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                    <span className="text-zinc-500 font-medium">Branch Network</span>
                    <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      {detail.activeBranchesCount} of {detail.totalBranches} branches subscribed
                    </span>
                  </div>
                </div>

                {/* Branches List */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                    Branch Locations ({detail.branches.length})
                  </h3>

                  {detail.branches.length === 0 ? (
                    <div className="py-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-xs text-zinc-400">
                      No branches have been added under this outlet yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {detail.branches.map((branch, index) => (
                        <div
                          key={branch.id}
                          className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all bg-white shadow-2xs space-y-3"
                        >
                          {/* Branch Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <div>
                                <h4 className="text-sm font-bold text-[#1B2A4A]">
                                  {branch.name}
                                </h4>
                                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                  <span>{branch.address}, {branch.city}, {branch.state}</span>
                                </p>
                              </div>
                            </div>

                            {/* Ordering Mode, Kitchen Dispatch & Subscription Status Pills */}
                            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                                  branch.tableOrderMode === "ORDER_AND_PAY"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-[#1B2A4A]/5 text-[#1B2A4A] border-[#1B2A4A]/10"
                                }`}
                              >
                                {branch.tableOrderMode === "ORDER_AND_PAY" ? (
                                  <>
                                    <Smartphone className="w-3 h-3 text-emerald-600" />
                                    <span>QR Order & Pay</span>
                                  </>
                                ) : (
                                  <>
                                    <UtensilsCrossed className="w-3 h-3 text-[#1B2A4A]" />
                                    <span>Waiter Service</span>
                                  </>
                                )}
                              </span>
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                                  branch.kitchenMode === "KOT"
                                    ? "bg-blue-50 text-blue-800 border-blue-200"
                                    : branch.kitchenMode === "KDS"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-rose-50 text-rose-800 border-rose-200"
                                }`}
                              >
                                {branch.kitchenMode === "KOT" ? (
                                  <>
                                    <Printer className="w-3 h-3 text-blue-700" />
                                    <span>KOT Print</span>
                                  </>
                                ) : branch.kitchenMode === "KDS" ? (
                                  <>
                                    <Monitor className="w-3 h-3 text-emerald-700" />
                                    <span>KDS Screen</span>
                                  </>
                                ) : (
                                  <>
                                    <Layers className="w-3 h-3 text-rose-700" />
                                    <span>Hybrid Dispatch</span>
                                  </>
                                )}
                              </span>
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  branch.isSubscriptionActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : branch.subscriptionStatus === "EXPIRED"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}
                              >
                                {branch.isSubscriptionActive ? "ACTIVE SUB" : branch.subscriptionStatus}
                              </span>
                              <button
                                onClick={() => setBranchToDelete({ id: branch.id, name: branch.name })}
                                className="p-1 rounded-md text-zinc-400 hover:text-[#D3232A] hover:bg-rose-50 transition-colors cursor-pointer"
                                title={`Permanently delete branch "${branch.name}" from database`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Branch Details Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-100 text-xs">
                            <div className="p-2 rounded bg-zinc-50">
                              <span className="text-[10px] text-zinc-400 block font-medium">HOURS</span>
                              <span className="font-semibold text-zinc-800">
                                {branch.openingTime || "10:00"} - {branch.closingTime || "22:00"}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-zinc-50">
                              <span className="text-[10px] text-zinc-400 block font-medium">TABLES</span>
                              <span className="font-semibold text-zinc-800">
                                {branch.tablesCount} Tables
                              </span>
                            </div>
                            <div className="p-2 rounded bg-zinc-50">
                              <span className="text-[10px] text-zinc-400 block font-medium">STAFF</span>
                              <span className="font-semibold text-zinc-800">
                                {branch.staffCount} Members
                              </span>
                            </div>
                            <div className="p-2 rounded bg-zinc-50">
                              <span className="text-[10px] text-zinc-400 block font-medium">ORDERS</span>
                              <span className="font-semibold text-zinc-800">
                                {branch.ordersCount} Total
                              </span>
                            </div>
                          </div>                          {/* ── Dining & Table Ordering Mode (Read-Only Inspection) ── */}
                          <div className="pt-3 border-t border-zinc-100 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <UtensilsCrossed className="w-3.5 h-3.5 text-[#1B2A4A]" />
                                <span className="text-[11px] font-bold text-[#1B2A4A] uppercase tracking-wide">
                                  Dining & Table Ordering Mode
                                </span>
                                <span className="text-[9px] font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                                  View-Only
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-zinc-400 font-medium">Active:</span>
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    branch.tableOrderMode === "ORDER_AND_PAY"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-[#1B2A4A]/5 text-[#1B2A4A] border-[#1B2A4A]/15"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      branch.tableOrderMode === "ORDER_AND_PAY"
                                        ? "bg-emerald-500"
                                        : "bg-[#1B2A4A]"
                                    }`}
                                  />
                                  {branch.tableOrderMode === "ORDER_AND_PAY"
                                    ? "DIRECT ORDER & PAY (QR)"
                                    : "WAITER SERVICE (STAFF)"}
                                </span>
                              </div>
                            </div>

                            {/* Mode Cards (Read-Only) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {/* Option 1: Waiter Service */}
                              <div
                                className={`p-3 rounded-xl border select-none transition-all ${
                                  branch.tableOrderMode !== "ORDER_AND_PAY"
                                    ? "border-[#1B2A4A] bg-[#1B2A4A]/5 shadow-2xs"
                                    : "border-zinc-200 bg-zinc-50/50 opacity-60"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                        branch.tableOrderMode !== "ORDER_AND_PAY"
                                          ? "bg-[#1B2A4A] text-white"
                                          : "bg-zinc-200 text-zinc-500"
                                      }`}
                                    >
                                      <UtensilsCrossed className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-xs text-[#1B2A4A]">Waiter Service</h5>
                                      <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500 block">
                                        Traditional Dining
                                      </span>
                                    </div>
                                  </div>
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      branch.tableOrderMode !== "ORDER_AND_PAY"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-zinc-200 text-zinc-500"
                                    }`}
                                  >
                                    STAFF-ASSISTED
                                  </span>
                                </div>

                                <p className="text-[11px] text-zinc-600 leading-snug">
                                  Floor staff & waiters take orders at table using POS/tablets. QR displays View-Only digital menu. Self-checkout disabled.
                                </p>

                                <div className="mt-2 pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px] text-zinc-500">
                                  <span>Fine Dining & Full-Service</span>
                                  {branch.tableOrderMode !== "ORDER_AND_PAY" ? (
                                    <span className="inline-flex items-center gap-1 font-bold text-[#1B2A4A]">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1B2A4A]" />
                                      Active Service
                                    </span>
                                  ) : (
                                    <span className="text-zinc-400 font-medium">Inactive</span>
                                  )}
                                </div>
                              </div>

                              {/* Option 2: Direct Order & Pay */}
                              <div
                                className={`p-3 rounded-xl border select-none transition-all ${
                                  branch.tableOrderMode === "ORDER_AND_PAY"
                                    ? "border-emerald-600 bg-emerald-50/40 shadow-2xs"
                                    : "border-zinc-200 bg-zinc-50/50 opacity-60"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                        branch.tableOrderMode === "ORDER_AND_PAY"
                                          ? "bg-emerald-600 text-white"
                                          : "bg-zinc-200 text-zinc-500"
                                      }`}
                                    >
                                      <Smartphone className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-xs text-emerald-950">Direct Order & Pay</h5>
                                      <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-700 block">
                                        QR Self-Checkout
                                      </span>
                                    </div>
                                  </div>
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      branch.tableOrderMode === "ORDER_AND_PAY"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-zinc-200 text-zinc-500"
                                    }`}
                                  >
                                    ZERO WAITER
                                  </span>
                                </div>

                                <p className="text-[11px] text-zinc-600 leading-snug">
                                  Guests scan table QR code, browse items, and pay directly on phone (UPI/Online). Orders route immediately to kitchen KOT/KDS.
                                </p>

                                <div className="mt-2 pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px] text-zinc-500">
                                  <span>Cafes, Breweries & QSR</span>
                                  {branch.tableOrderMode === "ORDER_AND_PAY" ? (
                                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      Active Service
                                    </span>
                                  ) : (
                                    <span className="text-zinc-400 font-medium">Inactive</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Counter Pay Status (Read-Only) when in Direct Order & Pay */}
                            {branch.tableOrderMode === "ORDER_AND_PAY" && (
                              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                    <Banknote className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#1B2A4A] block">
                                      Pay at Counter Option:{" "}
                                      <span className={branch.allowPayAtCounter ? "text-emerald-700" : "text-zinc-500"}>
                                        {branch.allowPayAtCounter ? "Enabled (Cash/Counter Allowed)" : "Disabled (Online Prepay Only)"}
                                      </span>
                                    </span>
                                    <p className="text-[10px] text-zinc-500">
                                      {branch.allowPayAtCounter
                                        ? "Customers can place their QR order to the kitchen immediately and pay cash or card at the cashier counter later."
                                        : "Customers must pay online before orders are sent to the kitchen."}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                                    branch.allowPayAtCounter
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                      : "bg-zinc-100 text-zinc-600 border-zinc-200"
                                  }`}
                                >
                                  {branch.allowPayAtCounter ? "Counter Allowed" : "Prepay Only"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* ── Kitchen Dispatch & Order Setup (KOT vs KDS) (Read-Only Inspection) ── */}
                          <div className="pt-3 border-t border-zinc-100 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Printer className="w-3.5 h-3.5 text-[#1B2A4A]" />
                                <span className="text-[11px] font-bold text-[#1B2A4A] uppercase tracking-wide">
                                  Kitchen Dispatch & Order Setup (KOT vs KDS)
                                </span>
                                <span className="text-[9px] font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                                  View-Only
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-zinc-400 font-medium">Active Mode:</span>
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                    branch.kitchenMode === "KOT"
                                      ? "bg-blue-50 text-blue-800 border-blue-200"
                                      : branch.kitchenMode === "KDS"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      : "bg-rose-50 text-rose-800 border-rose-200"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      branch.kitchenMode === "KOT"
                                        ? "bg-blue-600"
                                        : branch.kitchenMode === "KDS"
                                        ? "bg-emerald-600"
                                        : "bg-[#D3232A]"
                                    }`}
                                  />
                                  {branch.kitchenMode === "KOT"
                                    ? "KOT THERMAL ONLY"
                                    : branch.kitchenMode === "KDS"
                                    ? "KDS SCREEN ONLY"
                                    : "HYBRID (KOT + KDS)"}
                                </span>
                              </div>
                            </div>

                            {/* 3 Dispatch Cards (Read-Only) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              {/* Option 1: KOT Thermal Print */}
                              <div
                                className={`p-3 rounded-xl border select-none transition-all flex flex-col justify-between ${
                                  branch.kitchenMode === "KOT"
                                    ? "border-[#1B2A4A] bg-[#1B2A4A]/5 shadow-2xs"
                                    : "border-zinc-200 bg-zinc-50/50 opacity-60"
                                }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                          branch.kitchenMode === "KOT"
                                            ? "bg-[#1B2A4A] text-white"
                                            : "bg-zinc-200 text-zinc-500"
                                        }`}
                                      >
                                        <Printer className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <h5 className="font-bold text-xs text-[#1B2A4A]">KOT Thermal Print</h5>
                                      </div>
                                    </div>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                        branch.kitchenMode === "KOT"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-zinc-200 text-zinc-500"
                                      }`}
                                    >
                                      PAPER THERMAL
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-zinc-600 leading-snug">
                                    Orders trigger physical 80mm/58mm printed kitchen tickets. Cooks work off physical paper. Zero screen interaction needed in hot kitchens.
                                  </p>
                                </div>

                                <div className="mt-2.5 pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px] text-zinc-500">
                                  <span>Standard Indian Kitchens</span>
                                  {branch.kitchenMode === "KOT" ? (
                                    <span className="inline-flex items-center gap-1 font-bold text-[#1B2A4A]">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1B2A4A]" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="text-zinc-400 font-medium">Inactive</span>
                                  )}
                                </div>
                              </div>

                              {/* Option 2: KDS Digital Display */}
                              <div
                                className={`p-3 rounded-xl border select-none transition-all flex flex-col justify-between ${
                                  branch.kitchenMode === "KDS"
                                    ? "border-emerald-600 bg-emerald-50/40 shadow-2xs"
                                    : "border-zinc-200 bg-zinc-50/50 opacity-60"
                                }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                          branch.kitchenMode === "KDS"
                                            ? "bg-emerald-600 text-white"
                                            : "bg-zinc-200 text-zinc-500"
                                        }`}
                                      >
                                        <Monitor className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <h5 className="font-bold text-xs text-emerald-950">KDS Digital Display</h5>
                                      </div>
                                    </div>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                        branch.kitchenMode === "KDS"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-zinc-200 text-zinc-500"
                                      }`}
                                    >
                                      DIGITAL SCREEN
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-zinc-600 leading-snug">
                                    Real-time interactive touchscreen Kanban board (Prep &rarr; Ready &rarr; Served) with 3-minute cancellation retention & countdown auto-dismiss.
                                  </p>
                                </div>

                                <div className="mt-2.5 pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px] text-zinc-500">
                                  <span>Paperless Operations</span>
                                  {branch.kitchenMode === "KDS" ? (
                                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="text-zinc-400 font-medium">Inactive</span>
                                  )}
                                </div>
                              </div>

                              {/* Option 3: Hybrid (Both KOT + KDS) */}
                              <div
                                className={`p-3 rounded-xl border select-none transition-all flex flex-col justify-between ${
                                  branch.kitchenMode === "HYBRID" || !branch.kitchenMode
                                    ? "border-[#D3232A] bg-rose-50/40 shadow-2xs"
                                    : "border-zinc-200 bg-zinc-50/50 opacity-60"
                                }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                          branch.kitchenMode === "HYBRID" || !branch.kitchenMode
                                            ? "bg-[#D3232A] text-white"
                                            : "bg-zinc-200 text-zinc-500"
                                        }`}
                                      >
                                        <Layers className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <h5 className="font-bold text-xs text-rose-950">Hybrid (Both KOT + KDS)</h5>
                                      </div>
                                    </div>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                        branch.kitchenMode === "HYBRID" || !branch.kitchenMode
                                          ? "bg-rose-100 text-rose-800"
                                          : "bg-zinc-200 text-zinc-500"
                                      }`}
                                    >
                                      RECOMMENDED
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-zinc-600 leading-snug">
                                    Instantly prints physical thermal slips for cooking station cooks while manager/expediter tracks ticket statuses on digital KDS screen.
                                  </p>
                                </div>

                                <div className="mt-2.5 pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px] text-zinc-500">
                                  <span>Full Dual Dispatch</span>
                                  {branch.kitchenMode === "HYBRID" || !branch.kitchenMode ? (
                                    <span className="inline-flex items-center gap-1 font-bold text-[#D3232A]">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D3232A]" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="text-zinc-400 font-medium">Inactive</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>


                          {/* Plan info */}
                          <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1">
                            <span>
                              Plan: <strong className="text-zinc-700">{branch.planCode === "ALAYN_PRO" ? "Alayn Pro" : "Alayn Basic"}</strong>
                              {!!branch.aggregators?.length && (
                                <> · {branch.aggregators.map((a) => (a === "SWIGGY" ? "Swiggy" : "Zomato")).join(" + ")}</>
                              )}
                              <span className="text-zinc-400"> ({branch.planName})</span>
                            </span>
                            {branch.currentPeriodEnd && (
                              <span>Expires: {formatDate(branch.currentPeriodEnd)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
            <button onClick={onClose} className="btn-ghost text-xs">
              Close Inspection
            </button>
          </div>
        </div>
      </div>

      {/* Permanent Branch Deletion Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!branchToDelete}
        onClose={() => setBranchToDelete(null)}
        onConfirm={handleDeleteBranch}
        title="Delete Branch Location"
        entityName={branchToDelete?.name || ""}
        entityType="Branch"
        subWarning="This will permanently delete this physical branch and its orders, tables, and staff records from PostgreSQL."
        isDeleting={isDeletingBranch}
      />
    </div>
  );
}
