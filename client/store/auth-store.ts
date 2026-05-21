// client/stores/auth-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import api from "@/lib/api";
import type { AuthState, AuthActions, User } from "@/types/auth";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      setAccessToken: (token) =>
        set((state) => {
          state.accessToken = token;
        }),

      register: async (name, email, password) => {
        set((state) => {
          state.isLoading = true;
        });
        try {
          const { data } = await api.post("/auth/register", {
            name,
            email,
            password,
          });
          set((state) => {
            state.accessToken = data.data.accessToken;
            state.user = data.data.user;
            state.isAuthenticated = true;
          });
        } finally {
          set((state) => {
            state.isLoading = false;
          });
        }
      },

      login: async (email, password) => {
        set((state) => {
          state.isLoading = true;
        });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          set((state) => {
            state.accessToken = data.data.accessToken;
            state.user = data.data.user;
            state.isAuthenticated = true;
          });
        } finally {
          set((state) => {
            state.isLoading = false;
          });
        }
      },
      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
        } finally {
          get().reset();
          window.location.href = "/login";
        }
      },

      refreshToken: async () => {
        try {
          const { data } = await api.post("/auth/refresh");
          set((state) => {
            state.accessToken = data.data.accessToken;
          });
          return true;
        } catch {
          get().reset();
          return false;
        }
      },

      fetchMe: async () => {
        set((state) => {
          state.isLoading = true;
        });
        try {
          const { data } = await api.get("/auth/me");
          set((state) => {
            state.user = data.data as User;
            state.isAuthenticated = true;
          });
        } catch {
          get().reset();
        } finally {
          set((state) => {
            state.isLoading = false;
          });
        }
      },

      reset: () => set(() => ({ ...initialState })),
    })),

    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export const useUser = () => useAuthStore((s) => s.user);
export const useIsAdmin = () => useAuthStore((s) => s.user?.role === "admin");
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useAuthLoading = () => useAuthStore((s) => s.isLoading);
