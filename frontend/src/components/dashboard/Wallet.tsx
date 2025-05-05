"use client";
import { useState, useMemo } from "react";
import { useWallet } from "../../hooks/useWallet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import Tabs, { TabItem } from "../ui/Tabs";
import Button from "../ui/Button";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Select, SelectItem } from "../ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";

export default function WalletPage() {
  const { balance, transactions, isLoading, error } = useWallet();

  const [timeRange, setTimeRange] = useState("all");

  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to midnight

    return transactions.filter((transaction) => {
      if (timeRange === "all") return true;

      const transactionDate = new Date(transaction.created_at);
      transactionDate.setHours(0, 0, 0, 0);

      switch (timeRange) {
        case "week":
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(now.getDate() - 7);
          return transactionDate >= oneWeekAgo;
        case "month":
          const oneMonthAgo = new Date(now);
          oneMonthAgo.setMonth(now.getMonth() - 1);
          return transactionDate >= oneMonthAgo;
        case "year":
          const oneYearAgo = new Date(now);
          oneYearAgo.setFullYear(now.getFullYear() - 1);
          return transactionDate >= oneYearAgo;
        default:
          return true;
      }
    });
  }, [transactions, timeRange]);

  const { totalEarned, totalSpent } = useMemo(() => {
    let earned = 0;
    let spent = 0;

    filteredTransactions.forEach((t) => {
      const amount = Number(t.amount); // ✅ Ensures correct numerical operations
    
      if (amount > 0) earned += amount;
      if (amount < 0) spent += Math.abs(amount);
    });
    console.log("Total Earned:", earned);
    console.log("Total Spent:", spent);
    return { totalEarned: earned, totalSpent: spent };
  }, [filteredTransactions]);

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (isLoading) {
    return <div className="p-6">Loading wallet data...</div>;
  }

  const walletTabs: TabItem[] = [
    {
      value: "all",
      label: "All Transactions",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              A record of all your time credit transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(parseISO(transaction.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{transaction.reason}</TableCell>
                      <TableCell
                        className={`text-right ${
                          transaction.amount > 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount} hrs
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No transactions found for the selected time period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "earned",
      label: "Earned",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Earned Credits</CardTitle>
            <CardDescription>
              Time credits you've earned from teaching others
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.filter((t) => t.amount > 0).length > 0 ? (
                  filteredTransactions
                    .filter((t) => t.amount > 0)
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(
                            parseISO(transaction.created_at),
                            "MMM d, yyyy"
                          )}
                        </TableCell>
                        <TableCell>{transaction.reason}</TableCell>
                        <TableCell className="text-right text-green-500">
                          +{transaction.amount} hrs
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No earned credits found for the selected time period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "spent",
      label: "Spent",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Spent Credits</CardTitle>
            <CardDescription>
              Time credits you've spent on learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.filter((t) => t.amount < 0).length > 0 ? (
                  filteredTransactions
                    .filter((t) => t.amount < 0)
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(
                            parseISO(transaction.created_at),
                            "MMM d, yyyy"
                          )}
                        </TableCell>
                        <TableCell>{transaction.reason}</TableCell>
                        <TableCell className="text-right text-red-500">
                          {transaction.amount} hrs
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No spent credits found for the selected time period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Wallet</h1>
          <p className="text-muted-foreground">
            Manage your time credits and view transaction history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            placeholder="Time range"
            className="w-40"
          >
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Balance</CardDescription>
            <CardTitle className="text-3xl">
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                {balance} hrs
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Earned</CardDescription>
            <CardTitle className="text-3xl">
              <div className="flex items-center text-green-500">
                <TrendingUp className="mr-2 h-5 w-5" />
                {totalEarned} hrs
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
            <CardTitle className="text-3xl">
              <div className="flex items-center text-red-500">
                <TrendingDown className="mr-2 h-5 w-5" />
                {totalSpent.toFixed(1)} hrs
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs items={walletTabs} defaultValue="all" className="w-full" />
    </div>
  );
}
