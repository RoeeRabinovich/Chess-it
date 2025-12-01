import { useNavigate, Link } from "react-router-dom";
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
import { forgotPasswordSchema } from "../../validations/forgotPassword.joi";
import { joiResolver } from "@hookform/resolvers/joi";
import { userService } from "../../services/userService";
import { ApiError } from "../../types/auth";

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: joiResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await userService.forgotPassword(data.email);
      toast({
        title: "Reset link sent",
        description: "Reset link has been sent.",
        variant: "success",
      });
      // Optionally navigate back to login after a delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Error",
        description:
          apiError?.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Crown className="bg-pastel-mint h-10 w-10 rounded-full" />
          </div>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              label="Email"
              error={errors.email?.message}
              required
              autocomplete="email"
            >
              <Input
                type="email"
                {...register("email")}
                placeholder="Enter your email"
              />
            </FormField>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
