import { baseApi } from "../store/baseApi";

export interface DashboardMetrics {
  totalOutlets: number;
  totalBranches: number;
  activeBranches: number;
  totalCoupons: number;
  activeCoupon: {
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    expiresAt: string | null;
    usageCount: number;
    usageLimit: number | null;
  } | null;
  recentOutlets: Array<{
    id: string;
    name: string;
    businessType: string;
    branchCount: number;
    createdAt: string;
  }>;
}

export interface BusinessItem {
  id: string;
  name: string;
  businessType: string;
  contactDetail: string;
  branchCount: number;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
}

export interface BranchItem {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string | null;
  gstin: string | null;
  openingTime: string | null;
  closingTime: string | null;
  subscriptionStatus: string;
  isSubscriptionActive: boolean;
  planName: string;
  /** ALAYN_BASIC or ALAYN_PRO (old and free-coupon plans count as Pro) */
  planCode?: "ALAYN_BASIC" | "ALAYN_PRO";
  /** Pro only: SWIGGY and/or ZOMATO */
  aggregators?: string[];
  currentPeriodEnd: string | null;
  tablesCount: number;
  staffCount: number;
  ordersCount: number;
  tableOrderMode?: "WAITER_SERVICE" | "ORDER_AND_PAY";
  allowPayAtCounter?: boolean;
  kitchenMode?: "KOT" | "KDS" | "HYBRID";
  createdAt: string;
}

export interface OutletDetailData {
  id: string;
  name: string;
  businessType: string;
  contactDetail: string | null;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    registeredAt: string;
  } | null;
  totalBranches: number;
  activeBranchesCount: number;
  branches: BranchItem[];
}

/** Which product's coupons to manage: Alayn, or Alayn Lite (relayed by the Alayn backend). */
export type CouponProduct = "alayn" | "lite";
export type CouponStatus = "ACTIVE" | "DISABLED" | "EXPIRED" | "USED_UP";

export interface CouponItem {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  status: CouponStatus;
  isActive: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  /** Days of free access a 100% coupon gives from redemption; null = free until expiry (or 1 year). */
  freeDurationDays: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const couponsUrl = (product: CouponProduct, path = "") =>
  `/admin/coupons${path}${product === "lite" ? "?product=lite" : ""}`;

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<{ success: boolean; data: DashboardMetrics }, void>({
      query: () => "/admin/dashboard",
      providesTags: ["Dashboard"],
    }),

    getOutlets: builder.query<
      {
        success: boolean;
        data: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          items: BusinessItem[];
        };
      },
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set("page", String(params.page));
        if (params.limit) queryParams.set("limit", String(params.limit));
        if (params.search) queryParams.set("search", params.search);
        return `/admin/outlets?${queryParams.toString()}`;
      },
      providesTags: ["Outlets"],
    }),

    getOutletDetail: builder.query<{ success: boolean; data: OutletDetailData }, string>({
      query: (id) => `/admin/outlets/${id}`,
      providesTags: (_result, _error, id) => [{ type: "OutletDetail", id }],
    }),

    getCoupons: builder.query<
      {
        success: boolean;
        data: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          items: CouponItem[];
        };
      },
      { page?: number; limit?: number; status?: string; search?: string; product?: CouponProduct }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set("page", String(params.page));
        if (params.limit) queryParams.set("limit", String(params.limit));
        if (params.status && params.status !== "ALL") queryParams.set("status", params.status);
        if (params.search) queryParams.set("search", params.search);
        if (params.product === "lite") queryParams.set("product", "lite");
        return `/admin/coupons?${queryParams.toString()}`;
      },
      providesTags: ["Coupons"],
    }),

    createCoupon: builder.mutation<
      { success: boolean; data: CouponItem },
      {
        product: CouponProduct;
        data: {
          code: string;
          discountType: "PERCENTAGE" | "FIXED_AMOUNT";
          discountValue: number;
          isActive?: boolean;
          expiresAt?: string | null;
          usageLimit?: number | null;
          freeDurationDays?: number | null;
        };
      }
    >({
      query: ({ product, data }) => ({
        url: couponsUrl(product),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Coupons", "Dashboard"],
    }),

    updateCoupon: builder.mutation<
      { success: boolean; data: CouponItem },
      {
        id: string;
        product: CouponProduct;
        data: {
          discountType?: "PERCENTAGE" | "FIXED_AMOUNT";
          discountValue?: number;
          isActive?: boolean;
          expiresAt?: string | null;
          usageLimit?: number | null;
          freeDurationDays?: number | null;
        };
      }
    >({
      query: ({ id, product, data }) => ({
        url: couponsUrl(product, `/${id}`),
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Coupons", "Dashboard"],
    }),

    deleteCoupon: builder.mutation<{ success: boolean }, { id: string; product: CouponProduct }>({
      query: ({ id, product }) => ({
        url: couponsUrl(product, `/${id}`),
        method: "DELETE",
      }),
      invalidatesTags: ["Coupons", "Dashboard"],
    }),

    deleteBusiness: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/admin/outlets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Outlets", "Dashboard"],
    }),

    deleteBranch: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/admin/branches/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Outlets", "OutletDetail", "Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetOutletsQuery,
  useGetOutletDetailQuery,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useDeleteBusinessMutation,
  useDeleteBranchMutation,
} = adminApi;

