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
import { useToast } from "../../hooks/useToast";
import { Crown } from "../../components/icons/Crown.icon";
import { resetPasswordSchema } from "../../validations/resetPassword.joi";
import { joiResolver } from "@hookform/resolvers/joi";
import { apiService } from "../../services/api";
import { ApiError } from "../../types/auth";

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="bg-muted border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
              <p className="text-muted-foreground">Validating reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 px-4">
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
            <Input
              label="New Password"
              id="password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
              required
              placeholder="Enter your new password"
              aria-describedby={errors.password ? "password-error" : undefined}
            />

            <Input
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              required
              placeholder="Confirm your new password"
              aria-describedby={
                errors.confirmPassword ? "confirmPassword-error" : undefined
              }
            />

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
