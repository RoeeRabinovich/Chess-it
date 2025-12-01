import { useNavigate } from "react-router-dom";
import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { resetPasswordSchema } from "../../../validations/resetPassword.joi";
import { userService } from "../../../services/userService";
import { ApiError } from "../../../types/auth";
import { useToast } from "../../../hooks/useToast";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface UseResetPasswordFormProps {
  token: string | null;
}

interface UseResetPasswordFormReturn {
  register: UseFormRegister<ResetPasswordFormData>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<ResetPasswordFormData>;
  isSubmitting: boolean;
}

export const useResetPasswordForm = ({
  token,
}: UseResetPasswordFormProps): UseResetPasswordFormReturn => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit: originalHandleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: joiResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const handleSubmit = originalHandleSubmit(
    async (data: ResetPasswordFormData) => {
      if (!token) {
        toast({
          title: "Error",
          description:
            "Reset token is missing. Please request a new password reset.",
          variant: "destructive",
        });
        return;
      }

      try {
        await userService.resetPassword(
          token,
          data.password,
          data.confirmPassword,
        );
        toast({
          title: "Password reset successful",
          description:
            "Your password has been reset. You can now sign in with your new password.",
          variant: "success",
        });
        // Redirect to login page
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        const apiError = error as ApiError;
        let errorMessage =
          apiError?.message || "Failed to reset password. Please try again.";

        // Handle token expiration
        if (errorMessage.toLowerCase().includes("expired")) {
          errorMessage =
            "This reset link has expired. Please request a new password reset.";
        } else if (errorMessage.toLowerCase().includes("invalid")) {
          errorMessage =
            "This reset link is invalid. Please request a new password reset.";
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  );

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
  };
};
