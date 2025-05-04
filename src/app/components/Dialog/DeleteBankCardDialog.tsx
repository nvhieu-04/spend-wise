import { useState } from "react";
import DialogComponent, { DialogButton, DialogFooter } from "../Dialog";

interface DeleteBankCardDialogProps {
    onClose: () => void;
    cardName: string;
    cardId: string;
    onDelete?: (id: string) => void;
}

export default function DeleteBankCardDialog({ onClose, cardName, cardId, onDelete }: DeleteBankCardDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/bank-cards/${cardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      onDelete?.(cardId);
      // Instead of reloading the page, fetch new notifications
      const notificationResponse = await fetch('/api/notifications');
      if (notificationResponse.ok) {
        const notifications = await notificationResponse.json();
        // Dispatch a custom event to update notifications
        window.dispatchEvent(new CustomEvent('notifications-updated', { detail: notifications }));
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card. Please try again.');
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };
  return (
    <DialogComponent
      isOpen={true}
      onClose={onClose}
      title="Delete Card"
      description={`Are you sure you want to delete the card "${cardName}"? This action cannot be undone.`}
    >
      <DialogFooter>
        <DialogButton
          variant="secondary"
          onClick={() => {
            onClose();
          }}
        >
            Cancel
        </DialogButton>
        <DialogButton
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </DialogButton>
      </DialogFooter>
    </DialogComponent>
  );
};