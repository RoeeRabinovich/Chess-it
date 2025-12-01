import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";

interface ConfirmUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  usernameValue: string;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export const ConfirmUsernameModal = ({
  isOpen,
  onClose,
  usernameValue,
  isSubmitting,
  onConfirm,
}: ConfirmUsernameModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Username Change"
      titleId="confirm-username-modal"
      maxWidth="md"
      preventBackdropClose={isSubmitting}
      closeButtonDisabled={isSubmitting}
    >
      <div className="space-y-4">
        <p className="text-foreground">
          Are you sure you want to change your username to:{" "}
          <strong className="text-pastel-mint">"{usernameValue}"</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-pastel-mint text-foreground hover:bg-pastel-mint/80 dark:!text-[#1A1A1A]"
          >
            {isSubmitting ? "Changing..." : "Change Username"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

