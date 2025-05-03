import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
<<<<<<< HEAD
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
=======
  AuthResponse,
  loginUser,
  refreshAccessToken,
  registerUser,
  RegisterUserData,
>>>>>>> 3a1b4d412ece11bd09dac78ec2d5334459db4d1b
} from "../services/api";
import { LogoutResponse, useLogout } from "../hooks/hooks";
import { User } from "./types";

interface AuthState {
<<<<<<< HEAD
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
	fetchTransactions: () => Promise<void>;
=======
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
>>>>>>> 3a1b4d412ece11bd09dac78ec2d5334459db4d1b
}

// Create the Zustand store with persistence
export const useAuthStore = create<AuthState>()(
<<<<<<< HEAD
	persist(
		(set) => ({
			user: mockUser,
			isLoading: false,
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
      fetchTransactions : async () => {
        try {
          set({isLoading:true});
          const response = await fetch 
        }
        catch (error){
          console.log("Failed to fetch transactions: ",error)
        }
      }
		}),
		{
			name: "timebank-auth-storage",
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
=======
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
>>>>>>> 3a1b4d412ece11bd09dac78ec2d5334459db4d1b
);
