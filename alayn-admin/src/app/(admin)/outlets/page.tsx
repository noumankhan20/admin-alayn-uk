"use client";

import React, { useState } from "react";
import {
  Store,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  RefreshCw,
  AlertCircle,
  Building2,
  Trash2,
} from "lucide-react";
import {
  useGetOutletsQuery,
  useDeleteBusinessMutation,
} from "@/redux/slices/adminApiSlice";
import { formatDate } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { BranchDetailsDrawer } from "@/components/outlets/BranchDetailsDrawer";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";

export default function OutletsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useGetOutletsQuery({
    page,
    limit: 15,
    search: search.trim() || undefined,
  });

  const [deleteBusiness, { isLoading: isDeletingBusiness }] = useDeleteBusinessMutation();

  const handleDeleteBusiness = async () => {
    if (!businessToDelete) return;
    try {
      await deleteBusiness(businessToDelete.id).unwrap();
      showToast.success(
        "Enterprise Deleted",
        `"${businessToDelete.name}" and all branches were permanently deleted from the database.`
      );
      setBusinessToDelete(null);
    } catch (err: any) {
      showToast.error(
        "Deletion Failed",
        err?.data?.message || "Could not delete outlet enterprise from database."
      );
    }
  };

  const outletsData = data?.data;

  return (
    <div className="space-y-6">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-[#1B2A4A] tracking-tight font-heading">
            Outlets & Branch Topology
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Explore parent restaurant brands and their physical branch networks across ALAYN
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search outlet or owner..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input pl-10 text-xs py-2"
            />
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-ghost text-xs p-2.5"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-[#D3232A] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Failed to fetch outlets list. Please check connectivity.</span>
        </div>
      )}

      {/* Outlets Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F5F8] border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Outlet Brand</th>
                <th className="py-3.5 px-4 text-center">Branches</th>
                <th className="py-3.5 px-4">Business Owner</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="h-4 w-36 bg-zinc-200 rounded" />
                      <div className="h-3 w-20 bg-zinc-100 rounded mt-1.5" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-5 w-12 bg-zinc-200 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-28 bg-zinc-200 rounded" />
                      <div className="h-3 w-36 bg-zinc-100 rounded mt-1.5" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-zinc-200 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-20 bg-zinc-200 rounded" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="h-7 w-20 bg-zinc-200 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : !outletsData?.items || outletsData.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-400">
                    <Store className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                    <p className="font-semibold text-sm text-zinc-600">
                      No outlets have been registered yet.
                    </p>
                    <p className="text-xs mt-1">
                      Registered restaurant businesses will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                outletsData.items.map((outlet) => (
                  <tr
                    key={outlet.id}
                    className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedBusinessId(outlet.id)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 flex items-center justify-center font-bold text-xs text-[#1B2A4A] shrink-0">
                          {outlet.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#1B2A4A] group-hover:text-[#D3232A] transition-colors">
                            {outlet.name}
                          </p>
                          <span className="inline-block text-[11px] text-zinc-500 font-medium">
                            {outlet.businessType}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#1B2A4A]/5 text-[#1B2A4A] border border-[#1B2A4A]/10">
                        <MapPin className="w-3 h-3 text-[#D3232A]" />
                        {outlet.branchCount} {outlet.branchCount === 1 ? "branch" : "branches"}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {outlet.owner ? (
                        <div>
                          <p className="font-semibold text-zinc-900">{outlet.owner.name}</p>
                          <p className="text-[11px] text-zinc-500 font-mono">{outlet.owner.email}</p>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">No owner linked</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono text-zinc-600">
                      {outlet.contactDetail || outlet.owner?.phone || "N/A"}
                    </td>

                    <td className="py-4 px-4 text-zinc-500 font-medium">
                      {formatDate(outlet.createdAt)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBusinessId(outlet.id);
                          }}
                          className="btn-ghost py-1 px-2.5 text-xs inline-flex items-center gap-1.5"
                          title="Inspect branches"
                        >
                          <Eye className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Inspect</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBusinessToDelete({ id: outlet.id, name: outlet.name });
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-[#D3232A] hover:bg-rose-50 transition-colors cursor-pointer"
                          title={`Permanently delete "${outlet.name}" from database`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {outletsData && outletsData.totalPages > 1 && (
          <div className="py-3.5 px-6 border-t border-zinc-200 flex items-center justify-between bg-zinc-50 text-xs text-zinc-600">
            <span>
              Showing Page <strong>{outletsData.page}</strong> of <strong>{outletsData.totalPages}</strong> (
              {outletsData.total} total outlets)
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
                disabled={page >= outletsData.totalPages}
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

      {/* Drilldown Drawer */}
      <BranchDetailsDrawer
        businessId={selectedBusinessId}
        onClose={() => setSelectedBusinessId(null)}
      />

      {/* Permanent Deletion Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!businessToDelete}
        onClose={() => setBusinessToDelete(null)}
        onConfirm={handleDeleteBusiness}
        title="Delete Outlet Enterprise"
        entityName={businessToDelete?.name || ""}
        entityType="Brand"
        subWarning="This will delete this restaurant brand and every branch location, menu, and order from the database."
        isDeleting={isDeletingBusiness}
      />
    </div>
  );
}
