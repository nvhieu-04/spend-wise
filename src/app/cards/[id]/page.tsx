"use client";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import Link from "next/link";
import { redirect, useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BankCard from "~/app/components/BankCard";
import CreditLimitBar from "~/app/components/CreditLimitBar";
import AddTransactionDialog from "~/app/components/Dialog/AddTransactionDialog";
import CashbackPolicyDialog from "~/app/components/Dialog/CashbackPolicyDialog";
import CategoryDialog from "~/app/components/Dialog/CategoryDialog";
import EditCardColorDialog from "~/app/components/Dialog/EditCardColorDialog";
import { getDictionary, type Locale } from "~/i18n";
import { formatNumberWithDots } from "~/lib/utils";
import EditTransactionDialog from "../../components/Dialog/EditTransactionDialog";

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
  const pathname = usePathname();
  const [, maybeLocale] = pathname.split("/");
  const locale: Locale =
    maybeLocale === "en" || maybeLocale === "vn" ? maybeLocale : "en";
  const dict = getDictionary(locale);
  const backHref = locale === "en" || locale === "vn" ? `/${locale}` : "/";
  const [card, setCard] = useState<CardDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCashback, setTotalCashback] = useState(0);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] =
    useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterType, setFilterType] = useState<"week" | "statement">(
    "statement",
  );
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedStatementDate, setSelectedStatementDate] = useState<
    number | null
  >(null);
  const [isAddPolicyDialogOpen, setIsAddPolicyDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMonth] = useState(new Date());
  const [isEditColorDialogOpen, setIsEditColorDialogOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [merchantSearch, setMerchantSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "refund">(
    "all",
  );
  const [globalSearch, setGlobalSearch] = useState<string>("");

  const fetchCardDetails = async () => {
    try {
      const [cardResponse, transactionsResponse] = await Promise.all([
        fetch(`/api/bank-cards/${cardId}`),
        fetch(`/api/bank-cards/${cardId}/transactions`),
      ]);

      if (!cardResponse.ok) {
        throw new Error(dict.cards.fetchCardError);
      }
      if (!transactionsResponse.ok) {
        throw new Error(dict.cards.fetchTransactionsError);
      }

      const cardData = await cardResponse.json();
      const transactionsData: TransactionsResponse =
        await transactionsResponse.json();

      setCard(cardData);
      setTransactions(transactionsData.transactions);
      setTotalCashback(transactionsData.totalCashback);
      setFilteredTransactions(transactionsData.transactions);
      if (cardData.statementClosingDate) {
        setSelectedStatementDate(cardData.statementClosingDate);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : dict.cards.fetchCardError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCardDetails();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (transactions.length === 0) return;

    let filtered = [...transactions];
    let periodCashback = 0;

    if (filterType === "week") {
      const startOfWeek = new Date(selectedWeek);
      startOfWeek.setDate(selectedWeek.getDate() - selectedWeek.getDay());
      const endOfWeek = new Date(selectedWeek);
      endOfWeek.setDate(selectedWeek.getDate() + (6 - selectedWeek.getDay()));

      filtered = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.transactionDate);
        return transactionDate >= startOfWeek && transactionDate <= endOfWeek;
      });
    } else if (filterType === "statement" && selectedStatementDate) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      let statementStartDate: Date;
      let statementEndDate: Date;

      if (currentDate.getDate() < selectedStatementDate) {
        statementStartDate = new Date(
          currentYear,
          currentMonth - 1,
          selectedStatementDate,
        );
        statementEndDate = currentDate;
      } else {
        statementStartDate = new Date(
          currentYear,
          currentMonth,
          selectedStatementDate,
        );
        statementEndDate = currentDate;
      }

      filtered = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.transactionDate);
        return (
          transactionDate >= statementStartDate &&
          transactionDate <= statementEndDate
        );
      });
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      filtered = filtered.filter(
        (transaction) => new Date(transaction.transactionDate) >= from,
      );
    }

    if (dateTo) {
      const to = new Date(dateTo);
      filtered = filtered.filter(
        (transaction) => new Date(transaction.transactionDate) <= to,
      );
    }

    if (filterCategoryId !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.categoryId === filterCategoryId,
      );
    }

    const min = minAmount ? parseFloat(minAmount) : undefined;
    const max = maxAmount ? parseFloat(maxAmount) : undefined;

    if (min !== undefined || max !== undefined) {
      filtered = filtered.filter((transaction) => {
        const value = Math.abs(transaction.amount);
        if (min !== undefined && value < min) return false;
        if (max !== undefined && value > max) return false;
        return true;
      });
    }

    if (merchantSearch.trim()) {
      const term = merchantSearch.trim().toLowerCase();
      filtered = filtered.filter((transaction) =>
        transaction.merchantName?.toLowerCase().includes(term),
      );
    }

    if (typeFilter === "expense") {
      filtered = filtered.filter((transaction) => transaction.isExpense);
    } else if (typeFilter === "refund") {
      filtered = filtered.filter((transaction) => !transaction.isExpense);
    }

    if (globalSearch.trim()) {
      const term = globalSearch.trim().toLowerCase();
      filtered = filtered.filter((transaction) => {
        const merchant = transaction.merchantName?.toLowerCase() ?? "";
        const categoryName = transaction.category?.name?.toLowerCase() ?? "";
        return merchant.includes(term) || categoryName.includes(term);
      });
    }

    periodCashback = filtered.reduce(
      (sum, transaction) => sum + (transaction.cashbackEarned || 0),
      0,
    );

    setTotalCashback(periodCashback);
    setFilteredTransactions(filtered);
  }, [
    transactions,
    filterType,
    selectedWeek,
    selectedStatementDate,
    dateFrom,
    dateTo,
    filterCategoryId,
    minAmount,
    maxAmount,
    merchantSearch,
    typeFilter,
    globalSearch,
  ]);

  const handleTransactionAdded = () => {
    // Refresh transactions after adding a new one
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/bank-cards/${cardId}/transactions`);
        if (!response.ok) {
          throw new Error(dict.cards.fetchTransactionsError);
        }
        const data: TransactionsResponse = await response.json();
        setTransactions(data.transactions);
        setTotalCashback(data.totalCashback);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : dict.cards.fetchTransactionsError,
        );
      }
    };
    fetchTransactions();
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?cardId=${cardId}`);
      if (!response.ok) {
        throw new Error(dict.cards.fetchCategoriesError);
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(dict.cards.fetchCategoriesError);
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
    if (!confirm(dict.cards.deleteCategoryConfirm)) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? dict.cards.deleteCategoryError);
      }

      setCategories(categories.filter((c) => c.id !== categoryId));
      fetchCardDetails(); // Refresh card details to update cashback policies
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(
        err instanceof Error ? err.message : dict.cards.deleteCategoryError,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCategoryDialogSuccess = () => {
    fetchCategories(); // Refresh categories after adding or editing
    fetchCardDetails(); // Refresh card details to update cashback policies
  };

  const handleDeletePolicy = async (policyId: string) => {
    try {
      const response = await fetch(`/api/cashback-policies/${policyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(dict.cards.deletePolicyError);
      }

      if (card) {
        setCard({
          ...card,
          cashbackPolicies: card.cashbackPolicies.filter(
            (p) => p.id !== policyId,
          ),
        });
      }
    } catch (err) {
      console.error("Error deleting policy:", err);
      setError(
        err instanceof Error ? err.message : dict.cards.deletePolicyError,
      );
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm(dict.cards.deleteTransactionConfirm)) return;

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(dict.cards.deleteTransactionError);
      }

      // Refresh transactions
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setError(
        error instanceof Error
          ? error.message
          : dict.cards.deleteTransactionError,
      );
    }
  };

  const fetchTransactions = async () => {
    try {
      const url = new URL(
        `/api/bank-cards/${cardId}/transactions`,
        window.location.origin,
      );
      if (filterType === "statement" && selectedStatementDate) {
        url.searchParams.append(
          "statementDate",
          selectedStatementDate.toString(),
        );
        url.searchParams.append("filterType", filterType);
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(dict.cards.fetchTransactionsError);
      }
      const data: TransactionsResponse = await response.json();
      setTransactions(data.transactions);
      setTotalCashback(data.totalCashback);
      setFilteredTransactions(data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(
        error instanceof Error
          ? error.message
          : dict.cards.fetchTransactionsError,
      );
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardColor: newColor,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update card color");
      }

      const updatedCard = await response.json();
      setCard((prev) =>
        prev ? { ...prev, cardColor: updatedCard.cardColor } : null,
      );
      setIsEditColorDialogOpen(false);
    } catch (error) {
      console.error("Error updating card color:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="py-8 text-center sm:py-12">
            <h2 className="mb-4 text-2xl font-semibold">
              {dict.cards.errorLoadingTitle}
            </h2>
            <p className="text-red-600">{error}</p>
            <Link
              href={backHref}
              className="mt-4 inline-block text-blue-600 hover:text-blue-700"
            >
              ← {dict.common.backToCards}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="py-8 text-center sm:py-12">
            <h2 className="mb-4 text-2xl font-semibold">
              {dict.cards.notFoundTitle}
            </h2>
            <Link href={backHref} className="text-blue-600 hover:text-blue-700">
              ← {dict.common.backToCards}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="mx-auto w-full max-w-4xl px-0.5">
        {/* Back button positioned at top left */}
        <div className="mb-4">
          <Link
            href={backHref}
            className="inline-flex items-center text-sm text-gray-600 transition-colors hover:text-blue-600"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {dict.common.backToCards}
          </Link>
        </div>

        {/* Page header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {dict.cards.headerTitle}
              </h1>
              {card.statementClosingDate && card.paymentDueDate && (
                <p className="mt-1 text-sm text-gray-600">
                  {dict.cards.statementInfoPrefix} {card.statementClosingDate},{" "}
                  {dict.cards.statementInfoSuffix} {card.paymentDueDate}{" "}
                  {dict.cards.statementInfoTail}
                </p>
              )}
            </div>
            {card.paymentDueDate && (
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                {(() => {
                  const today = new Date();
                  const currentDay = today.getDate();
                  const currentMonth = today.getMonth();
                  const currentYear = today.getFullYear();
                  let nextPaymentDate = new Date(
                    currentYear,
                    currentMonth,
                    card.paymentDueDate!,
                  );
                  if (currentDay >= card.paymentDueDate!) {
                    nextPaymentDate = new Date(
                      currentYear,
                      currentMonth + 1,
                      card.paymentDueDate!,
                    );
                  }
                  const daysUntilPayment = Math.ceil(
                    (nextPaymentDate.getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24),
                  );
                  if (daysUntilPayment <= 0) {
                    return (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                        {dict.cards.paymentDueNow}
                      </span>
                    );
                  }
                  if (daysUntilPayment <= 5) {
                    return (
                      <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                        {dict.cards.paymentDueInDays.replace(
                          "{days}",
                          String(daysUntilPayment),
                        )}
                      </span>
                    );
                  }
                  return (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      {dict.cards.nextPaymentInDays.replace(
                        "{days}",
                        String(daysUntilPayment),
                      )}
                    </span>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
        <div className="mb-4 flex justify-center sm:mb-6">
          <div className="w-full max-w-sm">
            <BankCard
              key={card.id}
              id={card.id}
              cardName={card.cardName}
              bankName={card.bankName}
              cardType={card.cardType}
              cardNumberLast4={card.cardNumberLast4}
              creditLimit={card.creditLimit}
              cardColor={card.cardColor}
              onDelete={() => {
                if (card.id) {
                  redirect("/");
                }
              }}
            />
          </div>
        </div>
        <div className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm sm:mb-6">
          <div className="space-y-3 p-3 sm:space-y-5 sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              {card.statementClosingDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {dict.cards.statementClosingTitle}
                  </h3>
                  <p className="mt-1 text-base text-gray-900 sm:text-lg">
                    {dict.cards.statementClosingValuePrefix}{" "}
                    {card.statementClosingDate} {dict.cards.statementInfoTail}
                  </p>
                </div>
              )}
              {card.paymentDueDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {dict.cards.paymentDueTitle}
                  </h3>
                  <p className="mt-1 text-base text-gray-900 sm:text-lg">
                    {dict.cards.paymentDueValuePrefix} {card.paymentDueDate}{" "}
                    {dict.cards.statementInfoTail}
                  </p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  {dict.cards.cardColorTitle}
                </h3>
                <div className="mt-1 flex items-center space-x-2">
                  <div
                    className="h-6 w-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: card.cardColor ?? "#3B82F6" }}
                  />
                  <button
                    onClick={() => setIsEditColorDialogOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {dict.cards.changeColor}
                  </button>
                </div>
              </div>
              {card.creditLimit && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {dict.cards.creditLimitTitle}
                  </h3>
                  <p className="mt-1 text-base text-gray-900 sm:text-lg">
                    {card.creditLimit.toLocaleString()}VNĐ
                  </p>
                </div>
              )}
            </div>
            {card.creditLimit && (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                  {(() => {
                    const remaining =
                      (card.currentSpending ?? 0) -
                      (card.currentRepayment ?? 0);
                    const remainingDue = Math.max(remaining, 0);
                    const usage =
                      card.creditLimit > 0
                        ? (remainingDue / card.creditLimit) * 100
                        : 0;
                    let badgeClass =
                      "bg-emerald-50 text-emerald-700 border-emerald-100";
                    let label = dict.cards.usageUnderControl;
                    if (usage >= 80) {
                      badgeClass = "bg-red-50 text-red-700 border-red-100";
                      label = dict.cards.usageHigh;
                    } else if (usage >= 50) {
                      badgeClass =
                        "bg-orange-50 text-orange-700 border-orange-100";
                      label = dict.cards.usageMedium;
                    }
                    return (
                      <>
                        <span className="text-gray-600">
                          {dict.cards.remainingToRepayLabel}{" "}
                          <span className="font-semibold text-gray-900">
                            {formatNumberWithDots(Math.round(remainingDue))} VNĐ
                          </span>
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass}`}
                        >
                          {label} • {usage.toFixed(0)}
                          {dict.cards.usageSuffix}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <CreditLimitBar
                  creditLimit={card.creditLimit}
                  currentSpending={card.currentSpending ?? 0}
                  currentRepayment={card.currentRepayment ?? 0}
                />
              </div>
            )}
            <div className="mt-4 sm:mt-6">
              <div className="mb-4 flex flex-col sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:mb-0 sm:text-xl">
                  {dict.cards.categoriesTitle}
                </h2>
                <button
                  onClick={handleAddCategory}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                >
                  <PlusIcon className="mr-2 h-5 w-5" />
                  {dict.cards.addCategoryButton}
                </button>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="divide-y divide-gray-100">
                  {categories.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 sm:p-6">
                      {dict.cards.noCategoriesMessage}
                    </div>
                  ) : (
                    categories.map((category) => {
                      return (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-4 sm:p-6"
                        >
                          <div className="flex-1 pr-4">
                            <h3 className="text-base font-medium text-gray-900 sm:text-lg">
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                {category.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-4">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="p-2 text-gray-400 hover:text-gray-500"
                            >
                              <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={isDeleting}
                              className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                            >
                              <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            {categories.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <div className="mb-3 flex flex-col sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:mb-0">
                    {dict.cards.cashbackPoliciesTitle}
                  </h2>
                  <button
                    onClick={() => setIsAddPolicyDialogOpen(true)}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                  >
                    <PlusIcon className="mr-2 h-5 w-5" />
                    {dict.cards.addPolicyButton}
                  </button>
                </div>
                {error && (
                  <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 sm:mb-4 sm:p-3">
                    <p className="text-xs text-red-600 sm:text-sm">{error}</p>
                  </div>
                )}
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                  {card.cashbackPolicies.length === 0 ? (
                    <div className="p-3 text-center text-gray-500 sm:p-4">
                      {dict.cards.noPoliciesMessage}
                    </div>
                  ) : (
                    card.cashbackPolicies
                      .filter((policy) => policy.category)
                      .map((policy) => (
                        <div
                          key={policy.id}
                          className="flex items-center justify-between border-b border-gray-100 p-4 last:border-b-0 sm:p-6"
                        >
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {policy.category?.name}
                            </h3>
                            <p className="mt-1 text-xs text-blue-600 sm:text-sm">
                              {dict.cards.cashbackLabel}{" "}
                              {policy.cashbackPercentage}%
                              <span className="text-gray-500">
                                {policy.maxCashback &&
                                  ` (${dict.cards.cashbackMaxPrefix} ${formatNumberWithDots(policy.maxCashback)} VNĐ)`}
                              </span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeletePolicy(policy.id)}
                            className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-3 flex flex-col sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="mb-2 text-xl font-semibold text-gray-900 sm:mb-0">
            {dict.cards.transactionsTitle}
          </h2>
          <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-500 sm:text-sm">
                {dict.cards.cashbackPeriodLabel}
              </p>
              <p className="text-base font-semibold text-green-600 sm:text-lg">
                {formatNumberWithDots(totalCashback)} VNĐ
              </p>
            </div>
            <button
              onClick={() => setIsAddTransactionDialogOpen(true)}
              className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:w-auto"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              {dict.cards.addTransactionButton}
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-gray-100 bg-white p-3 shadow-sm sm:mb-5 sm:p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">
                {dict.cards.filterPeriodTitle}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFilterType("week")}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    filterType === "week"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {dict.cards.filterPeriodWeek}
                </button>
                <button
                  onClick={() => setFilterType("statement")}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    filterType === "statement"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {dict.cards.filterPeriodStatement}
                </button>
              </div>
              {filterType === "week" ? (
                <div className="mt-1 flex items-center justify-between rounded-lg bg-gray-50 px-2 py-1.5">
                  <button
                    onClick={() => handleWeekChange("prev")}
                    className="rounded-lg p-1 hover:bg-gray-100"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <span className="text-xs font-medium text-gray-900">
                    {format(selectedWeek, "dd/MM/yyyy")}
                  </span>
                  <button
                    onClick={() => handleWeekChange("next")}
                    className="rounded-lg p-1 hover:bg-gray-100"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                selectedStatementDate && (
                  <div className="mt-1 rounded-lg bg-gray-50 px-2 py-1.5 text-xs text-gray-600">
                    <p>
                      {dict.cards.currentStatementPrefix}{" "}
                      {format(
                        new Date(
                          selectedMonth.getFullYear(),
                          selectedMonth.getMonth() -
                            (new Date().getDate() < selectedStatementDate
                              ? 1
                              : 0),
                          selectedStatementDate,
                        ),
                        "dd/MM/yyyy",
                      )}{" "}
                      {dict.cards.currentStatementTo}{" "}
                      {format(new Date(), "dd/MM/yyyy")}
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">
                {dict.cards.dateRangeTitle}
              </p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">
                {dict.cards.transactionTypeTitle}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    typeFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {dict.cards.transactionTypeAll}
                </button>
                <button
                  onClick={() => setTypeFilter("expense")}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    typeFilter === "expense"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {dict.cards.transactionTypeExpense}
                </button>
                <button
                  onClick={() => setTypeFilter("refund")}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    typeFilter === "refund"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {dict.cards.transactionTypeRefund}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">
                {dict.cards.categoryFilterTitle}
              </p>
              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">{dict.cards.categoryFilterAll}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">
                {dict.cards.amountRangeTitle}
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={dict.cards.amountMinPlaceholder}
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={dict.cards.amountMaxPlaceholder}
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">
                {dict.cards.merchantFilterTitle}
              </p>
              <input
                type="text"
                placeholder={dict.cards.merchantFilterPlaceholder}
                value={merchantSearch}
                onChange={(e) => setMerchantSearch(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder={dict.cards.globalSearchPlaceholder}
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setFilterCategoryId("all");
                setMinAmount("");
                setMaxAmount("");
                setMerchantSearch("");
                setTypeFilter("all");
                setGlobalSearch("");
              }}
              className="mt-2 inline-flex items-center justify-center rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:text-sm"
            >
              {dict.cards.clearFiltersButton}
            </button>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="rounded-lg bg-gray-50 py-8 text-center sm:py-12">
              <p className="text-gray-500">
                {dict.cards.noTransactionsMessage}
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col justify-between rounded-lg border border-gray-100 bg-white p-3 sm:flex-row sm:items-center sm:p-4"
              >
                <div className="mb-2 flex-1 sm:mb-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {transaction.merchantName}
                    </h3>
                    <p
                      className={`text-sm font-medium ${transaction.isExpense ? "text-red-600" : "text-green-600"}`}
                    >
                      {formatNumberWithDots(Math.abs(transaction.amount))} VNĐ
                    </p>
                  </div>
                  <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-gray-500 sm:text-sm">
                      {format(
                        new Date(transaction.transactionDate),
                        "dd/MM/yyyy",
                      )}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 sm:mt-0 sm:text-sm">
                      {transaction.category?.name ?? dict.cards.unknownCategory}
                    </p>
                  </div>
                  {transaction.cashbackEarned > 0 && (
                    <div className="mt-1">
                      <p className="text-xs text-green-600 sm:text-sm">
                        {dict.cards.cashbackLabel}{" "}
                        {formatNumberWithDots(transaction.cashbackEarned)} VNĐ
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end sm:ml-4 sm:flex-shrink-0">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setIsEditDialogOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-500"
                    >
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5"
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
                        className="h-4 w-4 sm:h-5 sm:w-5"
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
              </div>
            ))
          )}
        </div>
      </div>

      {isAddTransactionDialogOpen && (
        <AddTransactionDialog
          onClose={() => setIsAddTransactionDialogOpen(false)}
          cardId={card?.id}
          onSuccess={handleTransactionAdded}
        />
      )}

      {isAddCategoryDialogOpen && (
        <CategoryDialog
          onClose={() => setIsAddCategoryDialogOpen(false)}
          category={selectedCategory}
          onSuccess={handleCategoryDialogSuccess}
          cardId={cardId}
        />
      )}

      {isAddPolicyDialogOpen && (
        <CashbackPolicyDialog
          onClose={() => setIsAddPolicyDialogOpen(false)}
          cardId={cardId}
          onSuccess={() => {
            setIsAddPolicyDialogOpen(false);
            fetchCardDetails();
          }}
        />
      )}

      {isEditDialogOpen && (
        <EditTransactionDialog
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
          onSuccess={fetchTransactions}
          cardId={cardId}
        />
      )}

      {isEditColorDialogOpen && (
        <EditCardColorDialog
          onClose={() => setIsEditColorDialogOpen(false)}
          cardColor={card.cardColor ?? "#3B82F6"}
          handleUpdateCardColor={handleUpdateCardColor}
        />
      )}
    </div>
  );
}
