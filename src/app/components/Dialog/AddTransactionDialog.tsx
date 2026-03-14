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
  validFrom?: string | null;
  validTo?: string | null;
  merchantPattern?: string | null;
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
  const [cashbackPolicies, setCashbackPolicies] = useState<CashbackPolicy[]>(
    [],
  );
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
        const categoriesResponse = await fetch(
          `/api/categories?cardId=${cardId}`,
        );
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
        const normalizedPolicies = Array.isArray(policiesData)
          ? policiesData
          : policiesData?.policies ?? [];
        setCashbackPolicies(normalizedPolicies);
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
      const finalAmount =
        formData.type === "expense" ? -Math.abs(amount) : Math.abs(amount);

      const response = await fetch(`/api/bank-cards/${cardId}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: finalAmount,
          cardId,
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

  const calculateCashback = () => {
    if (
      !formData.categoryId ||
      !formData.amount ||
      !Array.isArray(cashbackPolicies) ||
      cashbackPolicies.length === 0
    ) {
      return null;
    }

    const today = new Date(formData.transactionDate);
    const normalizedMerchant = formData.merchantName.toLowerCase().trim();

    const applicablePolicies = cashbackPolicies.filter((p) => {
      if (p.categoryId !== formData.categoryId) return false;

      if (p.validFrom && today < new Date(p.validFrom)) return false;
      if (p.validTo && today > new Date(p.validTo)) return false;

      if (p.merchantPattern) {
        const pattern = p.merchantPattern.toLowerCase();
        if (!normalizedMerchant || !normalizedMerchant.includes(pattern)) {
          return false;
        }
      }

      return true;
    });

    if (applicablePolicies.length === 0) return null;

    const amount = parseNumberFromFormatted(formData.amount);
    let best = null as
      | {
          policy: CashbackPolicy;
          amount: number;
        }
      | null;

    for (const policy of applicablePolicies) {
      const cashback = (amount * policy.cashbackPercentage) / 100;
      const finalCashback = policy.maxCashback
        ? Math.min(cashback, policy.maxCashback)
        : cashback;

      if (!best || finalCashback > best.amount) {
        best = { policy, amount: finalCashback };
      }
    }

    if (!best) return null;

    return {
      percentage: best.policy.cashbackPercentage,
      amount: best.amount,
      merchantPattern: best.policy.merchantPattern,
      validFrom: best.policy.validFrom,
      validTo: best.policy.validTo,
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
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="type"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Loại giao dịch
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="expense">Ghi nợ (chi tiêu)</option>
            <option value="refund">Ghi có (hoàn / trả lại)</option>
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
              <span className="text-gray-500 sm:text-sm">
                {formData.currency}
              </span>
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

        {cashbackInfo && (
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-gray-900">
              Ước tính hoàn tiền:{" "}
              <span className="font-semibold text-blue-700">
                +{formatNumberWithDots(cashbackInfo.amount)} {formData.currency}
              </span>{" "}
              ({cashbackInfo.percentage}%)
            </p>
            {(cashbackInfo.merchantPattern ||
              cashbackInfo.validFrom ||
              cashbackInfo.validTo) && (
              <p className="mt-1 text-xs text-gray-600">
                Áp dụng cho{" "}
                {cashbackInfo.merchantPattern
                  ? `merchant chứa "${cashbackInfo.merchantPattern}"`
                  : "merchant bất kỳ"}
                {cashbackInfo.validFrom &&
                  ` từ ${cashbackInfo.validFrom.split("T")[0]}`}
                {cashbackInfo.validTo &&
                  ` đến ${cashbackInfo.validTo.split("T")[0]}`}
              </p>
            )}
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
          <DialogButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Transaction"}
          </DialogButton>
        </DialogFooter>
      </form>
    </DialogComponent>
  );
};

export default AddTransactionDialog;
