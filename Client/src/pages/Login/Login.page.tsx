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
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { Crown } from "../../components/icons/Crown.icon";
import { loginSchema } from "../../validations/login.joi";
import { joiResolver } from "@hookform/resolvers/joi";

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: joiResolver(loginSchema),
    mode: "onBlur",
  });

  const getErrorMessage = (
    error: unknown,
  ): { title: string; description: string } => {
    // Handle both Error instances and plain objects
    let message = "";
    if (error instanceof Error) {
      message = error.message;
    } else if (error && typeof error === "object" && "message" in error) {
      message = (error as { message: string }).message;
    }

    if (message) {
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("user not found")) {
        return {
          title: "Email not found",
          description:
            "No account exists with this email address. Please check your email or create a new account.",
        };
      }

      if (lowerMessage.includes("invalid password")) {
        return {
          title: "Incorrect password",
          description:
            "The password you entered is incorrect. Please try again or reset your password.",
        };
      }

      if (
        lowerMessage.includes("password must be") ||
        lowerMessage.includes("joi error")
      ) {
        return {
          title: "Invalid password format",
          description:
            "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number and one special character.",
        };
      }

      if (
        lowerMessage.includes("invalid request data") ||
        lowerMessage.includes("validation")
      ) {
        return {
          title: "Invalid input",
          description: message,
        };
      }

      // For any other error, show the actual error message
      return {
        title: "Login failed",
        description:
          message || "An unexpected error occurred. Please try again.",
      };
    }

    return {
      title: "Unable to sign in",
      description:
        "An unexpected error occurred. Please check your credentials and try again.",
    };
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
        variant: "success",
      });
      navigate("/");
    } catch (error: unknown) {
      const { title, description } = getErrorMessage(error);
      toast({
        title,
        description,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Crown className="bg-pastel-mint h-10 w-10 rounded-full" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Chess-It account</CardDescription>
          <div className="bg-muted/50 border-border mt-2 rounded-md border p-3">
            <p className="text-muted-foreground text-xs">
              <strong>Demo credentials:</strong>
              <br />
              Email: test3@email.com
              <br />
              Password: Test!123
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <Input
              label="Email"
              id="email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              required
              placeholder="Enter your email"
              aria-describedby={errors.email ? "email-error" : undefined}
            />

            <Input
              label="Password"
              id="password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
              required
              placeholder="Enter your password"
              aria-describedby={errors.password ? "password-error" : undefined}
            />

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-primary text-sm hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-muted-foreground mt-4 text-center text-sm">
            Don't have an account?
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
