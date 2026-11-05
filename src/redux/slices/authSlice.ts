import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | string;
  phoneNo?: string;
}

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const getInitialUser = (): AdminUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem("alayn_admin_user");
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getInitialUser(),
  isAuthenticated: !!getInitialUser(),
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user?: AdminUser } | AdminUser>
    ) => {
      const payload = action.payload;
      const user = (payload as any)?.user || payload;

      state.user = user;
      state.isAuthenticated = !!user && user.role === "SUPER_ADMIN";
      state.isInitialized = true;

      if (typeof window !== "undefined" && user) {
        try {
          localStorage.setItem("alayn_admin_user", JSON.stringify(user));
        } catch {
          // ignore
        }
      }
    },

    setInitialized: (state) => {
      state.isInitialized = true;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;

      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("alayn_admin_user");
          document.cookie = "alayn_admin_token=; Max-Age=0; path=/;";
          document.cookie = "token=; Max-Age=0; path=/;";
          document.cookie = "refreshToken=; Max-Age=0; path=/;";
        } catch {
          // ignore
        }
      }
    },
  },
});

export const { setCredentials, setInitialized, logout } = authSlice.actions;
export default authSlice.reducer;
