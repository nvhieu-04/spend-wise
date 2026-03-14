import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { getDictionary, type Locale } from "~/i18n";
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
  const pathname = usePathname();
  const [, maybeLocale] = pathname.split("/");
  const locale: Locale =
    maybeLocale === "en" || maybeLocale === "vn" ? maybeLocale : "en";
  const dict = getDictionary(locale);

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
        setError(data.error ?? dict.dialogs.category.saveError);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : dict.dialogs.common.genericError,
      );
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
      title={
        category
          ? dict.dialogs.category.editTitle
          : dict.dialogs.category.addTitle
      }
      description={
        category
          ? dict.dialogs.category.editDescription
          : dict.dialogs.category.addDescription
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
            {dict.dialogs.category.nameLabel}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-200 px-4 py-2 transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder={dict.dialogs.category.namePlaceholder}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {dict.dialogs.category.descriptionLabel}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder={dict.dialogs.category.descriptionPlaceholder}
          />
        </div>

        <DialogFooter>
          <DialogButton
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {dict.dialogs.common.cancel}
          </DialogButton>
          <DialogButton type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? dict.dialogs.common.saving
              : category
                ? dict.dialogs.common.saveChanges
                : dict.dialogs.category.addButton}
          </DialogButton>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default CategoryDialog;
