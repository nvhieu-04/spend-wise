import DialogComponent, { DialogButton, DialogFooter } from "../Dialog";

interface EditCardColorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cardColor: string;
  handleUpdateCardColor: (color: string) => void;
}

export default function EditCardColorDialog({  isOpen,  onClose, cardColor,  handleUpdateCardColor,}: EditCardColorDialogProps) {
  return (
    <DialogComponent
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Card Color"
      description="Choose a new color for your card."
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="cardColor" className="block text-sm font-medium text-gray-700 mb-1">
              Card Color
          </label>
          <input
            type="color"
            id="cardColor"
            name="cardColor"
            defaultValue={cardColor}
            onChange={(e) => handleUpdateCardColor(e.target.value)}
            className="w-full h-12 p-1 rounded-lg border border-gray-200 cursor-pointer"
          />
        </div>
        <DialogFooter>
          <DialogButton
            variant="secondary"
            onClick={onClose}
          >
              Cancel
          </DialogButton>
        </DialogFooter>
      </div>
    </DialogComponent>
  );
};

