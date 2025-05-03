import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
    Session,
    LeaderboardEntry,
    mockSessions,
    mockLeaderboard,
    mockSkills,
    mockTransactions,
    mockUser,
    Skill,
    User,
    WalletTransaction,
} from "./types";
import {
    AuthResponse,
    loginUser,
    LogoutResponse,
    logoutUser,
    refreshAccessToken,
    registerUser,
    RegisterUserData,
  fetchCurrentUser,
  fetchWalletTransactions,
  fetchLeaderboard,
  fetchMySessions,
  fetchAllSkills,
} from "../services/api";

// Define the store state and actions
interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    skills: Skill[];
    sessions: Session[];
    transactions: WalletTransaction[];
    leaderboard: LeaderboardEntry[];
    login: ({
        email,
        password,
    }: {
        email: string;
        password: string;
    }) => Promise<AuthResponse>;
    signup: (userData: RegisterUserData) => Promise<void>;
    logout: () => Promise<LogoutResponse>;
    setAuthenticated: (isAuthenticated: boolean) => void;
    refreshToken: string | null;
    setTokens: (accessToken: string, refreshToken: string) => void;
    accessToken: string | null;
    clearTokens: () => void;
    refreshAccessToken: () => Promise<void>;
    error: string | null;
    fetchTransactions: () => Promise<void>;
    fetchUser: () => Promise<void>;
}

// Create the Zustand store with persistence
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: mockUser,
            isLoading: false,
            error:null,
            isAuthenticated: false,
            skills: mockSkills,
            sessions: mockSessions,
            transactions: mockTransactions,
            leaderboard: mockLeaderboard,
            login: loginUser,
            signup: registerUser,
            logout: logoutUser,
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
            fetchTransactions: async () => {
                set({ isLoading: true });
                try {
                  const transactions = await fetchWalletTransactions();
                  set({ transactions, isLoading: false });
                } catch (error) {
                  set({ error: error.message, isLoading: false });
                }
              },
              fetchUser: async () => {
                set({ isLoading: true });
                try {
                  const user = await fetchCurrentUser();
                  set({ user, isLoading: false });
                } catch (error) {
                  set({ error: error.message, isLoading: false });
                }
              },
        }),
        {
            name: "timebank-auth-storage",
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
