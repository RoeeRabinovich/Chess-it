import { Modal } from "../../../../components/ui/Modal";
import { Button } from "../../../../components/ui/Button";

interface DeleteSelectedStudiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyNames: string[];
  isDeleting: boolean;
  onConfirm: () => void;
}

export const DeleteSelectedStudiesModal = ({
  isOpen,
  onClose,
  studyNames,
  isDeleting,
  onConfirm,
}: DeleteSelectedStudiesModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Selected Studies"
      titleId="delete-selected-studies-modal"
      maxWidth="md"
      preventBackdropClose={isDeleting}
      closeButtonDisabled={isDeleting}
    >
      <div className="space-y-4">
        {studyNames.length > 0 ? (
          <>
            <p className="text-foreground">
              Are you sure you want to delete:{" "}
              <strong className="text-destructive">
                {studyNames.join(", ")}
              </strong>
              ?
            </p>
            <p className="text-muted-foreground text-sm">
              This action cannot be undone.
            </p>
          </>
        ) : (
          <p className="text-foreground">
            No studies selected for deletion.
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          {studyNames.length > 0 && (
            <Button
              onClick={onConfirm}
              variant="destructive"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

