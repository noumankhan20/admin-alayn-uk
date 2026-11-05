"use client";

import React from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { useAppSelector } from "@/redux/store/hooks";
import { useSignOut } from "@/lib/useSignOut";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, Card, CardHeader, DetailRow, PageHeader } from "@/components/ui/Layout";
import { CopyButton } from "@/components/ui/Controls";

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const { signOut, isSigningOut } = useSignOut();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="My account" description="Your administrator details and session." />

      <Card>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <Avatar name={user?.name || user?.email} size="xl" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-bold">{user?.name || "Administrator"}</h2>
              <Badge tone="navy" icon={<ShieldCheck />}>
                Super admin
              </Badge>
            </div>
            <p className="truncate text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        <dl className="divide-y divide-slate-100 border-t border-slate-100 px-5 py-1.5 sm:px-6">
          <DetailRow label="Name">{user?.name || "—"}</DetailRow>
          <DetailRow label="Email">
            {user?.email ? (
              <span className="inline-flex items-center gap-1">
                {user.email}
                <CopyButton value={user.email} label="Copy email" />
              </span>
            ) : (
              "—"
            )}
          </DetailRow>
          <DetailRow label="Phone">{user?.phoneNo || <span className="text-slate-400">Not added</span>}</DetailRow>
          <DetailRow label="Access">Full access to all outlets, branches and coupons</DetailRow>
        </dl>
      </Card>

      <Card>
        <CardHeader title="Session" description="How your sign-in is kept safe" />
        <ul className="space-y-2 px-5 pb-4 text-sm text-slate-600 sm:px-6">
          <li className="flex gap-2.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
            Your sign-in is stored in secure, HTTP-only cookies that page scripts can&apos;t read.
          </li>
          <li className="flex gap-2.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
            Every admin action is checked on the server for super-admin access.
          </li>
          <li className="flex gap-2.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
            Prices and coupon discounts are always calculated on the server.
          </li>
        </ul>
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-slate-500">Using a shared computer? Sign out when you&apos;re done.</p>
          <Button variant="secondary" onClick={signOut} loading={isSigningOut}>
            {!isSigningOut && <LogOut />}
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}
