"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, RefreshCw, Store, Trash2 } from "lucide-react";
import { useGetOutletsQuery, useDeleteBusinessMutation, BusinessItem } from "@/redux/slices/adminApiSlice";
import { formatDate } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { BranchDetailsDrawer } from "@/components/outlets/BranchDetailsDrawer";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Avatar, Card, PageHeader } from "@/components/ui/Layout";
import { EmptyState, ErrorState, Skeleton, errorMessage } from "@/components/ui/Feedback";
import { Pagination, SearchInput, useDebouncedValue } from "@/components/ui/Controls";

const PAGE_SIZE = 15;

function OutletsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The open outlet lives in the URL, so it survives refresh and can be shared.
  const selectedId = searchParams.get("outlet");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<BusinessItem | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, error, refetch } = useGetOutletsQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });
  const [deleteBusiness, { isLoading: isDeleting }] = useDeleteBusinessMutation();

  const list = data?.data;
  const items = list?.items ?? [];

  const openOutlet = (id: string) => router.push(`${pathname}?outlet=${id}`, { scroll: false });
  const closeOutlet = () => router.replace(pathname, { scroll: false });

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteBusiness(toDelete.id).unwrap();
      showToast.success("Outlet deleted", `${toDelete.name} and all its branches were permanently removed.`);
      setToDelete(null);
    } catch (err) {
      showToast.error("Couldn't delete outlet", errorMessage(err, "Please try again."));
    }
  };

  const deleteButton = (o: BusinessItem) => (
    <Button
      variant="danger-ghost"
      size="icon-sm"
      onClick={(e) => {
        e.stopPropagation();
        setToDelete(o);
      }}
      aria-label={`Delete ${o.name}`}
      title="Delete outlet"
    >
      <Trash2 />
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outlets"
        description="Every restaurant brand on ALAYN. Select one to see its branches, plans and setup."
      />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 p-4">
          <SearchInput
            label="Search outlets"
            value={search}
            onChange={setSearch}
            placeholder="Search by brand or owner"
            className="w-full sm:w-80"
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

        {error ? (
          <div className="p-4">
            <ErrorState
              title="Couldn't load outlets"
              message={errorMessage(error, "Check your connection and try again.")}
              onRetry={refetch}
              retrying={isFetching}
            />
          </div>
        ) : isLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <Skeleton className="size-9 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="hidden h-4 w-40 md:block" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          debouncedSearch ? (
            <EmptyState
              icon={<Store />}
              title={`No outlets match “${debouncedSearch}”`}
              description="Check the spelling, or search by the owner's name or email."
              action={
                <Button variant="secondary" size="sm" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyState icon={<Store />} title="No outlets yet" description="Restaurants that sign up will appear here." />
          )
        ) : (
          <div className={isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>Owner</th>
                    <th>Phone</th>
                    <th className="text-right">Branches</th>
                    <th>Joined</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => openOutlet(o.id)}
                      className="group cursor-pointer hover:bg-slate-50/80"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={o.name} />
                          <div className="min-w-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openOutlet(o.id);
                              }}
                              className="block max-w-[260px] truncate text-left font-semibold text-slate-900 group-hover:text-navy-700"
                            >
                              {o.name}
                            </button>
                            <p className="text-[13px] text-slate-500">{o.businessType}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {o.owner ? (
                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate text-slate-900">{o.owner.name}</p>
                            <p className="max-w-[220px] truncate text-[13px] text-slate-500">{o.owner.email}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400">No owner linked</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap tabular-nums text-slate-600">
                        {o.contactDetail || o.owner?.phone || <span className="text-slate-400">—</span>}
                      </td>
                      <td className="text-right tabular-nums font-medium text-slate-900">{o.branchCount}</td>
                      <td className="whitespace-nowrap text-slate-600">{formatDate(o.createdAt)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {deleteButton(o)}
                          <ChevronRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {items.map((o) => (
                <li key={o.id} className="flex items-center gap-2 pr-3">
                  <button onClick={() => openOutlet(o.id)} className="flex min-w-0 flex-1 items-center gap-3 p-4 text-left">
                    <Avatar name={o.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{o.name}</p>
                      <p className="truncate text-[13px] text-slate-500">
                        {o.owner?.name ?? "No owner"} · {o.branchCount} {o.branchCount === 1 ? "branch" : "branches"}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-slate-300" />
                  </button>
                  {deleteButton(o)}
                </li>
              ))}
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
            noun={list.total === 1 ? "outlet" : "outlets"}
          />
        )}
      </Card>

      <BranchDetailsDrawer businessId={selectedId} onClose={closeOutlet} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={`Delete ${toDelete?.name ?? "outlet"}?`}
        description={
          toDelete
            ? `This permanently removes the brand and all ${toDelete.branchCount} of its ${
                toDelete.branchCount === 1 ? "branch" : "branches"
              }. It can't be undone.`
            : undefined
        }
        consequences={[
          "Every branch under this brand",
          "All orders, bills, tickets and receipts",
          "Menus, dishes, inventory and suppliers",
          "Staff records, shifts and attendance",
          "Subscription records",
        ]}
        requireText={toDelete?.name}
        confirmLabel="Delete outlet"
      />
    </div>
  );
}

export default function OutletsPage() {
  return (
    <Suspense fallback={null}>
      <OutletsContent />
    </Suspense>
  );
}
