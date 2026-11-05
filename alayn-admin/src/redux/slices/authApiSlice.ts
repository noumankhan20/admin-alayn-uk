import { baseApi } from "../store/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body: { email: string; password: string }) => ({
        url: "/auth/login",
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["Auth", "Dashboard", "Outlets", "Coupons"],
    }),

    getMe: builder.query({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),

    logout: builder.mutation<any, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
        credentials: "include",
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi;
