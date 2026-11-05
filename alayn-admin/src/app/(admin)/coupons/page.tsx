"use client";

import React, { useState } from "react";
import {
  TicketPercent,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Power,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  useGetCouponsQuery,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  CouponItem,
  CouponProduct,
  CouponStatus,
} from "@/redux/slices/adminApiSlice";
import { formatDate } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { CreateCouponModal } from "@/components/coupons/CreateCouponModal";

const PRODUCTS: { value: CouponProduct; label: string }[] = [
  { value: "alayn", label: "Alayn" },
  { value: "lite", label: "Alayn Lite" },
];

const STATUS_FILTERS = ["ALL", "ACTIVE", "USED_UP", "DISABLED", "EXPIRED"] as const;

const statusLabel = (status: string) => status.replace("_", " ");

const STATUS_STYLES: Record<CouponStatus, { badge: string; dot: string }> = {
  ACTIVE: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  USED_UP: { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  EXPIRED: { badge: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  DISABLED: { badge: "bg-zinc-100 text-zinc-600 border-zinc-200", dot: "bg-zinc-400" },
};

function freeAccessLabel(coupon: CouponItem) {
  if (coupon.discountType !== "PERCENTAGE" || coupon.discountValue < 100) return null;
  if (coupon.freeDurationDays) return `Free for ${coupon.freeDurationDays} days`;
  return coupon.expiresAt ? "Free until expiry date" : "Free for 1 year";
}

export default function CouponsPage() {
  const [product, setProduct] = useState<CouponProduct>("alayn");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, isFetching, error, refetch } = useGetCouponsQuery({
    page,
    limit: 15,
    status: statusFilter,
    search: search.trim() || undefined,
    product,
  });

  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  // RTK Query keeps the last successful result when a request fails; never show one product's

  // coupons under the other product's tab
  const couponsData = error ? undefined : data?.data;

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    try {
      await updateCoupon({
        id,
        product,
        data: { isActive: !currentActive },
      }).unwrap();
      showToast.success(
        "Status Updated",
        `Coupon ${currentActive ? "disabled" : "enabled"} successfully.`
      );
    } catch {
      showToast.error("Update Failed", "Could not toggle coupon status.");
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to deactivate or delete coupon "${code}"?`)) {
      return;
    }

    try {
      await deleteCoupon({ id, product }).unwrap();
      showToast.info("Coupon Deleted", `Coupon "${code}" has been removed or deactivated.`);
    } catch {
      showToast.error("Deletion Failed", "Could not delete coupon.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-[#1B2A4A] tracking-tight font-heading">
            Subscription Discount Coupons
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Configure promotional discount codes applicable during ALAYN subscription checkouts
          </p>
          {/* Each product keeps its own coupons; a code only works in the product it was made for */}
          <div className="mt-3 inline-flex rounded-lg bg-zinc-100 p-1" role="tablist" aria-label="Product">
            {PRODUCTS.map((p) => (
              <button
                key={p.value}
                role="tab"
                aria-selected={product === p.value}
                onClick={() => {
                  setProduct(p.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  product === p.value
                    ? "bg-white text-[#1B2A4A] shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary text-xs py-2.5 px-4 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-[#1B2A4A] text-white shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {statusLabel(st)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input pl-9 text-xs py-1.5 uppercase font-mono"
            />
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-ghost p-2 text-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-[#D3232A] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {(error as any)?.data?.error?.message ||
              "Failed to fetch coupons list. Please check database connectivity."}
          </span>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F5F8] border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Coupon Code</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Redemptions</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-5 w-24 bg-zinc-200 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-5 w-16 bg-zinc-200 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-5 w-16 bg-zinc-200 rounded-full" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-20 bg-zinc-200 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-24 bg-zinc-200 rounded" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-20 bg-zinc-200 rounded" /></td>
                    <td className="py-4 px-6 text-right"><div className="h-6 w-16 bg-zinc-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : !couponsData?.items || couponsData.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-400">
                    <TicketPercent className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                    <p className="font-semibold text-sm text-zinc-600">
                      No subscription coupons found.
                    </p>
                    <p className="text-xs mt-1">
                      Click &ldquo;Create New Coupon&rdquo; to configure discount codes.
                    </p>
                  </td>
                </tr>
              ) : (
                couponsData.items.map((coupon) => {
                  const isExpired = coupon.status === "EXPIRED";
                  const statusStyle = STATUS_STYLES[coupon.status] ?? STATUS_STYLES.DISABLED;
                  const freeAccess = freeAccessLabel(coupon);

                  return (
                    <tr
                      key={coupon.id}
                      className="hover:bg-zinc-50/80 transition-colors"
                    >
                      {/* Code */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#1B2A4A] bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200 tracking-wider">
                            {coupon.code}
                          </span>
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-sm text-[#1B2A4A]">
                          {coupon.discountType === "PERCENTAGE"
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue} OFF`}
                        </span>
                        <span className="block text-[10px] text-zinc-400 font-medium">
                          {freeAccess ??
                            (coupon.discountType === "PERCENTAGE" ? "Percentage discount" : "Fixed reduction")}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusStyle.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          {statusLabel(coupon.status)}
                        </span>
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-zinc-900">
                          {coupon.usageCount}
                        </span>
                        <span className="text-zinc-400">
                          {" "}/ {coupon.usageLimit ? `${coupon.usageLimit}` : "∞"}
                        </span>
                      </td>

                      {/* Expiry */}
                      <td className="py-4 px-4 text-zinc-600">
                        {coupon.expiresAt ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{formatDate(coupon.expiresAt)}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 font-medium">Never expires</span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="py-4 px-4 text-zinc-500 text-[11px]">
                        {formatDate(coupon.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                            disabled={isUpdating || isExpired}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              coupon.isActive
                                ? "text-amber-600 hover:bg-amber-50 border-amber-200"
                                : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                            } disabled:opacity-30 disabled:cursor-not-allowed`}
                            title={coupon.isActive ? "Disable coupon" : "Enable coupon"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                            title="Deactivate or delete coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {couponsData && couponsData.totalPages > 1 && (
          <div className="py-3.5 px-6 border-t border-zinc-200 flex items-center justify-between bg-zinc-50 text-xs text-zinc-600">
            <span>
              Showing Page <strong>{couponsData.page}</strong> of <strong>{couponsData.totalPages}</strong> (
              {couponsData.total} total coupons)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-ghost py-1 px-2.5 text-xs disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                disabled={page >= couponsData.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-ghost py-1 px-2.5 text-xs disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateCouponModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        product={product}
        productLabel={PRODUCTS.find((p) => p.value === product)!.label}
      />
    </div>
  );
}
