import { useEffect, useState } from "react";
import { GameAspect, StudyFilters, PublicStudy } from "../../../types/study";
import { apiService } from "../../../services/api";
import { ApiError } from "../../../types/auth";
import { StudyCard } from "./StudyCard";
import { useToast } from "../../../hooks/useToast";
import { useAppSelector } from "../../../store/hooks";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Pagination } from "../../../components/ui/Pagination";

interface StudyCardsGridProps {
  category: GameAspect;
  filter: StudyFilters;
}

const ITEMS_PER_PAGE = 2;

export const StudyCardsGrid = ({ category, filter }: StudyCardsGridProps) => {
  const [studies, setStudies] = useState<PublicStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const searchQuery = useAppSelector((state) => state.search.query);
  const isArchiveActive = useAppSelector((state) => state.archive.isActive);
  const isAuthenticated = apiService.isAuthenticated();

  useEffect(() => {
    // Reset to page 1 when filters/search change
    setCurrentPage(1);
  }, [category, filter, searchQuery, isArchiveActive]);

  useEffect(() => {
    const fetchStudies = async () => {
      setLoading(true);
      setError(null);

      try {
        // If archive is active but user is not authenticated, show empty state
        if (isArchiveActive && !isAuthenticated) {
          setStudies([]);
          setTotalPages(1);
          setLoading(false);
          return;
        }

        const skip = (currentPage - 1) * ITEMS_PER_PAGE;
        // Fetch one extra item to check if there's a next page
        const data = await apiService.getPublicStudies({
          category,
          filter,
          search: searchQuery,
          limit: ITEMS_PER_PAGE + 1,
          skip,
          likedOnly: isArchiveActive && isAuthenticated,
        });
        
        // If we got more than ITEMS_PER_PAGE, there's a next page
        const hasNextPage = data.length > ITEMS_PER_PAGE;
        // Only display ITEMS_PER_PAGE items
        const studiesToShow = data.slice(0, ITEMS_PER_PAGE);
        
        setStudies(studiesToShow);
        
        // Calculate total pages: if there's a next page, show currentPage + 1
        // Otherwise, currentPage is the last page
        if (hasNextPage) {
          setTotalPages(currentPage + 1);
        } else {
          setTotalPages(currentPage);
        }
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
  }, [category, filter, searchQuery, isArchiveActive, isAuthenticated, currentPage, toast]);

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {studies.map((study) => (
          <StudyCard key={study._id} study={study} />
        ))}
      </div>
      
      {studies.length > 0 && totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
