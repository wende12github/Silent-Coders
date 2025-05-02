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

// Define the store state and actions
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  skills: Skill[];
  sessions: Session[];
  transactions: WalletTransaction[];
  leaderboard: LeaderboardEntry[];
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  setSessions: (bookings: Session[]) => void;
  setSkills: (skills: Skill[]) => void;
}

// Create the Zustand store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: mockUser,
      isLoading: false,
      isAuthenticated: false,
      skills: mockSkills,
      sessions: mockSessions,
      transactions: mockTransactions,
      leaderboard: mockLeaderboard,

      login: async (email: string, password: string) => {
        
        set({ isLoading: true });
        try {
          set({ user: mockUser, isAuthenticated: true });
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          if (email === mockUser.email) {
            set({ user: mockUser, isAuthenticated: true });
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (
        name: string,
        username: string,
        email: string,
        password: string
      ) => {
        set({ isLoading: true });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Create a new user based on the mock user but with the provided details
          const newUser = {
            ...mockUser,
            name,
            username,
            email,
            date_joined: new Date().toISOString(),
          };

          set({ user: newUser, isAuthenticated: true });
        } catch (error) {
          console.error("Signup failed:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      setSessions: (sessions: Session[]) => {
        set({ sessions });
      },

      setSkills: (skills: Skill[]) => {
        set({ skills });
      },
    }),
    {
      name: "timebank-auth-storage", // name of the item in localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // only persist these fields
    }
  )
);
