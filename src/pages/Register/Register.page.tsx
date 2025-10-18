import { useState } from "react";
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
import { PasswordRequirements } from "../../components/ui/PasswordRequirements";
import { useToast } from "../../hooks/useToast";

import { useAuth } from "../../hooks/useAuth";
import { Crown } from "../../components/icons/Crown.icon";
import { registerSchema } from "../../validations/register.joi";
import { joiResolver } from "@hookform/resolvers/joi";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: joiResolver(registerSchema),
    mode: "onBlur",
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(
        data.username,
        data.email,
        data.password,
        data.confirmPassword,
      );
      toast({
        title: "Success!",
        description: "Account created successfully. Welcome to Chess-It!",
        variant: "success",
      });
      navigate("/");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to register. Please try again.";
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="from-background to-accent/20 flex min-h-screen items-center justify-center bg-gradient-to-br px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Crown className="bg-pastel-mint h-10 w-10" />
          </div>
          <CardTitle className="text-2xl">Join Chess-It</CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <Input
              label="Username"
              id="username"
              {...register("username")}
              error={errors.username?.message}
              required
              placeholder="Enter your username"
              aria-describedby={errors.username ? "username-error" : undefined}
            />

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

            <PasswordRequirements
              password={password || ""}
              confirmPassword={confirmPassword || ""}
              open={showPasswordRequirements}
              onOpenChange={setShowPasswordRequirements}
            >
              <Input
                label="Password"
                id="password"
                type="password"
                {...register("password")}
                onFocus={() => setShowPasswordRequirements(true)}
                onBlur={() => setShowPasswordRequirements(false)}
                error={errors.password?.message}
                required
                placeholder="Create a strong password"
                aria-describedby={
                  errors.password ? "password-error" : "password-requirements"
                }
              />
            </PasswordRequirements>

            <Input
              label="Confirm Password"
              id="confirm-password"
              type="password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              required
              placeholder="Confirm your password"
              aria-describedby={
                errors.confirmPassword ? "confirm-password-error" : undefined
              }
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Register"}
            </Button>
          </form>
          <p className="text-muted-foreground mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
