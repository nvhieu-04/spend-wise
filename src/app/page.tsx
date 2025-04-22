"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import BankCard from "./components/BankCard";
import AddBankCardDialog from "./components/AddBankCardDialog";
import { useSession } from "next-auth/react";
import PaymentNotification from './components/PaymentNotification';

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
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchCards();
    } else {
      setIsLoading(false);
    }
  }, [status]);

  const handleDeleteCard = (cardId: string) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white text-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <span className="block text-gray-900">Manage Your</span>
              <span className="block text-blue-600">Bank Cards</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Track your credit cards, monitor spending, and maximize your rewards in one place.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="api/auth/signin"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
          <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Track Spending</h3>
              <p className="text-gray-600">Monitor your expenses and stay within your budget.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Maximize Rewards</h3>
              <p className="text-gray-600">Get the most out of your credit card rewards and cashback.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Stay Organized</h3>
              <p className="text-gray-600">Keep all your bank cards in one secure place.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Error Loading Cards</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PaymentNotification />
      <div className="min-h-screen bg-white text-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bank Cards</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <button
              onClick={() => setIsAddCardDialogOpen(true)}
              className="border-2 border-dashed border-blue-200 rounded-xl relative transition-all duration-300 ease-in-out hover:border-blue-300 group aspect-[1.7/1] flex flex-col items-center justify-center bg-white/50"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100/50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <svg className="w-6 h-6 text-blue-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Add New Card</h3>
              <p className="text-gray-500">Click to add another bank card</p>
            </button>
          </div>
        </div>
      </div>

      <AddBankCardDialog
        isOpen={isAddCardDialogOpen}
        onClose={() => setIsAddCardDialogOpen(false)}
        onSuccess={fetchCards}
      />
    </div>
  );
}
