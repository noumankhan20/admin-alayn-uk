"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCw, TicketPercent, Trash2 } from "lucide-react";
import {
  useGetCouponsQuery,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  CouponItem,
  CouponProduct,
} from "@/redux/slices/adminApiSlice";
import { formatDate } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { COUPON_STATUS, formatDiscount, freeAccessLabel } from "@/lib/coupons";
import { CreateCouponModal } from "@/components/coupons/CreateCouponModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, PageHeader } from "@/components/ui/Layout";
import { EmptyState, ErrorState, Skeleton, errorMessage } from "@/components/ui/Feedback";
import { CopyButton, Pagination, SearchInput, SegmentedControl, Switch, useDebouncedValue } from "@/components/ui/Controls";

const PAGE_SIZE = 15;

const PRODUCTS: { value: CouponProduct; label: string }[] = [
  { value: "alayn", label: "Alayn" },
  { value: "lite", label: "Alayn Lite" },
];

type StatusFilter = "ALL" | "ACTIVE" | "DISABLED" | "USED_UP" | "EXPIRED";
const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "DISABLED", label: "Paused" },
  { value: "USED_UP", label: "Used up" },
  { value: "EXPIRED", label: "Expired" },
];

function Usage({ coupon }: { coupon: CouponItem }) {
  const pct = coupon.usageLimit ? Math.min(100, (coupon.usageCount / coupon.usageLimit) * 100) : null;
  return (
    <div className="min-w-[96px]">
      <p className="tabular-nums text-slate-900">
        {coupon.usageCount}
        <span className="text-slate-400"> / {coupon.usageLimit ?? "∞"}</span>
      </p>
      {pct !== null && (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden>
          <div className="h-full rounded-full bg-navy-600" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

function CouponsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [product, setProduct] = useState<CouponProduct>("alayn");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CouponItem | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());

  // Deep link from elsewhere in the app: /coupons?new=1 opens the create form.
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCreateOpen(true);
      router.replace(pathname);
    }
  }, [searchParams, router, pathname]);

  // A new search starts from page 1 (filters reset the page in their own handlers).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [debouncedSearch]);

  const changeProduct = (p: CouponProduct) => {
    setProduct(p);
    setPage(1);
  };
  const changeStatus = (s: StatusFilter) => {
    setStatus(s);
    setPage(1);
  };

  const { data, isLoading, isFetching, error, refetch } = useGetCouponsQuery({
    page,
    limit: PAGE_SIZE,
    status,
    search: debouncedSearch || undefined,
    product,
  });
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  // RTK Query keeps the last successful result when a request fails; never show one
  // product's coupons under the other product's tab.
  const list = error ? undefined : data?.data;
  const items = list?.items ?? [];
  const productLabel = PRODUCTS.find((p) => p.value === product)!.label;
  const isFiltered = status !== "ALL" || !!debouncedSearch;

  const handleToggle = async (coupon: CouponItem) => {
    setPendingId(coupon.id);
    try {
      await updateCoupon({ id: coupon.id, product, data: { isActive: !coupon.isActive } }).unwrap();
      showToast.success(
        coupon.isActive ? "Coupon paused" : "Coupon turned on",
        coupon.isActive ? `${coupon.code} can no longer be redeemed.` : `${coupon.code} can be redeemed again.`
      );
    } catch (err) {
      showToast.error("Couldn't update coupon", errorMessage(err, "Please try again."));
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteCoupon({ id: toDelete.id, product }).unwrap();
      showToast.success("Coupon removed", `${toDelete.code} is no longer available.`);
      setToDelete(null);
    } catch (err) {
      showToast.error("Couldn't delete coupon", errorMessage(err, "Please try again."));
    }
  };

  const rowActions = (c: CouponItem) => (
    <div className="flex items-center justify-end gap-1">
      <Switch
        checked={c.isActive}
        onChange={() => handleToggle(c)}
        disabled={pendingId === c.id || c.status === "EXPIRED"}
        label={`${c.isActive ? "Pause" : "Turn on"} coupon ${c.code}`}
        size="sm"
      />
      <Button
        variant="danger-ghost"
        size="icon-sm"
        onClick={() => setToDelete(c)}
        aria-label={`Delete coupon ${c.code}`}
        title="Delete coupon"
        className="ml-2"
      >
        <Trash2 />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons"
        description="Discount codes customers can apply when paying for a subscription. Alayn and Alayn Lite each have their own codes."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus /> New coupon
          </Button>
        }
      />

      <SegmentedControl label="Product" value={product} onChange={changeProduct} options={PRODUCTS} />

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <SegmentedControl label="Filter by status" size="sm" value={status} onChange={changeStatus} options={STATUS_FILTERS} />
          <div className="flex items-center gap-2">
            <SearchInput
              label="Search coupons by code"
              value={search}
              onChange={(v) => setSearch(v.toUpperCase())}
              placeholder="Search by code"
              className="w-full lg:w-64"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refresh list"
              title="Refresh"
            >
              <RefreshCw className={isFetching ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        {error ? (
          <div className="p-4">
            <ErrorState
              title={`Couldn't load ${productLabel} coupons`}
              message={errorMessage(error, "Check your connection and try again.")}
              onRetry={refetch}
              retrying={isFetching}
            />
          </div>
        ) : isLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6 px-5 py-4">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="ml-auto h-5 w-9 rounded-full" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          isFiltered ? (
            <EmptyState
              icon={<TicketPercent />}
              title="No coupons match"
              description="Try a different code or status filter."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    changeStatus("ALL");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<TicketPercent />}
              title={`No ${productLabel} coupons yet`}
              description="Create a code to offer a discount on subscriptions."
              action={
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                  <Plus /> New coupon
                </Button>
              }
            />
          )
        ) : (
          <div className={isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Status</th>
                    <th>Used</th>
                    <th>Expires</th>
                    <th className="text-right">
                      <span className="pr-12">On</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => {
                    const st = COUPON_STATUS[c.status] ?? COUPON_STATUS.DISABLED;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[15px] font-semibold tracking-wide text-navy-900">{c.code}</span>
                            <CopyButton value={c.code} label="Copy code" />
                          </div>
                          <p className="text-xs text-slate-400">Created {formatDate(c.createdAt)}</p>
                        </td>
                        <td>
                          <p className="font-medium text-slate-900">{formatDiscount(c.discountType, c.discountValue)}</p>
                          {freeAccessLabel(c) && <p className="text-xs text-slate-500">{freeAccessLabel(c)}</p>}
                        </td>
                        <td>
                          <span title={st.hint}>
                            <Badge tone={st.tone} dot>
                              {st.label}
                            </Badge>
                          </span>
                        </td>
                        <td>
                          <Usage coupon={c} />
                        </td>
                        <td className="whitespace-nowrap text-slate-600">
                          {c.expiresAt ? formatDate(c.expiresAt) : <span className="text-slate-400">Never</span>}
                        </td>
                        <td>{rowActions(c)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {items.map((c) => {
                const st = COUPON_STATUS[c.status] ?? COUPON_STATUS.DISABLED;
                return (
                  <li key={c.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-base font-semibold tracking-wide text-navy-900">{c.code}</span>
                        <CopyButton value={c.code} label="Copy code" />
                      </div>
                      <Badge tone={st.tone} dot>
                        {st.label}
                      </Badge>
                    </div>
                    <dl className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-slate-500">Discount</dt>
                        <dd className="font-medium text-slate-900">{formatDiscount(c.discountType, c.discountValue)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Used</dt>
                        <dd>
                          <Usage coupon={c} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Expires</dt>
                        <dd className="text-slate-900">{c.expiresAt ? formatDate(c.expiresAt) : "Never"}</dd>
                      </div>
                    </dl>
                    {freeAccessLabel(c) && <p className="text-xs text-slate-500">{freeAccessLabel(c)}</p>}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-[13px] text-slate-500">{c.isActive ? "Turned on" : "Turned off"}</span>
                      {rowActions(c)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {list && items.length > 0 && (
          <Pagination
            page={list.page}
            totalPages={list.totalPages}
            total={list.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            noun={list.total === 1 ? "coupon" : "coupons"}
          />
        )}
      </Card>

      <CreateCouponModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        product={product}
        productLabel={productLabel}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={`Delete coupon ${toDelete?.code ?? ""}?`}
        description={
          toDelete && toDelete.usageCount > 0
            ? "This code has already been redeemed, so it may be deactivated instead of fully deleted."
            : "Customers will no longer be able to use this code."
        }
        confirmLabel="Delete coupon"
      />
    </div>
  );
}

export default function CouponsPage() {
  return (
    <Suspense fallback={null}>
      <CouponsContent />
    </Suspense>
  );
}
