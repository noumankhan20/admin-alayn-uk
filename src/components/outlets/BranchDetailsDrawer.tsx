"use client";

import React, { useState } from "react";
import { Clock, Mail, MapPin, Phone, ReceiptText, RefreshCw, Store, Trash2, Users, Armchair, X } from "lucide-react";
import { useGetOutletDetailQuery, useDeleteBranchMutation, BranchItem } from "@/redux/slices/adminApiSlice";
import { formatDate } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { Sheet } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge, Tone } from "@/components/ui/Badge";
import { Avatar, Card, DetailRow } from "@/components/ui/Layout";
import { CopyButton } from "@/components/ui/Controls";
import { EmptyState, ErrorState, Skeleton, errorMessage } from "@/components/ui/Feedback";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface DrawerProps {
  businessId: string | null;
  onClose: () => void;
}

const KITCHEN_LABEL: Record<NonNullable<BranchItem["kitchenMode"]>, string> = {
  KOT: "Printed tickets (KOT)",
  KDS: "Kitchen screen (KDS)",
  HYBRID: "Printed tickets + kitchen screen",
};

function humanize(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ");
}

function subscriptionBadge(b: BranchItem): { tone: Tone; label: string } {
  if (b.isSubscriptionActive) return { tone: "success", label: "Subscribed" };
  if (b.subscriptionStatus === "EXPIRED") return { tone: "danger", label: "Expired" };
  return { tone: "warning", label: humanize(b.subscriptionStatus || "Not subscribed") };
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-xs text-slate-500 [&_svg]:size-3.5">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function BranchCard({ branch, onDelete }: { branch: BranchItem; onDelete: () => void }) {
  const sub = subscriptionBadge(branch);
  const isQr = branch.tableOrderMode === "ORDER_AND_PAY";
  const hours =
    branch.openingTime && branch.closingTime ? `${branch.openingTime} – ${branch.closingTime}` : "Not set";
  const plan = branch.planCode === "ALAYN_PRO" ? "Alayn Pro" : "Alayn Basic";
  const aggregators = branch.aggregators?.map((a) => (a === "SWIGGY" ? "Swiggy" : "Zomato")).join(" + ");

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold">{branch.name}</h3>
            <Badge tone={sub.tone} dot>
              {sub.label}
            </Badge>
          </div>
          <p className="mt-1 flex items-start gap-1.5 text-[13px] text-slate-500">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>{[branch.address, branch.city, branch.state].filter(Boolean).join(", ")}</span>
          </p>
        </div>
        <Button
          variant="danger-ghost"
          size="icon-sm"
          onClick={onDelete}
          aria-label={`Delete branch ${branch.name}`}
          title="Delete branch"
        >
          <Trash2 />
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat icon={<Armchair />} label="Tables" value={branch.tablesCount} />
        <Stat icon={<Users />} label="Staff" value={branch.staffCount} />
        <Stat icon={<ReceiptText />} label="Orders" value={branch.ordersCount.toLocaleString("en-IN")} />
        <Stat icon={<Clock />} label="Hours" value={hours} />
      </div>

      <dl className="mt-3 divide-y divide-slate-100">
        <DetailRow label="Plan">
          {plan}
          {aggregators && <span className="text-slate-500"> · {aggregators}</span>}
          {branch.planName && <span className="block text-xs font-normal text-slate-400">{branch.planName}</span>}
        </DetailRow>
        {branch.currentPeriodEnd && (
          <DetailRow label={branch.isSubscriptionActive ? "Paid until" : "Ended on"}>
            {formatDate(branch.currentPeriodEnd)}
          </DetailRow>
        )}
        <DetailRow label="Table ordering">
          {isQr ? "Guests order & pay by QR" : "Waiter takes orders"}
          {isQr && (
            <span className="block text-xs font-normal text-slate-500">
              {branch.allowPayAtCounter ? "Paying at the counter is allowed" : "Online payment required before cooking"}
            </span>
          )}
        </DetailRow>
        <DetailRow label="Kitchen">{KITCHEN_LABEL[branch.kitchenMode ?? "HYBRID"]}</DetailRow>
        {branch.gstin && (
          <DetailRow label="GSTIN">
            <span className="font-mono">{branch.gstin}</span>
          </DetailRow>
        )}
        {branch.phone && (
          <DetailRow label="Branch phone">
            <a href={`tel:${branch.phone}`} className="hover:underline">
              {branch.phone}
            </a>
          </DetailRow>
        )}
      </dl>
    </Card>
  );
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
      showToast.success("Branch deleted", `${branchToDelete.name} was permanently removed.`);
      setBranchToDelete(null);
    } catch (err) {
      showToast.error("Couldn't delete branch", errorMessage(err, "Please try again."));
    }
  };

  const detail = data?.data;
  const phone = detail?.contactDetail || detail?.owner?.phone;

  return (
    <>
      <Sheet open={!!businessId} onClose={onClose} label={detail?.name ? `${detail.name} details` : "Outlet details"}>
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          {isLoading ? (
            <>
              <Skeleton className="size-11 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            </>
          ) : (
            <>
              <Avatar name={detail?.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-bold">{detail?.name ?? "Outlet"}</h2>
                <p className="truncate text-[13px] text-slate-500">
                  {detail?.businessType}
                  {detail?.createdAt && ` · Joined ${formatDate(detail.createdAt)}`}
                </p>
              </div>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw className={isFetching ? "animate-spin" : ""} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" title="Close (Esc)">
            <X className="!size-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-56 w-full rounded-xl" />
            </div>
          ) : error || !detail ? (
            <ErrorState
              title="Couldn't load this outlet"
              message={errorMessage(error, "It may have been deleted, or the connection dropped.")}
              onRetry={refetch}
              retrying={isFetching}
            />
          ) : (
            <>
              <section aria-labelledby="owner-heading">
                <h3 id="owner-heading" className="mb-2 text-[13px] font-semibold text-slate-500">
                  Owner
                </h3>
                <Card className="px-4 py-1.5 sm:px-5">
                  <dl className="divide-y divide-slate-100">
                    <DetailRow label="Name">{detail.owner?.name ?? <span className="text-slate-400">No owner linked</span>}</DetailRow>
                    {detail.owner?.email && (
                      <DetailRow label="Email">
                        <span className="inline-flex items-center gap-1">
                          <a href={`mailto:${detail.owner.email}`} className="inline-flex items-center gap-1.5 hover:underline">
                            <Mail className="size-3.5 text-slate-400" />
                            {detail.owner.email}
                          </a>
                          <CopyButton value={detail.owner.email} label="Copy email" />
                        </span>
                      </DetailRow>
                    )}
                    {phone && (
                      <DetailRow label="Phone">
                        <span className="inline-flex items-center gap-1">
                          <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 hover:underline">
                            <Phone className="size-3.5 text-slate-400" />
                            {phone}
                          </a>
                          <CopyButton value={phone} label="Copy phone" />
                        </span>
                      </DetailRow>
                    )}
                    <DetailRow label="Subscribed branches">
                      <span className="tabular-nums">
                        {detail.activeBranchesCount} of {detail.totalBranches}
                      </span>
                    </DetailRow>
                  </dl>
                </Card>
              </section>

              <section aria-labelledby="branches-heading">
                <h3 id="branches-heading" className="mb-2 text-[13px] font-semibold text-slate-500">
                  Branches ({detail.branches.length})
                </h3>
                {detail.branches.length === 0 ? (
                  <Card>
                    <EmptyState icon={<Store />} title="No branches yet" description="This brand hasn't added a location." />
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {detail.branches.map((b) => (
                      <BranchCard key={b.id} branch={b} onDelete={() => setBranchToDelete({ id: b.id, name: b.name })} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </Sheet>

      <ConfirmDialog
        open={!!branchToDelete}
        onClose={() => setBranchToDelete(null)}
        onConfirm={handleDeleteBranch}
        loading={isDeletingBranch}
        title={`Delete ${branchToDelete?.name ?? "branch"}?`}
        description="This can't be undone."
        consequences={[
          "This branch location",
          "All its tables, orders and receipts",
          "Staff assignments and attendance",
          "Its subscription record",
        ]}
        requireText={branchToDelete?.name}
        confirmLabel="Delete branch"
      />
    </>
  );
}
