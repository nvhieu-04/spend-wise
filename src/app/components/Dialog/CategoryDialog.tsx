import React, { useState } from "react";
import Dialog, { DialogButton, DialogFooter } from "../Dialog";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryDialogProps {
  onClose: () => void;
  category?: Category;
  onSuccess: () => void;
  cardId: string;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  onClose,
  category,
  onSuccess,
  cardId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: category?.name ?? "",
    description: category?.description ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = category
        ? `/api/categories/${category.id}`
        : "/api/categories";
      const method = category ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          cardId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to save category");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      title={category ? "Edit Category" : "Add New Category"}
      description={
        category
          ? "Update the category details below."
          : "Enter the details of your new category below."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Category Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-200 px-4 py-2 transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g. Food & Dining, Shopping"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter a description for this category"
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
          <DialogButton type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : category
                ? "Save Changes"
                : "Add Category"}
          </DialogButton>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default CategoryDialog;
