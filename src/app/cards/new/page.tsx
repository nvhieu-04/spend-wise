"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CardFormData {
  cardName: string;
  bankName: string;
  cardType: string;
  cardNumber: string;
  creditLimit?: number;
  statementClosingDate?: number;
  paymentDueDate?: number;
}

export default function NewCardPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CardFormData>({
    cardName: "",
    bankName: "",
    cardType: "VISA",
    cardNumber: "",
    creditLimit: undefined,
    statementClosingDate: undefined,
    paymentDueDate: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bank-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          cardNumberLast4: formData.cardNumber.slice(-4),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create card");
      }

      router.push("/");
    } catch (error) {
      console.error("Error creating card:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "creditLimit" ? parseFloat(value) || undefined : value,
    }));
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Add New Bank Card</h1>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            ← Back to Cards
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
                Card Name
              </label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="e.g. My Travel Card"
              />
            </div>

            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="e.g. Chase Bank"
              />
            </div>

            <div>
              <label htmlFor="cardType" className="block text-sm font-medium text-gray-700 mb-2">
                Card Type
              </label>
              <select
                id="cardType"
                name="cardType"
                value={formData.cardType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
              >
                <option value="VISA">VISA</option>
                <option value="MASTERCARD">Mastercard</option>
                <option value="AMEX">American Express</option>
              </select>
            </div>

            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                required
                pattern="[0-9]{16}"
                maxLength={16}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="Enter 16-digit card number"
              />
              <p className="mt-1 text-xs text-gray-500">
                Only the last 4 digits will be stored for security purposes
              </p>
            </div>

            <div>
              <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700 mb-2">
                Credit Limit (Optional)
              </label>
              <input
                type="number"
                id="creditLimit"
                name="creditLimit"
                value={formData.creditLimit || ""}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="Enter credit limit amount"
              />
            </div>

            <div>
              <label htmlFor="statementClosingDate" className="block text-sm font-medium text-gray-700 mb-2">
                Statement Closing Date (Optional)
              </label>
              <input
                type="number"
                id="statementClosingDate"
                name="statementClosingDate"
                value={formData.statementClosingDate || ""}
                onChange={handleChange}
                min="1"
                max="31"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="Enter day of month (1-31)"
              />
            </div>

            <div>
              <label htmlFor="paymentDueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Due Date (Optional)
              </label>
              <input
                type="number"
                id="paymentDueDate"
                name="paymentDueDate"
                value={formData.paymentDueDate || ""}
                onChange={handleChange}
                min="1"
                max="31"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="Enter day of month (1-31)"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Adding..." : "Add Card"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 