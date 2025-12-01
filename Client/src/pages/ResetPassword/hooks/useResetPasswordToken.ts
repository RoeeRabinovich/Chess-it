import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../../hooks/useToast";

interface UseResetPasswordTokenReturn {
  token: string | null;
  isTokenValid: boolean | null;
}

export const useResetPasswordToken = (): UseResetPasswordTokenReturn => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

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

  return { token, isTokenValid };
};
