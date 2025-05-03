import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AuthResponse,
  loginUser,
  refreshAccessToken,
  registerUser,
  RegisterUserData,
} from "../services/api";
import { LogoutResponse, useLogout } from "../hooks/hooks";
import { User } from "./types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<AuthResponse>;
  signup: (userData: RegisterUserData) => Promise<void>;
  logout: () => Promise<LogoutResponse | null>;
  setAuthenticated: (isAuthenticated: boolean) => void;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  accessToken: string | null;
  clearTokens: () => void;
  refreshAccessToken: () => Promise<void>;
}

// Create the Zustand store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: loginUser,
      signup: registerUser,
      logout: () => useLogout().logoutUser(),
      setAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
      },
      accessToken: null,
      refreshToken: null,
      setTokens: (refreshToken: string, accessToken: string) => {
        set({ refreshToken, accessToken });
      },
      clearTokens: () => {
        set({ accessToken: null, refreshToken: null });
        localStorage.removeItem("refresh_token");
      },
      refreshAccessToken: refreshAccessToken,
    }),
    {
      name: "timebank-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated || !!state.accessToken,
      }),
    }
  )
);
