"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TransactionItem from "../../components/TransactionItem";
import CreditLimitBar from "~/components/CreditLimitBar";

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
  cashbackPolicies: {
    id: string;
    category: string;
    percentage: number;
  }[];
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  transactionDate: string;
  merchantName?: string;
  category?: {
    name: string;
  };
  cashbackEarned?: number;
  isExpense: boolean;
}

export default function CardDetailPage() {
  const params = useParams();
  const [card, setCard] = useState<CardDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cardResponse, transactionsResponse] = await Promise.all([
          fetch(`/api/bank-cards/${params.id}`),
          fetch(`/api/bank-cards/${params.id}/transactions`),
        ]);

        if (!cardResponse.ok) {
          throw new Error("Failed to fetch card details");
        }
        if (!transactionsResponse.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const cardData = await cardResponse.json();
        const transactionsData = await transactionsResponse.json();

        setCard(cardData);
        setTransactions(transactionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

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
                      currentSpending={card.currentSpending || 0}
                      currentRepayment={card.currentRepayment || 0}
                    />
                  </div>
                </div>
              )}
            {card.cashbackPolicies && card.cashbackPolicies.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cashback Policies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {card.cashbackPolicies.map((policy) => (
                    <div
                      key={policy.id}
                      className="bg-blue-50 rounded-lg p-4"
                    >
                      <h3 className="text-sm font-medium text-gray-900">{policy.category}</h3>
                      <p className="mt-1 text-2xl font-semibold text-blue-600">
                        {policy.percentage}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
          <Link
            href={`/cards/${card.id}/transactions/new`}
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
          </Link>
        </div>

        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                {...transaction}
                isExpense={transaction.isExpense}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
} 