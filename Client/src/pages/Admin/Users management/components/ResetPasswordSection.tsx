import { useState } from "react";
import { Button } from "../../../../components/ui/Button";
import { User } from "../../../../types/user";
import { PasswordResetConfirmModal } from "./PasswordResetConfirmModal";

interface ResetPasswordSectionProps {
  user: User;
  onPasswordReset?: (userId: string) => Promise<void>;
}

export const ResetPasswordSection = ({
  user,
  onPasswordReset,
}: ResetPasswordSectionProps) => {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setIsResetting(true);
    setShowConfirm(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onPasswordReset) {
        await onPasswordReset(user._id);
      }

      alert(`Password reset email sent to ${user.email}`);
    } catch {
      alert("Failed to send password reset email. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <h4 className="text-foreground text-lg font-semibold">
          Reset Password
        </h4>
        <p className="text-muted-foreground text-sm">
          Send a password reset email to {user.email}
        </p>
        <div className="flex justify-end">
          <Button
            onClick={handleClick}
            disabled={isResetting}
            variant="outline"
            size="sm"
          >
            {isResetting
              ? "Sending..."
              : "Send Password Reset Email"}
          </Button>
        </div>
      </div>

      <PasswordResetConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        user={user}
        onConfirm={handleConfirm}
      />
    </>
  );
};

