"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import BankCard from "./components/BankCard";
import AddBankCardDialog from "./components/Dialog/AddBankCardDialog";
import { useSession } from "next-auth/react";
import PaymentNotification from './components/PaymentNotification';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
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
      <div className="min-h-screen bg-white text-gray-900 p-8">
        <Skeleton count={8} />
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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <PaymentNotification />
      <div className="bg-white text-gray-900 p-3 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8 text-center sm:text-left">My Bank Cards</h1>
          {isLoading ? <Skeleton count={3}/> :
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                className="border-2 border-dashed border-blue-200 rounded-xl relative transition-all duration-300 ease-in-out hover:border-blue-300 group min-h-[150px] hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 cursor-pointer flex flex-col items-center justify-center bg-white/50 p-3 sm:p-4"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100/50 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-blue-100 transition-colors">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-0.5 sm:mb-1 text-center">Add New Card</h3>
                <p className="text-xs sm:text-sm text-gray-500 text-center px-1 sm:px-2 line-clamp-2">Click to add another bank card</p>
              </div>
            </div>
          }
        </div>
      </div>
      {isAddCardDialogOpen && <AddBankCardDialog
        onClose={() => setIsAddCardDialogOpen(false)}
        onSuccess={fetchCards}
      />}
    </div>
  );
}
