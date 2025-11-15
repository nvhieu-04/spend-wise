import React, { useState, useEffect } from "react";
import { formatNumberWithDots } from "../../../lib/utils";
import DialogComponent, { DialogButton, DialogFooter } from "../Dialog";

interface Category {
  id: string;
  name: string;
}

interface CashbackPolicyDialogProps {
  onClose: () => void;
  cardId: string;
  onSuccess: () => void;
}

const CashbackPolicyDialog: React.FC<CashbackPolicyDialogProps> = ({
  onClose,
  cardId,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    categoryId: "",
    cashbackPercentage: "",
    maxCashback: "",
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
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, [cardId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/cashback-policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId,
          categoryId: formData.categoryId,
          cashbackPercentage: parseFloat(formData.cashbackPercentage),
          maxCashback: formData.maxCashback
            ? parseInt(formData.maxCashback.replace(/\./g, ""))
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create policy");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating policy:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
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

  const handleMaxCashbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    const formattedValue = formatNumberWithDots(value);
    setFormData((prev) => ({
      ...prev,
      maxCashback: formattedValue,
    }));
  };

  return (
    <DialogComponent
      isOpen={true}
      onClose={onClose}
      title="Add Cashback Policy"
      description="Set up a new cashback policy for this card."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

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
            required
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

        <div>
          <label
            htmlFor="cashbackPercentage"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Cashback Percentage
          </label>
          <div className="relative rounded-md shadow-sm">
            <input
              type="number"
              name="cashbackPercentage"
              id="cashbackPercentage"
              value={formData.cashbackPercentage}
              onChange={handleChange}
              required
              min="0"
              max="100"
              step="0.1"
              className="block w-full rounded-lg border border-gray-200 py-2 pr-12 pl-7 transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm">%</span>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="maxCashback"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Maximum Cashback (Optional)
          </label>
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              name="maxCashback"
              id="maxCashback"
              value={formData.maxCashback}
              onChange={handleMaxCashbackChange}
              className="block w-full rounded-lg border border-gray-200 py-2 pr-12 pl-7 transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm">VNĐ</span>
            </div>
          </div>
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
            {isSubmitting ? "Adding..." : "Add Policy"}
          </DialogButton>
        </DialogFooter>
      </form>
    </DialogComponent>
  );
};

export default CashbackPolicyDialog;
