"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, MapPin, Plus, RefreshCw, Store, TicketPercent, Wallet } from "lucide-react";
import { useGetDashboardQuery, DashboardMetrics } from "@/redux/slices/adminApiSlice";
import { useAppSelector } from "@/redux/store/hooks";
import { formatDate } from "@/lib/utils";
import { formatDiscount } from "@/lib/coupons";
import { Button, buttonClass } from "@/components/ui/Button";
import { Avatar, Card, CardHeader, PageHeader } from "@/components/ui/Layout";
import { EmptyState, ErrorState, Skeleton, errorMessage } from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/Controls";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
    >
      <div className="h-full rounded-full bg-navy-700 transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatTile({
  href,
  label,
  value,
  icon,
  loading,
  children,
}: {
  href: string;
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  loading: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-[border-color,box-shadow] hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-slate-500">{label}</span>
        <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-navy-800 group-hover:text-white [&_svg]:size-4">
          {icon}
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-9 w-20" />
      ) : (
        <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight text-navy-900">{value}</p>
      )}
      <div className="mt-auto pt-3 text-[13px] text-slate-500">{loading ? <Skeleton className="h-4 w-32" /> : children}</div>
    </Link>
  );
}

function LiveCoupon({ coupon, loading }: { coupon: DashboardMetrics["activeCoupon"] | undefined; loading: boolean }) {
  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Live coupon"
        description="The code customers can redeem right now"
        action={
          <Link href="/coupons" className="text-[13px] font-medium text-navy-600 hover:text-navy-900">
            Manage
          </Link>
        }
      />
      <div className="flex flex-1 flex-col px-5 pb-5">
        {loading ? (
          <div className="space-y-3 pt-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : coupon ? (
          <div className="space-y-4 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg border border-dashed border-navy-300 bg-navy-50 py-1 pl-3 pr-1 font-mono text-lg font-bold tracking-wider text-navy-900">
                {coupon.code}
                <CopyButton value={coupon.code} label="Copy code" />
              </span>
              <Badge tone="success">{formatDiscount(coupon.discountType, coupon.discountValue)}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-[13px]">
                <span className="text-slate-500">Redemptions</span>
                <span className="font-medium tabular-nums text-slate-900">
                  {coupon.usageCount}
                  <span className="text-slate-400"> / {coupon.usageLimit ?? "no limit"}</span>
                </span>
              </div>
              {coupon.usageLimit ? (
                <Meter value={coupon.usageCount} max={coupon.usageLimit} label="Coupon redemptions used" />
              ) : null}
            </div>
            <div className="flex items-baseline justify-between border-t border-slate-100 pt-3 text-[13px]">
              <span className="text-slate-500">Expires</span>
              <span className="font-medium text-slate-900">
                {coupon.expiresAt ? formatDate(coupon.expiresAt) : "Never"}
              </span>
            </div>
          </div>
        ) : (
          <EmptyState
            className="py-6"
            icon={<TicketPercent />}
            title="No coupon is live"
            description="Customers can't use any discount code right now."
            action={
              <Link href="/coupons?new=1" className={buttonClass("secondary", "sm")}>
                <Plus /> Create coupon
              </Link>
            }
          />
        )}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, error, isLoading, refetch, isFetching } = useGetDashboardQuery();
  const user = useAppSelector((s) => s.auth.user);
  const m = data?.data;
  const firstName = user?.name?.split(" ")[0];
  const coverage = m && m.totalBranches > 0 ? Math.round((m.activeBranches / m.totalBranches) * 100) : 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        title={firstName ? `${greeting()}, ${firstName}` : greeting()}
        description="Here's how the ALAYN platform looks right now."
        actions={
          <>
            <Button variant="secondary" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh numbers">
              <RefreshCw className={isFetching ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Link href="/coupons?new=1" className={buttonClass("primary")}>
              <Plus /> New coupon
            </Link>
          </>
        }
      />

      {error && (
        <ErrorState
          title="Couldn't load the overview"
          message={errorMessage(error, "Check your connection and try again.")}
          onRetry={refetch}
          retrying={isFetching}
        />
      )}

      <section aria-label="Key numbers" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile href="/outlets" label="Restaurant brands" value={m?.totalOutlets ?? 0} icon={<Store />} loading={isLoading}>
          Registered on ALAYN
        </StatTile>
        <StatTile href="/outlets" label="Branches" value={m?.totalBranches ?? 0} icon={<MapPin />} loading={isLoading}>
          Physical locations across all brands
        </StatTile>
        <StatTile href="/outlets" label="Paying branches" value={m?.activeBranches ?? 0} icon={<Wallet />} loading={isLoading}>
          <div className="space-y-2">
            <span>
              <span className="font-medium text-slate-900">{coverage}%</span> of branches subscribed
            </span>
            <Meter value={m?.activeBranches ?? 0} max={m?.totalBranches ?? 0} label="Branches with an active subscription" />
          </div>
        </StatTile>
        <StatTile href="/coupons" label="Coupons" value={m?.totalCoupons ?? 0} icon={<TicketPercent />} loading={isLoading}>
          {m?.activeCoupon ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />1 live now
            </span>
          ) : (
            "None live right now"
          )}
        </StatTile>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Newest outlets"
            description="Restaurant brands that joined most recently"
            action={
              <Link
                href="/outlets"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-navy-600 hover:text-navy-900"
              >
                View all <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          {isLoading ? (
            <div className="space-y-1 px-2 pb-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3">
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : !m?.recentOutlets?.length ? (
            <EmptyState icon={<Store />} title="No outlets yet" description="New restaurant sign-ups will show up here." />
          ) : (
            <ul className="px-2 pb-2">
              {m.recentOutlets.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/outlets?outlet=${o.id}`}
                    className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50"
                  >
                    <Avatar name={o.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{o.name}</p>
                      <p className="truncate text-[13px] text-slate-500">
                        {o.businessType} · Joined {formatDate(o.createdAt)}
                      </p>
                    </div>
                    <span className="hidden text-[13px] tabular-nums text-slate-500 sm:block">
                      {o.branchCount} {o.branchCount === 1 ? "branch" : "branches"}
                    </span>
                    <ChevronRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <LiveCoupon coupon={m?.activeCoupon} loading={isLoading} />
      </div>
    </div>
  );
}
