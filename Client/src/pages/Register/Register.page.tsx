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
import { FormField } from "../../components/ui/FormField";
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
      await registerUser(data);
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
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Crown className="bg-pastel-mint h-10 w-10 rounded-full" />
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
            <FormField
              label="Username"
              error={errors.username?.message}
              required
              autocomplete="username"
            >
              <Input
                {...register("username")}
                placeholder="Enter your username"
              />
            </FormField>

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

            <FormField
              label="Password"
              error={errors.password?.message}
              required
              autocomplete="new-password"
            >
              <PasswordRequirements
                password={password || ""}
                confirmPassword={confirmPassword || ""}
                open={showPasswordRequirements}
                onOpenChange={setShowPasswordRequirements}
              >
                <Input
                  type="password"
                  {...register("password")}
                  onFocus={() => setShowPasswordRequirements(true)}
                  onBlur={() => setShowPasswordRequirements(false)}
                  placeholder="Create a strong password"
                />
              </PasswordRequirements>
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
                placeholder="Confirm your password"
              />
            </FormField>

            <Button
              type="submit"
              className="bg-pastel-mint text-foreground hover:bg-pastel-mint/80 w-full dark:!text-[#1A1A1A]"
              disabled={isSubmitting}
            >
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
