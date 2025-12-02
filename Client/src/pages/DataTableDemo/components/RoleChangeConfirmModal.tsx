import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { DemoUser } from "../types";

interface RoleChangeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: DemoUser;
  pendingRole: "admin" | "user";
  onConfirm: () => void;
}

export const RoleChangeConfirmModal = ({
  isOpen,
  onClose,
  user,
  pendingRole,
  onConfirm,
}: RoleChangeConfirmModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Role Change"
      titleId="role-change-confirm-modal"
      maxWidth="md"
    >
      <div className="space-y-4">
        <p className="text-foreground">
          Are you sure you want to change <strong>{user.username}</strong>'s role
          from <strong>{user.role.toUpperCase()}</strong> to{" "}
          <strong>{pendingRole.toUpperCase()}</strong>?
        </p>
        {pendingRole === "admin" && (
          <div className="bg-destructive/10 border-destructive rounded-lg border p-3">
            <p className="text-destructive text-sm">
              ⚠️ Promoting a user to admin grants them full administrative
              privileges.
            </p>
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="default">
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

