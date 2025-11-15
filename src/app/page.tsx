"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import BankCard from "./components/BankCard";
import AddBankCardDialog from "./components/Dialog/AddBankCardDialog";
import { useSession } from "next-auth/react";
import PaymentNotification from "./components/PaymentNotification";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
interface BankCard {
  id: string;
  cardName: string;
  bankName: string;
  cardType: string;
  cardNumberLast4: string;
  creditLimit?: number;
  cardColor?: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [cards, setCards] = useState<BankCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/bank-cards");
      if (!response.ok) {
        throw new Error("Failed to fetch cards");
      }
      const data = await response.json();
      setCards(data.cards);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      setError(null);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchCards();
    } else {
      setCards([]);
    }
  }, [status]);

  const handleDeleteCard = (cardId: string) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white p-8 text-gray-900">
        <Skeleton count={8} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="block text-gray-900">Manage Your</span>
              <span className="block text-blue-600">Bank Cards</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
              Track your credit cards, monitor spending, and maximize your
              rewards in one place.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:mt-10 sm:flex-row">
              <Link
                href="api/auth/signin"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
              >
                Sign In
              </Link>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-2 sm:gap-8 lg:mt-20 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Track Spending
              </h3>
              <p className="text-gray-600">
                Monitor your expenses and stay within your budget.
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Maximize Rewards
              </h3>
              <p className="text-gray-600">
                Get the most out of your credit card rewards and cashback.
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Stay Organized
              </h3>
              <p className="text-gray-600">
                Keep all your bank cards in one secure place.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8 text-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="py-12 text-center">
            <h2 className="mb-4 text-2xl font-semibold">Error Loading Cards</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
      <PaymentNotification />
      <div className="bg-white p-3 text-gray-900 sm:p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-4 text-center text-2xl font-bold text-gray-900 sm:mb-8 sm:text-left sm:text-3xl">
            My Bank Cards
          </h1>
          {isLoading ? (
            <Skeleton count={3} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {cards.map((card) => (
                <BankCard
                  key={card.id}
                  id={card.id}
                  cardName={card.cardName}
                  bankName={card.bankName}
                  cardType={card.cardType}
                  cardNumberLast4={card.cardNumberLast4}
                  creditLimit={card.creditLimit}
                  cardColor={card.cardColor}
                  onDelete={handleDeleteCard}
                />
              ))}
              <div
                onClick={() => setIsAddCardDialogOpen(true)}
                className="group relative flex aspect-[1.6/1] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-white/50 p-3 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-105 hover:border-blue-300 hover:shadow-xl sm:p-4"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100/50 transition-colors group-hover:bg-blue-100 sm:mb-3 sm:h-12 sm:w-12">
                  <svg
                    className="h-5 w-5 text-blue-400 transition-colors group-hover:text-blue-500 sm:h-6 sm:w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h3 className="mb-0.5 text-center text-sm font-medium text-gray-900 sm:mb-1 sm:text-base md:text-lg">
                  Add New Card
                </h3>
                <p className="line-clamp-2 px-1 text-center text-xs text-gray-500 sm:px-2 sm:text-sm">
                  Click to add another bank card
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {isAddCardDialogOpen && (
        <AddBankCardDialog
          onClose={() => setIsAddCardDialogOpen(false)}
          onSuccess={fetchCards}
        />
      )}
    </div>
  );
}
