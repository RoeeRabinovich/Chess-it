import { useEffect, useState } from "react";
import { GameAspect, StudyFilters, PublicStudy } from "../../../types/study";
import { apiService } from "../../../services/api";
import { ApiError } from "../../../types/auth";
import { StudyCard } from "./StudyCard";
import { useToast } from "../../../hooks/useToast";

interface StudyCardsGridProps {
  category: GameAspect;
  filter: StudyFilters;
}

export const StudyCardsGrid = ({ category, filter }: StudyCardsGridProps) => {
  const [studies, setStudies] = useState<PublicStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudies = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiService.getPublicStudies({
          category,
          filter,
          limit: 20,
          skip: 0,
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
  }, [category, filter, toast]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="bg-muted border-primary h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"></div>
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
