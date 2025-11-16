import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import { Study } from "../../types/study";
import { ApiError } from "../../types/auth";
import { useToast } from "../../hooks/useToast";

export const ReviewStudy = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Study data state
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load study data
  useEffect(() => {
    const fetchStudy = async () => {
      if (!id) {
        setError("Study ID is missing");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const studyData = await apiService.getStudyById(id);
        setStudy(studyData);
        // Game state initialization will be handled in Step 4
      } catch (err) {
        const apiError = err as ApiError;
        let errorMessage = "Failed to load study. Please try again.";

        if (apiError.statusCode === 404) {
          errorMessage = "Study not found.";
        } else if (apiError.statusCode === 403) {
          errorMessage = "Access denied. This study is private.";
        } else if (apiError.statusCode === 401) {
          errorMessage = "Authentication required to view this study.";
        } else if (apiError.type === "NETWORK") {
          errorMessage = "Network error. Please check your connection.";
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }

        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudy();
  }, [id, toast]);

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
  if (error || !study) {
    return (
      <div className="bg-background flex h-screen items-center justify-center pt-16 sm:pt-20 md:pt-24">
        <div className="text-center">
          <h1 className="text-foreground mb-4 text-2xl font-bold">Error</h1>
          <p className="text-muted-foreground mb-6">
            {error || "Study not found"}
          </p>
          <button
            onClick={() => navigate("/home")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 font-medium transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Success state - will be fully implemented in next steps
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
