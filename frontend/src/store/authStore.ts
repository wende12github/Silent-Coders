import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

import { User } from "./types";
import { REFRESH_TOKEN_STORAGE_KEY } from "../utils/constants";

import { setAuthToken } from "../services/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;

  setAuthenticated: (isAuthenticated: boolean) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,

      setAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
        setAuthToken(accessToken);
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
      },

      clearTokens: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });

        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        setAuthToken(null);
      },

      setUser: (user: User | null) => set({ user }),
    }),
    {
      name: "timebank-auth-storage",

      partialize: (state) => ({
        user: state.user,

        accessToken: state.accessToken,
        refreshToken: state.refreshToken,

        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => (state) => {
        console.log("Rehydrating auth store...");
        if (state?.accessToken) {
          console.log(
            "Access token found on rehydration, setting auth header."
          );

          setAuthToken(state.accessToken);
        } else {
          console.log("No access token found on rehydration.");

          if (state?.accessToken) {
            state.isAuthenticated = false;
          }
          setAuthToken(null);
        }
      },
    } as PersistOptions<
      AuthState,
      Pick<
        AuthState,
        "user" | "accessToken" | "refreshToken" | "isAuthenticated"
      >
    >
  )
);
