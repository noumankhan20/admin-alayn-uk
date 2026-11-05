import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const API_VERSION = "v1";
const BASE_DOMAIN = RAW_URL.replace(/\/$/, "").replace(/\/api\/v\d+$/, "");
export const BASE_URL = `${BASE_DOMAIN}/api/${API_VERSION}`;

const setCredentialsAction = (payload: { user: any }) => ({ type: "auth/setCredentials", payload });
const logoutAction = () => ({ type: "auth/logout" });

const normalizePath = (url: string): string => {
  const cleaned = url.replace(/^\/?(api\/v\d+\/)+/, "").replace(/^\/+/, "");
  return `/${cleaned}`;
};

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    headers.set("x-portal", "admin");
    return headers;
  },
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const subscribeTokenRefresh = (cb: () => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let normalizedArgs: string | FetchArgs = args;
  if (typeof args === "string") {
    normalizedArgs = normalizePath(args);
  } else if (args && typeof args === "object" && args.url) {
    normalizedArgs = { ...args, url: normalizePath(args.url) };
  }

  let result = await baseQuery(normalizedArgs, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const urlStr = typeof normalizedArgs === "string" ? normalizedArgs : normalizedArgs.url;
    if (urlStr.includes("auth/refresh") || urlStr.includes("auth/login") || urlStr.includes("auth/logout")) {
      return result;
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh(async () => {
          resolve(await baseQuery(normalizedArgs, api, extraOptions));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const refreshData = (refreshResult.data as any)?.data || refreshResult.data;
        const user = refreshData?.user;

        if (user) {
          api.dispatch(setCredentialsAction({ user }));
        }

        isRefreshing = false;
        onRefreshed();

        result = await baseQuery(normalizedArgs, api, extraOptions);
      } else {
        isRefreshing = false;
        refreshSubscribers = [];
        api.dispatch(logoutAction());
      }
    } catch {
      isRefreshing = false;
      refreshSubscribers = [];
      api.dispatch(logoutAction());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  refetchOnMountOrArgChange: 30,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ["Auth", "Dashboard", "Outlets", "OutletDetail", "Coupons"],
  endpoints: () => ({}),
});
