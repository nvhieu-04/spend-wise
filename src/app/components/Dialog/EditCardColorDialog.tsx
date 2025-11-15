import DialogComponent, { DialogButton, DialogFooter } from "../Dialog";

interface EditCardColorDialogProps {
  onClose: () => void;
  cardColor: string;
  handleUpdateCardColor: (color: string) => void;
}

export default function EditCardColorDialog({
  onClose,
  cardColor,
  handleUpdateCardColor,
}: EditCardColorDialogProps) {
  return (
    <DialogComponent
      isOpen={true}
      onClose={onClose}
      title="Edit Card Color"
      description="Choose a new color for your card."
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="cardColor"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Card Color
          </label>
          <input
            type="color"
            id="cardColor"
            name="cardColor"
            defaultValue={cardColor}
            onChange={(e) => handleUpdateCardColor(e.target.value)}
            className="h-12 w-full cursor-pointer rounded-lg border border-gray-200 p-1"
          />
        </div>
        <DialogFooter>
          <DialogButton variant="secondary" onClick={onClose}>
            Cancel
          </DialogButton>
        </DialogFooter>
      </div>
    </DialogComponent>
  );
}
