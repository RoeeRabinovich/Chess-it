import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";

interface DeleteStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyName: string;
  isDeleting: boolean;
  onConfirm: () => void;
}

export const DeleteStudyModal = ({
  isOpen,
  onClose,
  studyName,
  isDeleting,
  onConfirm,
}: DeleteStudyModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Study"
      titleId="delete-study-modal"
      maxWidth="md"
      preventBackdropClose={isDeleting}
      closeButtonDisabled={isDeleting}
    >
      <div className="space-y-4">
        <p className="text-foreground">
          Are you sure you want to delete{" "}
          <strong className="text-destructive">"{studyName}"</strong>? This
          action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="destructive"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

