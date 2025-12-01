import { useState, useCallback } from "react";
import { apiService } from "../../../services/api";
import { useToast } from "../../../hooks/useToast";

interface UsePasswordResetReturn {
  isRequestingPasswordReset: boolean;
  handleResetPassword: (email: string) => Promise<void>;
}

export const usePasswordReset = (): UsePasswordResetReturn => {
  const [isRequestingPasswordReset, setIsRequestingPasswordReset] =
    useState(false);
  const { toast } = useToast();

  const handleResetPassword = useCallback(
    async (email: string) => {
      if (!email) return;

      setIsRequestingPasswordReset(true);
      try {
        await apiService.forgotPassword(email);
        toast({
          title: "Reset link sent",
          description:
            "A password reset link has been sent to your email address.",
          variant: "success",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to send reset email. Please try again.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsRequestingPasswordReset(false);
      }
    },
    [toast],
  );

  return {
    isRequestingPasswordReset,
    handleResetPassword,
  };
};
