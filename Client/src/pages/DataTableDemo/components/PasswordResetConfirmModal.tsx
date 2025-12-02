import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { DemoUser } from "../types";

interface PasswordResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: DemoUser;
  onConfirm: () => void;
}

export const PasswordResetConfirmModal = ({
  isOpen,
  onClose,
  user,
  onConfirm,
}: PasswordResetConfirmModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Password Reset Email"
      titleId="password-reset-confirm-modal"
      maxWidth="md"
    >
      <div className="space-y-4">
        <p className="text-foreground">
          Are you sure you want to send a password reset email to{" "}
          <strong>{user.email}</strong>?
        </p>
        <p className="text-muted-foreground text-sm">
          The user will receive an email with instructions to reset their
          password.
        </p>
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="default">
            Send Email
          </Button>
        </div>
      </div>
    </Modal>
  );
};

