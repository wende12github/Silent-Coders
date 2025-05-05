// hooks/useWallet.ts
import { useState, useEffect } from "react";
import {
  fetchWalletBalance,
  fetchWalletTransactions,
} from "../services/api";
import { useAuthStore } from "../store/authStore";
import { WalletTransaction } from "../store/types";
export const useWallet = () => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuthStore();

  const fetchBalance = async () => {
    try {
      setIsLoading(true);
      const response = await fetchWalletBalance();
      setBalance(response.balance);
    } catch (err) {
      setError("Failed to fetch wallet balance");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetchWalletTransactions();
      setTransactions(response);
    } catch (err) {
      setError("Failed to fetch transactions");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchBalance();
      fetchTransactions();
    }
  }, [accessToken]);

  return {
    balance,
    transactions,
    isLoading,
    error,
    fetchBalance,
    fetchTransactions,
  };
};