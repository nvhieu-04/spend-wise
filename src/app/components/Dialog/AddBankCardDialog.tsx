import React, { useState } from "react";
import Dialog, { DialogButton, DialogFooter } from "../Dialog";
import { formatNumberWithDots, parseNumberFromFormatted } from "../../../lib/utils";

interface CardFormData {
  cardName: string;
  bankName: string;
  cardType: string;
  cardNumber: string;
  creditLimit?: string;
  statementClosingDate?: number;
  paymentDueDate?: number;
  cardColor?: string;
}

interface AddBankCardDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBankCardDialog({ onClose, onSuccess }: AddBankCardDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CardFormData>({
    cardName: "",
    bankName: "",
    cardType: "VISA",
    cardNumber: "",
    creditLimit: "",
    statementClosingDate: undefined,
    paymentDueDate: undefined,
    cardColor: "#3B82F6",
  });
  const [showCustomCardType, setShowCustomCardType] = useState(false);

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
          creditLimit: formData.creditLimit ? parseNumberFromFormatted(formData.creditLimit) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create card");
      }

      onSuccess();
      onClose();
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
      [name]: value,
    }));
  };

  const handleCreditLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    const formattedValue = formatNumberWithDots(value);
    setFormData(prev => ({
      ...prev,
      creditLimit: formattedValue
    }));
  };

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      title="Add New Bank Card"
      description="Fill in the details to add a new bank card to your account."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
            Card Name
          </label>
          <input
            type="text"
            id="cardName"
            name="cardName"
            value={formData.cardName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="e.g. My Travel Card"
          />
        </div>

        <div>
          <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name
          </label>
          <input
            type="text"
            id="bankName"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="e.g. Chase Bank"
          />
        </div>

        <div>
          <label htmlFor="cardType" className="block text-sm font-medium text-gray-700 mb-1">
            Card Type
          </label>
          <div className="space-y-2">
            <select
              id="cardType"
              name="cardType"
              value={showCustomCardType ? "CUSTOM" : formData.cardType}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "CUSTOM") {
                  setShowCustomCardType(true);
                  setFormData(prev => ({ ...prev, cardType: "" }));
                } else {
                  setShowCustomCardType(false);
                  setFormData(prev => ({ ...prev, cardType: value }));
                }
              }}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
            >
              <option value="VISA">VISA</option>
              <option value="MASTERCARD">Mastercard</option>
              <option value="AMEX">American Express</option>
              <option value="CUSTOM">Other (Custom)</option>
            </select>
            {showCustomCardType && (
              <input
                type="text"
                name="cardType"
                value={formData.cardType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="Enter custom card type"
              />
            )}
          </div>
        </div>

        <div>
          <label htmlFor="cardColor" className="block text-sm font-medium text-gray-700 mb-1">
            Card Color
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="color"
              id="cardColor"
              name="cardColor"
              value={formData.cardColor}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  cardColor: e.target.value
                }));
              }}
              className="h-10 w-20 rounded-lg border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={formData.cardColor}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  cardColor: e.target.value
                }));
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder="#RRGGBB"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Card Number (Last 4 digits)
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
              setFormData(prev => ({ ...prev, cardNumber: value }));
            }}
            required
            pattern="[0-9]{4}"
            maxLength={4}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="Enter last 4 digits"
          />
        </div>

        <div>
          <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700 mb-1">
            Credit Limit (Optional)
          </label>
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              id="creditLimit"
              name="creditLimit"
              value={formData.creditLimit}
              onChange={handleCreditLimitChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder="Enter credit limit amount"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">VNĐ</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="statementClosingDate" className="block text-sm font-medium text-gray-700 mb-1">
            Statement Closing Date (Optional)
          </label>
          <input
            type="number"
            id="statementClosingDate"
            name="statementClosingDate"
            value={formData.statementClosingDate ?? ""}
            onChange={handleChange}
            min="1"
            max="31"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="Day of month (1-31)"
          />
        </div>

        <div>
          <label htmlFor="paymentDueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Due Date (Optional)
          </label>
          <input
            type="number"
            id="paymentDueDate"
            name="paymentDueDate"
            value={formData.paymentDueDate ?? ""}
            onChange={handleChange}
            min="1"
            max="31"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="Day of month (1-31)"
          />
        </div>

        <DialogFooter>
          <DialogButton
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </DialogButton>
          <DialogButton
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Card"}
          </DialogButton>
        </DialogFooter>
      </form>
    </Dialog>
  );
} 