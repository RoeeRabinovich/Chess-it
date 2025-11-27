import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { FormField } from "../../components/ui/FormField";
import { useToast } from "../../hooks/useToast";
import { Crown } from "../../components/icons/Crown.icon";
import { resetPasswordSchema } from "../../validations/resetPassword.joi";
import { joiResolver } from "@hookform/resolvers/joi";
import { apiService } from "../../services/api";
import { ApiError } from "../../types/auth";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: joiResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setIsTokenValid(false);
      toast({
        title: "Invalid reset link",
        description:
          "No reset token found in the link. Please request a new password reset.",
        variant: "destructive",
      });
    } else {
      setToken(tokenFromUrl);
      setIsTokenValid(true);
    }
  }, [searchParams, toast]);

  const onSubmit = async (data: ResetPasswordFormData) => {
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
      await apiService.resetPassword(
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
  };

  if (isTokenValid === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <LoadingSpinner
              size="small"
              text="Validating reset link..."
              className="mx-auto"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Crown className="bg-pastel-mint h-10 w-10 rounded-full" />
            </div>
            <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
            <CardDescription>
              The password reset link is invalid or missing. Please request a
              new password reset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={() => navigate("/forgot-password")}
                className="w-full"
              >
                Request New Reset Link
              </Button>
              <p className="text-muted-foreground text-center text-sm">
                Remember your password?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Crown className="bg-pastel-mint h-10 w-10 rounded-full" />
          </div>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below. Make sure it's strong and secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              label="New Password"
              error={errors.password?.message}
              required
              autocomplete="new-password"
            >
              <Input
                type="password"
                {...register("password")}
                placeholder="Enter your new password"
              />
            </FormField>

            <FormField
              label="Confirm Password"
              error={errors.confirmPassword?.message}
              required
              autocomplete="new-password"
            >
              <Input
                type="password"
                {...register("confirmPassword")}
                placeholder="Confirm your new password"
              />
            </FormField>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
          <p className="text-muted-foreground mt-4 text-center text-sm">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
