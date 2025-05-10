import React, { useState, useEffect } from "react";
import { formatNumberWithDots, parseNumberFromFormatted } from "~/lib/utils";
import DialogComponent, { DialogButton, DialogFooter } from "../Dialog";

interface Category {
  id: string;
  name: string;
}

interface CashbackPolicy {
  id: string;
  categoryId: string;
  cashbackPercentage: number;
  maxCashback: number | null;
  category: {
    name: string;
  };
}

interface AddTransactionDialogProps {
  onClose: () => void;
  cardId: string;
  onSuccess: () => void;
}

const AddTransactionDialog: React.FC<AddTransactionDialogProps> = ({
  onClose,
  cardId,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cashbackPolicies, setCashbackPolicies] = useState<CashbackPolicy[]>([]);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "VNĐ",
    transactionDate: new Date().toISOString().split("T")[0],
    merchantName: "",
    categoryId: "",
    type: "expense",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories for the specific card
        const categoriesResponse = await fetch(`/api/categories?cardId=${cardId}`);
        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Fetch cashback policies
        const policiesResponse = await fetch("/api/cashback-policies");
        if (!policiesResponse.ok) {
          throw new Error("Failed to fetch cashback policies");
        }
        const policiesData = await policiesResponse.json();
        setCashbackPolicies(policiesData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [cardId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const amount = parseNumberFromFormatted(formData.amount);
      const finalAmount = formData.type === "expense" ? -Math.abs(amount) : Math.abs(amount);

      const response = await fetch(`/api/bank-cards/${cardId}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: finalAmount,
          cardId
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to create transaction");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating transaction:", error);
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    const formattedValue = formatNumberWithDots(value);
    setFormData(prev => ({
      ...prev,
      amount: formattedValue
    }));
  };

  // Calculate cashback for the selected category
  const calculateCashback = () => {
    if (!formData.categoryId || !formData.amount) return null;

    const policy = cashbackPolicies.find(
      (p) => p.categoryId === formData.categoryId
    );

    if (!policy) return null;

    const amount = parseNumberFromFormatted(formData.amount);
    const cashback = (amount * policy.cashbackPercentage) / 100;
    const finalCashback = policy.maxCashback 
      ? Math.min(cashback, policy.maxCashback)
      : cashback;

    return {
      percentage: policy.cashbackPercentage,
      amount: finalCashback,
    };
  };

  const cashbackInfo = calculateCashback();

  return (
    <DialogComponent
      isOpen={true}
      onClose={onClose}
      title="Add New Transaction"
      description="Enter the details of your transaction below."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
          >
            <option value="expense">Expense (Chi tiêu)</option>
            <option value="refund">Refund (Hoàn trả)</option>
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              name="amount"
              id="amount"
              value={formData.amount}
              onChange={handleAmountChange}
              required
              className="block w-full pl-7 pr-12 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder="0"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{formData.currency}</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 mb-2">
            Merchant Name
          </label>
          <input
            type="text"
            id="merchantName"
            name="merchantName"
            value={formData.merchantName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="e.g. Amazon, Starbucks"
          />
        </div>

        <div>
          <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Date
          </label>
          <input
            type="date"
            id="transactionDate"
            name="transactionDate"
            value={formData.transactionDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {cashbackInfo && (
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-900">
              Cashback Policy: {cashbackInfo.percentage}%
            </p>
            <p className="text-lg font-semibold text-blue-600 mt-1">
              Estimated Cashback: {formatNumberWithDots(cashbackInfo.amount)} {formData.currency}
            </p>
          </div>
        )}

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
            {isSubmitting ? "Adding..." : "Add Transaction"}
          </DialogButton>
        </DialogFooter>
      </form>
    </DialogComponent>
  );
};

export default AddTransactionDialog; 