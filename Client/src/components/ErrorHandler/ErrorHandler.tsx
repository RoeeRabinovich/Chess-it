import { useNavigate } from "react-router-dom";
import { ApiError } from "../../types/auth";
import { Button } from "../ui/Button";

interface ErrorHandlerProps {
  error: ApiError | string | null;
  title?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
  onRetry?: () => void;
  retryButtonText?: string;
  className?: string;
}

/**
 * Reusable error handler component that displays error messages
 * with appropriate UI based on error type
 */
export const ErrorHandler = ({
  error,
  title = "Error",
  showBackButton = true,
  backButtonText = "Go Back Home",
  backButtonPath = "/home",
  onRetry,
  retryButtonText = "Try Again",
  className = "",
}: ErrorHandlerProps) => {
  const navigate = useNavigate();

  if (!error) {
    return null;
  }

  // Convert error to ApiError format if it's a string
  const apiError: ApiError | null =
    typeof error === "string"
      ? {
          type: "SERVER",
          message: error,
          statusCode: undefined,
        }
      : error;

  // Get user-friendly error message based on error type
  const getErrorMessage = (): string => {
    if (!apiError) return "An unexpected error occurred.";

    // Use custom message if provided
    if (apiError.message) {
      return apiError.message;
    }

    // Default messages based on error type
    switch (apiError.type) {
      case "NETWORK":
        return "Network error. Please check your connection and try again.";
      case "AUTHENTICATION":
        if (apiError.statusCode === 401) {
          return "Authentication required. Please log in.";
        } else if (apiError.statusCode === 403) {
          return "Access denied. You don't have permission to access this resource.";
        }
        return "Authentication error. Please try again.";
      case "VALIDATION":
        return "Invalid data. Please check your input and try again.";
      case "SERVER":
        if (apiError.statusCode === 404) {
          return "Resource not found.";
        } else if (apiError.statusCode === 500) {
          return "Server error. Please try again later.";
        }
        return "An unexpected error occurred. Please try again.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  // Get error title based on error type
  const getErrorTitle = (): string => {
    if (!apiError) return title;

    switch (apiError.type) {
      case "NETWORK":
        return "Connection Error";
      case "AUTHENTICATION":
        if (apiError.statusCode === 401) {
          return "Authentication Required";
        } else if (apiError.statusCode === 403) {
          return "Access Denied";
        }
        return "Authentication Error";
      case "VALIDATION":
        return "Validation Error";
      case "SERVER":
        if (apiError.statusCode === 404) {
          return "Not Found";
        }
        return "Server Error";
      default:
        return title;
    }
  };

  const errorMessage = getErrorMessage();
  const errorTitle = getErrorTitle();

  return (
    <div
      className={`bg-background flex h-screen items-center justify-center pt-16 sm:pt-20 md:pt-24 ${className}`}
    >
      <div className="max-w-md px-4 text-center">
        <div className="mb-6">
          <div className="text-destructive mb-4 text-6xl">⚠️</div>
          <h1 className="text-foreground mb-2 text-2xl font-bold">
            {errorTitle}
          </h1>
          <p className="text-muted-foreground text-base">{errorMessage}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="default"
              className="w-full sm:w-auto"
            >
              {retryButtonText}
            </Button>
          )}
          {showBackButton && (
            <Button
              onClick={() => navigate(backButtonPath)}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {backButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
