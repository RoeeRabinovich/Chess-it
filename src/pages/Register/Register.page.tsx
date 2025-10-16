import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const { error } = registerSchema.validate(
      { username, email, password, confirmPassword },
      { abortEarly: false },
    );

    if (error) {
      const validationErrors: {
        username?: string;
        email?: string;
        password?: string;
      } = {};
      error.details.forEach((detail) => {
        const key = detail.path[0] as keyof typeof validationErrors;
        validationErrors[key] = detail.message;
      });
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password, confirmPassword);
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
    } finally {
      setLoading(false);
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
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              required
              placeholder="Enter your username"
              aria-describedby={errors.username ? "username-error" : undefined}
            />

            <Input
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              placeholder="Enter your email"
              aria-describedby={errors.email ? "email-error" : undefined}
            />

            <PasswordRequirements
              password={password}
              confirmPassword={confirmPassword}
              open={showPasswordRequirements}
              onOpenChange={setShowPasswordRequirements}
            >
              <Input
                label="Password"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setShowPasswordRequirements(true)}
                onBlur={() => setShowPasswordRequirements(false)}
                error={errors.password}
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              required
              placeholder="Confirm your password"
              aria-describedby={
                errors.confirmPassword ? "confirm-password-error" : undefined
              }
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
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
