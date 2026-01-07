import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { FormField } from "../../../components/ui/FormField";
import { Crown } from "../../../components/icons/Crown.icon";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordFormProps {
  register: UseFormRegister<ResetPasswordFormData>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<ResetPasswordFormData>;
  isSubmitting: boolean;
}

export const ResetPasswordForm = ({
  register,
  handleSubmit,
  errors,
  isSubmitting,
}: ResetPasswordFormProps) => {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
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
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
