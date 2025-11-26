import { useEffect, useState } from "react";
import { GameAspect, StudyFilters, PublicStudy } from "../../../types/study";
import { apiService } from "../../../services/api";
import { ApiError } from "../../../types/auth";
import { StudyCard } from "./StudyCard";
import { useToast } from "../../../hooks/useToast";
import { useAppSelector } from "../../../store/hooks";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";

interface StudyCardsGridProps {
  category: GameAspect;
  filter: StudyFilters;
}

export const StudyCardsGrid = ({ category, filter }: StudyCardsGridProps) => {
  const [studies, setStudies] = useState<PublicStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const searchQuery = useAppSelector((state) => state.search.query);
  const isArchiveActive = useAppSelector((state) => state.archive.isActive);
  const isAuthenticated = apiService.isAuthenticated();

  useEffect(() => {
    const fetchStudies = async () => {
      setLoading(true);
      setError(null);

      try {
        // If archive is active but user is not authenticated, show empty state
        if (isArchiveActive && !isAuthenticated) {
          setStudies([]);
          setLoading(false);
          return;
        }

        const data = await apiService.getPublicStudies({
          category,
          filter,
          search: searchQuery,
          limit: 20,
          skip: 0,
          likedOnly: isArchiveActive && isAuthenticated,
        });
        setStudies(data);
      } catch (err) {
        const apiError = err as ApiError;
        const errorMessage =
          apiError?.message || "Failed to load studies. Please try again.";
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

    fetchStudies();
  }, [category, filter, searchQuery, isArchiveActive, isAuthenticated, toast]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2 text-lg font-semibold">
            Error loading studies
          </p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (studies.length === 0) {
    // Show different message for archive empty state
    if (isArchiveActive) {
      if (!isAuthenticated) {
        return (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">
                Please log in to view your archived studies.
              </p>
            </div>
          </div>
        );
      }
      return (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground text-lg">
              Oops! You have 0 liked studies.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">
            No studies found. Try adjusting your filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {studies.map((study) => (
        <StudyCard key={study._id} study={study} />
      ))}
    </div>
  );
};
