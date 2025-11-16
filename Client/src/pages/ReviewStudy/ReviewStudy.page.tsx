import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiService } from "../../services/api";
import { Study } from "../../types/study";
import { ApiError } from "../../types/auth";
import { useToast } from "../../hooks/useToast";
import { ErrorHandler } from "../../components/ErrorHandler/ErrorHandler";

export const ReviewStudy = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Study data state
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load study data
  useEffect(() => {
    const fetchStudy = async () => {
      if (!id) {
        setError({
          type: "VALIDATION",
          message: "Study ID is missing",
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const studyData = await apiService.getStudyById(id);
        setStudy(studyData);
        setError(null);
        // Game state initialization will be handled in Step 4
      } catch (err) {
        const apiError = err as ApiError;

        // Enhance error message for study-specific context
        const enhancedError: ApiError = { ...apiError };

        if (apiError.statusCode === 404) {
          enhancedError.message = "Study not found.";
        } else if (apiError.statusCode === 403) {
          enhancedError.message = "Access denied. This study is private.";
        } else if (apiError.statusCode === 401) {
          enhancedError.message = "Authentication required to view this study.";
        } else if (apiError.type === "NETWORK") {
          enhancedError.message =
            "Network error. Please check your connection.";
        } else if (!apiError.message) {
          enhancedError.message = "Failed to load study. Please try again.";
        }

        setError(enhancedError);
        toast({
          title: "Error",
          description: enhancedError.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudy();
  }, [id, toast, retryCount]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center pt-16 sm:pt-20 md:pt-24">
        <div className="text-center">
          <div className="bg-muted border-primary mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground text-lg">Loading study...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || (!loading && !study)) {
    return (
      <ErrorHandler
        error={
          error || {
            type: "SERVER",
            message: "Study not found",
            statusCode: 404,
          }
        }
        onRetry={() => {
          setError(null);
          setRetryCount((prev) => prev + 1);
        }}
      />
    );
  }

  // Success state - will be fully implemented in next steps
  if (!study) {
    return null; // This should never happen due to the error check above
  }

  return (
    <div className="bg-background flex h-screen overflow-hidden pt-16 sm:pt-20 md:pt-24">
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-foreground mb-4 text-2xl font-bold">
            {study.studyName}
          </h1>
          <p className="text-muted-foreground mb-2">
            Category: {study.category}
          </p>
          <p className="text-muted-foreground mb-2">
            {study.description || "No description"}
          </p>
          <p className="text-muted-foreground text-sm">
            Study loaded successfully. Layout will be implemented in next steps.
          </p>
        </div>
      </div>
    </div>
  );
};
