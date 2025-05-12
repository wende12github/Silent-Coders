import { useState, useEffect } from "react";
import { fetchWalletBalance, fetchWalletTransactions } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { WalletTransaction } from "../store/types";

export const useWallet = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuthStore();

  const fetchBalance = async () => {
    if (!accessToken) {
      setBalance(null);
      return;
    }
    try {
      setIsLoading(true);

      const response = await fetchWalletBalance();
      setBalance(response.balance);
    } catch (err) {
      setError("Failed to fetch wallet balance");
      console.error("Fetch wallet balance error:", err);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!accessToken) {
      setTransactions([]);
      return;
    }
    try {
      setIsLoading(true);

      const response = await fetchWalletTransactions();
      setTransactions(response);
    } catch (err) {
      setError("Failed to fetch transactions");
      console.error("Fetch transactions error:", err);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchBalance();
      fetchTransactions();
    } else {
      setBalance(null);
      setTransactions([]);
    }
  }, [accessToken]);

  const refetchWalletData = () => {
    if (accessToken) {
      fetchBalance();
      fetchTransactions();
    }
  };

  return {
    balance,
    transactions,
    isLoading,
    error,
    fetchBalance,
    fetchTransactions,
    refetchWalletData,
  };
};
