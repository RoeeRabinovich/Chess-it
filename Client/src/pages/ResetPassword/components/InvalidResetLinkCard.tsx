import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Crown } from "../../../components/icons/Crown.icon";

export const InvalidResetLinkCard = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Crown className="bg-pastel-mint h-10 w-10 rounded-full" />
          </div>
          <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
          <CardDescription>
            The password reset link is invalid or missing. Please request a new
            password reset.
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
};
