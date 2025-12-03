import { useEffect, useState, useMemo } from "react";
import { studyService } from "../../../services/studyService";
import { Study } from "../../../types/study";
import { ApiError } from "../../../types/auth";
import { useToast } from "../../../hooks/useToast";
import { MoveNode, MovePath } from "../../../types/chess";

interface UseStudyDataReturn {
  study: Study | null;
  loading: boolean;
  error: ApiError | null;
  retryCount: number;
  setRetryCount: React.Dispatch<React.SetStateAction<number>>;
  setError: React.Dispatch<React.SetStateAction<ApiError | null>>;
  studyGameState: {
    position: string;
    moveTree: MoveNode[];
    currentPath: MovePath;
    isFlipped: boolean;
    opening?: string | { name: string; eco: string };
    comments?: Record<string, string>;
  };
}

export const useStudyData = (id: string | undefined): UseStudyDataReturn => {
  const { toast } = useToast();
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Memoize studyGameState to prevent unnecessary re-renders
  const studyGameState = useMemo(() => {
    if (!study?.gameState) {
      return {
        position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        moveTree: [],
        currentPath: [],
        isFlipped: false,
      };
    }
    // Ensure the gameState matches the expected structure
    const { position, moveTree, currentPath, isFlipped, opening, comments } =
      study.gameState;
    return {
      position,
      moveTree: moveTree || [],
      currentPath: currentPath || [],
      isFlipped: isFlipped || false,
      opening,
      comments,
    };
  }, [study?.gameState]);

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
        const studyData = await studyService.getStudyById(id);
        setStudy(studyData);
        setError(null);
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

  return {
    study,
    loading,
    error,
    retryCount,
    setRetryCount,
    setError,
    studyGameState,
  };
};
