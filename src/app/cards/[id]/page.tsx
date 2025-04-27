"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CreditLimitBar from "~/components/CreditLimitBar";
import { format } from "date-fns";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatNumberWithDots } from "~/lib/utils";
import CashbackPolicyDialog from "~/app/components/Dialog/CashbackPolicyDialog";
import EditTransactionDialog from "../../components/Dialog/EditTransactionDialog";
import Dialog, { DialogButton, DialogFooter } from "~/app/components/Dialog";
import AddTransactionDialog from "~/app/components/Dialog/AddTransactionDialog";
import CategoryDialog from "~/app/components/Dialog/CategoryDialog";
import EditCardColorDialog from "~/app/components/Dialog/EditCardColorDialog";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CashbackPolicy {
  id: string;
  categoryId: string;
  cashbackPercentage: number;
  maxCashback?: number;
  category: {
    name: string;
  };
}

interface CardDetails {
  id: string;
  cardName: string;
  bankName: string;
  cardType: string;
  cardNumberLast4: string;
  creditLimit?: number;
  currentSpending?: number;
  currentRepayment?: number;
  statementClosingDate?: number;
  paymentDueDate?: number;
  cashbackPolicies: CashbackPolicy[];
  cardColor?: string;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  transactionDate: string;
  merchantName: string;
  categoryId: string;
  category?: {
    name: string;
  };
  isExpense: boolean;
  cashbackEarned: number;
}

interface TransactionsResponse {
  transactions: Transaction[];
  totalCashback: number;
}

export default function CardDetailPage() {
  const params = useParams();
  const cardId = params.id as string;
  const [card, setCard] = useState<CardDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCashback, setTotalCashback] = useState(0);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterType, setFilterType] = useState<"week" | "statement">("statement");
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedStatementDate, setSelectedStatementDate] = useState<number | null>(null);
  const [isAddPolicyDialogOpen, setIsAddPolicyDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMonth] = useState(new Date());
  const [isEditColorDialogOpen, setIsEditColorDialogOpen] = useState(false);

  const fetchCardDetails = async () => {
    try {
      const [cardResponse, transactionsResponse] = await Promise.all([
        fetch(`/api/bank-cards/${cardId}`),
        fetch(`/api/bank-cards/${cardId}/transactions`),
      ]);

      if (!cardResponse.ok) {
        throw new Error("Failed to fetch card details");
      }
      if (!transactionsResponse.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const cardData = await cardResponse.json();
      const transactionsData: TransactionsResponse = await transactionsResponse.json();

      setCard(cardData);
      setTransactions(transactionsData.transactions);
      setTotalCashback(transactionsData.totalCashback);
      setFilteredTransactions(transactionsData.transactions);
      if (cardData.statementClosingDate) {
        setSelectedStatementDate(cardData.statementClosingDate);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCardDetails();
    fetchCategories();
  }, [cardId]);

  useEffect(() => {
    if (transactions.length === 0) return;

    let filtered = [...transactions];
    let periodCashback = 0;

    if (filterType === "week") {
      const startOfWeek = new Date(selectedWeek);
      startOfWeek.setDate(selectedWeek.getDate() - selectedWeek.getDay());
      const endOfWeek = new Date(selectedWeek);
      endOfWeek.setDate(selectedWeek.getDate() + (6 - selectedWeek.getDay()));

      filtered = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.transactionDate);
        return transactionDate >= startOfWeek && transactionDate <= endOfWeek;
      });

      // Calculate total cashback for the week
      periodCashback = filtered.reduce(
        (sum, transaction) => sum + (transaction.cashbackEarned || 0),
        0
      );
    } else if (filterType === "statement") {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      
      // Calculate the statement period
      let statementStartDate: Date;
      let statementEndDate: Date;
      
      if (currentDate.getDate() < selectedStatementDate!) {
        // If current date is before statement date, show from last month's statement date to today
        statementStartDate = new Date(currentYear, currentMonth - 1, selectedStatementDate!);
        statementEndDate = currentDate;
      } else {
        // If current date is after statement date, show from this month's statement date to today
        statementStartDate = new Date(currentYear, currentMonth, selectedStatementDate!);
        statementEndDate = currentDate;
      }

      filtered = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.transactionDate);
        return transactionDate >= statementStartDate && transactionDate <= statementEndDate;
      });

      // Calculate total cashback for the statement period
      periodCashback = filtered.reduce(
        (sum, transaction) => sum + (transaction.cashbackEarned || 0),
        0
      );
    }

    setTotalCashback(periodCashback);
    setFilteredTransactions(filtered);
  }, [transactions, filterType, selectedWeek, selectedStatementDate]);

  const handleTransactionAdded = () => {
    // Refresh transactions after adding a new one
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/bank-cards/${cardId}/transactions`);
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const data: TransactionsResponse = await response.json();
        setTransactions(data.transactions);
        setTotalCashback(data.totalCashback);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };
    fetchTransactions();
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?cardId=${cardId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    setIsAddCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsAddCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to delete category");
      }

      setCategories(categories.filter((c) => c.id !== categoryId));
      fetchCardDetails(); // Refresh card details to update cashback policies
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCategoryDialogSuccess = () => {
    fetchCategories();
    fetchCardDetails(); // Refresh card details to update cashback policies
  };

  const handleDeletePolicy = async (policyId: string) => {
    try {
      const response = await fetch(`/api/cashback-policies/${policyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete policy");
      }

      if (card) {
        setCard({
          ...card,
          cashbackPolicies: card.cashbackPolicies.filter((p) => p.id !== policyId),
        });
      }
    } catch (err) {
      console.error("Error deleting policy:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      // Refresh transactions
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const fetchTransactions = async () => {
    try {
      const url = new URL(`/api/bank-cards/${cardId}/transactions`, window.location.origin);
      if (filterType === "statement" && selectedStatementDate) {
        url.searchParams.append("statementDate", selectedStatementDate.toString());
        url.searchParams.append("filterType", filterType);
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const data: TransactionsResponse = await response.json();
      setTransactions(data.transactions);
      setTotalCashback(data.totalCashback);
      setFilteredTransactions(data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleWeekChange = (direction: "prev" | "next") => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(selectedWeek.getDate() + (direction === "prev" ? -7 : 7));
    setSelectedWeek(newDate);
  };

  const handleUpdateCardColor = async (newColor: string) => {
    try {
      const response = await fetch(`/api/bank-cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardColor: newColor,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update card color');
      }

      const updatedCard = await response.json();
      setCard(prev => prev ? { ...prev, cardColor: updatedCard.cardColor } : null);
      setIsEditColorDialogOpen(false);
    } catch (error) {
      console.error('Error updating card color:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Error Loading Card Details</h2>
            <p className="text-red-600">{error}</p>
            <Link
              href="/"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700"
            >
              ← Back to Cards
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Card Not Found</h2>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back to Cards
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Card Details</h1>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            ← Back to Cards
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Card Name</h3>
                <p className="mt-1 text-lg text-gray-900">{card.cardName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Bank Name</h3>
                <p className="mt-1 text-lg text-gray-900">{card.bankName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Card Type</h3>
                <p className="mt-1 text-lg text-gray-900">{card.cardType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Card Number</h3>
                <p className="mt-1 text-lg text-gray-900">•••• •••• •••• {card.cardNumberLast4}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Card Color</h3>
                <div className="mt-1 flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: card.cardColor ?? '#3B82F6' }}
                  />
                  <button
                    onClick={() => setIsEditColorDialogOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Change Color
                  </button>
                </div>
              </div>
              {card.statementClosingDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Statement Closing Date</h3>
                  <p className="mt-1 text-lg text-gray-900">Day {card.statementClosingDate} of each month</p>
                </div>
              )}
              {card.paymentDueDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment Due Date</h3>
                  <p className="mt-1 text-lg text-gray-900">Day {card.paymentDueDate} of each month</p>
                </div>
              )}
            </div>
            {card.creditLimit && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Credit Limit</h3>
                <p className="mt-1 text-lg text-gray-900">
                  {card.creditLimit.toLocaleString()}VNĐ
                </p>
                <div className="mt-4">
                  <CreditLimitBar
                    creditLimit={card.creditLimit}
                    currentSpending={card.currentSpending ?? 0}
                    currentRepayment={card.currentRepayment ?? 0}
                  />
                </div>
              </div>
            )}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Cashback Policies</h2>
                <button
                  onClick={() => setIsAddPolicyDialogOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add Policy
                </button>
              </div>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <div className="space-y-4">
                {card.cashbackPolicies.filter(policy => policy.category).map((policy) => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {policy.category?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {policy.cashbackPercentage}% cashback
                        {policy.maxCashback && ` (max ${formatNumberWithDots(policy.maxCashback)} VNĐ)`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="p-2 text-red-600 hover:text-red-700 focus:outline-none"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Cashback</p>
              <p className="text-lg font-semibold text-green-600">
                {formatNumberWithDots(totalCashback)} VNĐ
              </p>
            </div>
            <button
              onClick={() => setIsAddTransactionDialogOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Transaction
            </button>
          </div>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="filterWeek"
                name="filterType"
                checked={filterType === "week"}
                onChange={() => setFilterType("week")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="filterWeek" className="text-sm font-medium text-gray-700">
                This Week
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="filterStatement"
                name="filterType"
                checked={filterType === "statement"}
                onChange={() => setFilterType("statement")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="filterStatement" className="text-sm font-medium text-gray-700">
                Statement Period
              </label>
            </div>
          </div>

          {filterType === "week" ? (
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => handleWeekChange("prev")}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-lg font-medium text-gray-900">
                {format(selectedWeek, "dd/MM/yyyy")}
              </span>
              <button
                onClick={() => handleWeekChange("next")}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Current statement period: {format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - (new Date().getDate() < selectedStatementDate! ? 1 : 0), selectedStatementDate!), "dd/MM/yyyy")} - {format(new Date(), "dd/MM/yyyy")}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Next statement closing date: {format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + (new Date().getDate() >= selectedStatementDate! ? 1 : 0), selectedStatementDate!), "dd/MM/yyyy")}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No transactions found for the selected period</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {transaction.merchantName}
                    </h3>
                    <p className={`text-sm font-medium ${transaction.isExpense ? "text-red-600" : "text-green-600"}`}>
                      {formatNumberWithDots(Math.abs(transaction.amount))} VNĐ
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {format(new Date(transaction.transactionDate), "dd/MM/yyyy")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.category?.name ?? "Unknown Category"}
                    </p>
                  </div>
                  {transaction.cashbackEarned > 0 && (
                    <div className="mt-1">
                      <p className="text-sm text-green-600">
                        Cashback: {formatNumberWithDots(transaction.cashbackEarned)} VNĐ
                      </p>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setIsEditDialogOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="p-2 text-red-400 hover:text-red-500"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Categories Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Category
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="divide-y divide-gray-100">
              {categories.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No categories found. Click &quot;Add Category&quot; to create one.
                </div>
              ) : (
                categories.map((category) => {
                  const policy = card?.cashbackPolicies.find(
                    (p) => p.categoryId === category.id
                  );
                  return (
                    <div
                      key={category.id}
                      className="p-6 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {category.description}
                          </p>
                        )}
                        {policy && (
                          <p className="mt-1 text-sm text-blue-600">
                            Cashback: {policy.cashbackPercentage}%
                            {policy.maxCashback && (
                              <span className="text-gray-500">
                                {" "}
                                (Max: {formatNumberWithDots(policy.maxCashback)} VNĐ)
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={isDeleting}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <AddTransactionDialog
        isOpen={isAddTransactionDialogOpen}
        onClose={() => setIsAddTransactionDialogOpen(false)}
        cardId={card?.id || ""}
        onSuccess={handleTransactionAdded}
      />

      <CategoryDialog
        isOpen={isAddCategoryDialogOpen}
        onClose={() => setIsAddCategoryDialogOpen(false)}
        category={selectedCategory}
        onSuccess={handleCategoryDialogSuccess}
        cardId={cardId}
      />

      <CashbackPolicyDialog
        isOpen={isAddPolicyDialogOpen}
        onClose={() => setIsAddPolicyDialogOpen(false)}
        cardId={cardId}
        onSuccess={() => {
          setIsAddPolicyDialogOpen(false);
          fetchCardDetails();
        }}
      />

      <EditTransactionDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onSuccess={fetchTransactions}
        cardId={cardId}
      />

      <EditCardColorDialog
        isOpen={isEditColorDialogOpen}
        onClose={() => setIsEditColorDialogOpen(false)}
        cardColor={card.cardColor ?? "#3B82F6"}
        handleUpdateCardColor={handleUpdateCardColor}
      />
    </div>
  );
} 