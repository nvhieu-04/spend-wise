import React, { useState, useEffect } from "react";
import Dialog, { DialogButton, DialogFooter } from "../Dialog";
import {
  formatNumberWithDots,
  parseNumberFromFormatted,
} from "../../../lib/utils";

interface Category {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  transactionDate: string;
  merchantName: string;
  categoryId: string | null | undefined;
  isExpense: boolean;
  cashbackEarned: number;
}

interface EditTransactionDialogProps {
  onClose: () => void;
  transaction: Transaction | null;
  onSuccess: () => void;
  cardId: string;
}

interface FormData {
  amount: string;
  transactionDate: string;
  merchantName: string;
  categoryId: string;
  type: "expense" | "refund";
}

const EditTransactionDialog: React.FC<EditTransactionDialogProps> = ({
  onClose,
  transaction,
  onSuccess,
  cardId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    amount: "",
    transactionDate: "",
    merchantName: "",
    categoryId: "",
    type: "expense",
  });

  useEffect(() => {
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
      }
    };

    fetchCategories();
  }, [cardId]);

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: Math.abs(transaction.amount).toString(),
        transactionDate: transaction.transactionDate.split("T")[0] ?? "",
        merchantName: transaction.merchantName,
        categoryId: String(transaction.categoryId ?? ""),
        type: transaction.isExpense ? "expense" : "refund",
      });
    } else {
      setFormData({
        amount: "",
        transactionDate: "",
        merchantName: "",
        categoryId: "",
        type: "expense",
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const amount = parseNumberFromFormatted(formData.amount);
      const finalAmount =
        formData.type === "expense" ? -Math.abs(amount) : Math.abs(amount);

      // Convert empty categoryId to null
      const categoryId =
        formData.categoryId === "" ? null : formData.categoryId;

      const response = await fetch(`/api/transactions/${transaction?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: finalAmount,
          transactionDate: formData.transactionDate,
          merchantName: formData.merchantName,
          categoryId: categoryId,
          type: formData.type,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to update transaction");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating transaction:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    const formattedValue = formatNumberWithDots(value);
    setFormData((prev) => ({
      ...prev,
      amount: formattedValue,
    }));
  };

  if (!transaction) return null;

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      title="Edit Transaction"
      description="Update the details of your transaction below."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="type"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Transaction Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="expense">Expense (Chi tiêu)</option>
            <option value="refund">Refund (Hoàn trả)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="amount"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
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
              className="block w-full rounded-lg border border-gray-200 py-2 pr-12 pl-7 transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm">VNĐ</span>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="merchantName"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Merchant Name
          </label>
          <input
            type="text"
            id="merchantName"
            name="merchantName"
            value={formData.merchantName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-200 px-4 py-2 transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g. Amazon, Starbucks"
          />
        </div>

        <div>
          <label
            htmlFor="transactionDate"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Transaction Date
          </label>
          <input
            type="date"
            id="transactionDate"
            name="transactionDate"
            value={formData.transactionDate}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-200 px-4 py-2 transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="categoryId"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <DialogFooter>
          <DialogButton
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </DialogButton>
          <DialogButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Transaction"}
          </DialogButton>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default EditTransactionDialog;
