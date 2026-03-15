import { usePathname } from "next/navigation";
import { useState } from "react";
import { getDictionary, type Locale } from "~/i18n";
import DialogComponent, { DialogButton, DialogFooter } from "../Dialog";

interface DeleteBankCardDialogProps {
  onClose: () => void;
  cardName: string;
  cardId: string;
  onDelete?: (id: string) => void;
}

export default function DeleteBankCardDialog({
  onClose,
  cardName,
  cardId,
  onDelete,
}: DeleteBankCardDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const pathname = usePathname() ?? "";
  const [, maybeLocale] = pathname.split("/");
  const locale: Locale =
    maybeLocale === "en" || maybeLocale === "vn" ? maybeLocale : "en";
  const dict = getDictionary(locale);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/bank-cards/${cardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete card");
      }

      onDelete?.(cardId);
      const notificationResponse = await fetch("/api/notifications");
      if (notificationResponse.ok) {
        const notifications = await notificationResponse.json();
        window.dispatchEvent(
          new CustomEvent("notifications-updated", { detail: notifications }),
        );
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      alert(dict.dialogs.deleteCard.error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const description = dict.dialogs.deleteCard.description.replace(
    "{cardName}",
    cardName,
  );

  return (
    <DialogComponent
      isOpen={true}
      onClose={onClose}
      title={dict.dialogs.deleteCard.title}
      description={description}
    >
      <DialogFooter>
        <DialogButton variant="secondary" onClick={onClose}>
          {dict.dialogs.common.cancel}
        </DialogButton>
        <DialogButton
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting
            ? dict.dialogs.deleteCard.deleting
            : dict.dialogs.deleteCard.delete}
        </DialogButton>
      </DialogFooter>
    </DialogComponent>
  );
}
