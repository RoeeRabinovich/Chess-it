import { useEffect, useMemo, useState } from "react";
import { GameAspect, StudyFilters, Study } from "../../../types/study";
import { apiService } from "../../../services/api";
import { studyService } from "../../../services/studyService";
import { ApiError } from "../../../types/auth";
import { StudyCard } from "./StudyCard";
import { useToast } from "../../../hooks/useToast";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { clearArchive } from "../../../store/archiveSlice";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Pagination } from "../../../components/ui/Pagination";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Button } from "../../../components/ui/Button";
import { Book } from "../../../components/icons/Book.icon";
import { Search } from "../../../components/icons/Search.icon";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

interface StudyCardsGridProps {
  category: GameAspect;
  filter: StudyFilters;
}

const ITEMS_PER_PAGE = 10;

export const StudyCardsGrid = ({ category, filter }: StudyCardsGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const searchQuery = useAppSelector((state) => state.search.query);
  const isArchiveActive = useAppSelector((state) => state.archive.isActive);
  const isAuthenticated = apiService.isAuthenticated();
  const likedOnly = isArchiveActive && isAuthenticated;
  const dispatch = useAppDispatch();

  // Clear archive state if user is not authenticated
  useEffect(() => {
    if (isArchiveActive && !isAuthenticated) {
      dispatch(clearArchive());
    }
  }, [isArchiveActive, isAuthenticated, dispatch]);

  useEffect(() => {
    // Reset to page 1 when filters/search change
    setCurrentPage(1);
  }, [category, filter, searchQuery, likedOnly , isArchiveActive]);

  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const queryKey = useMemo(
    () => [
      "publicStudies",
      { category, filter, searchQuery, likedOnly, currentPage , isArchiveActive },
    ],
    [category, filter, searchQuery, likedOnly, currentPage],
  );

  const {
    data: studiesData,
    isPending,
    isFetching,
    error,
  } = useQuery<Study[], ApiError>({
    queryKey,
    queryFn: () =>
      studyService.getPublicStudies({
        category,
        filter,
        search: searchQuery,
        // Fetch one extra item to check if there's a next page
        limit: ITEMS_PER_PAGE + 1,
        skip,
        likedOnly,
      }),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (!error) return;
    toast({
      title: "Error",
      description: error?.message || "Failed to load studies. Please try again.",
      variant: "destructive",
    });
  }, [error, toast]);

  if (isPending) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        variant="error"
        title="Error loading studies"
        description={error?.message || "Failed to load studies. Please try again."}
        size="md"
      />
    );
  }

  const studiesRaw = studiesData ?? [];
  const hasNextPage = studiesRaw.length > ITEMS_PER_PAGE;
  const studies = studiesRaw.slice(0, ITEMS_PER_PAGE);
  const totalPages = hasNextPage ? currentPage + 1 : currentPage;

  if (studies.length === 0) {
    // Show different message for archive empty state (only if authenticated)
    if (isArchiveActive && isAuthenticated) {
      return (
        <EmptyState
          variant="empty"
          icon={<Book className="text-muted-foreground h-12 w-12" />}
          title="No liked studies"
          description="Studies you like will appear here. Start exploring to find studies you love!"
          action={
            <Button onClick={() => dispatch(clearArchive())} variant="outline">
              Explore Studies
            </Button>
          }
        />
      );
    }

    return (
      <EmptyState
        variant="search"
        icon={<Search className="text-muted-foreground h-12 w-12" />}
        title="No studies found"
        description="Try adjusting your filters or search query to find more studies."
      />
    );
  }

  return (
    <div className="space-y-6">
      {isFetching && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="small" />
        </div>
      )}
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
