import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";

interface DeleteSelectedModalProps {
  isOpen: boolean;
  onClose: () => void;
  usernames: string[];
  adminUsernames?: string[];
  isDeleting: boolean;
  onConfirm: () => void;
}

export const DeleteSelectedModal = ({
  isOpen,
  onClose,
  usernames,
  adminUsernames = [],
  isDeleting,
  onConfirm,
}: DeleteSelectedModalProps) => {
  const hasAdminUsers = adminUsernames.length > 0;
  const hasNonAdminUsers = usernames.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Selected Users"
      titleId="delete-selected-modal"
      maxWidth="md"
      preventBackdropClose={isDeleting}
      closeButtonDisabled={isDeleting}
    >
      <div className="space-y-4">
        {hasAdminUsers && (
          <div className="bg-destructive/10 border-destructive rounded-lg border p-3">
            <p className="text-destructive text-sm font-semibold">
              ⚠️ Cannot delete admin users
            </p>
            <p className="text-destructive mt-1 text-sm">
              The following admin users will not be deleted:{" "}
              <strong>{adminUsernames.join(", ")}</strong>
            </p>
          </div>
        )}
        {hasNonAdminUsers ? (
          <>
            <p className="text-foreground">
              Are you sure you want to delete:{" "}
              <strong className="text-destructive">
                {usernames.join(", ")}
              </strong>
              ?
            </p>
            <p className="text-muted-foreground text-sm">
              This action cannot be undone.
            </p>
          </>
        ) : (
          <p className="text-foreground">
            No users can be deleted. All selected users are administrators.
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
          {hasNonAdminUsers && (
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

