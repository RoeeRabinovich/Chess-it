import { useEffect, useState, useCallback, useMemo } from "react";
import { PublicStudy } from "../../types/study";
import { apiService } from "../../services/api";
import { ApiError } from "../../types/auth";
import { StudyCard } from "../HomeExplore/components/StudyCard";
import { useToast } from "../../hooks/useToast";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { SearchInput } from "../../components/ui/SearchInput";
import { Pagination } from "../../components/ui/Pagination";

const ITEMS_PER_PAGE = 12;

export const MyStudies = () => {
  const [studies, setStudies] = useState<PublicStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchStudies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getUserStudies();
      setStudies(data);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage =
        apiError?.message || "Failed to load your studies. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  // Filter studies based on search query
  const filteredStudies = useMemo(() => {
    if (!searchQuery.trim()) {
      return studies;
    }
    const query = searchQuery.toLowerCase().trim();
    return studies.filter(
      (study) =>
        study.studyName.toLowerCase().includes(query) ||
        study.description.toLowerCase().includes(query) ||
        study.category.toLowerCase().includes(query),
    );
  }, [studies, searchQuery]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredStudies.length / ITEMS_PER_PAGE));
  const paginatedStudies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredStudies.slice(startIndex, endIndex);
  }, [filteredStudies, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDelete = (studyId: string) => {
    // Find the study to get its name for confirmation
    const study = studies.find((s) => s._id === studyId);
    const studyName = study?.studyName || "this study";

    // Set the study to delete and show modal
    setStudyToDelete({ id: studyId, name: studyName });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!studyToDelete) return;

    setIsDeleting(true);
    try {
      await apiService.deleteStudy(studyToDelete.id);
      // Remove the study from the list
      setStudies(studies.filter((s) => s._id !== studyToDelete.id));
      setShowDeleteModal(false);
      setStudyToDelete(null);
      toast({
        title: "Success",
        description: "Study deleted successfully.",
      });
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage =
        apiError?.message || "Failed to delete study. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudyToDelete(null);
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex min-h-[400px] items-center justify-center">
            <LoadingSpinner size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-destructive mb-2 text-lg font-semibold">
                Error loading studies
              </p>
              <p className="text-muted-foreground text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-16 sm:pt-20 md:pt-24">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground font-minecraft mb-2 text-3xl font-bold">
            My Studies
          </h1>
          <p className="text-muted-foreground text-sm">
            {studies.length === 0
              ? "You haven't created any studies yet."
              : `You have ${studies.length} ${studies.length === 1 ? "study" : "studies"}.`}
          </p>
        </div>

        {/* Search Input */}
        {studies.length > 0 && (
          <div className="mb-6">
            <SearchInput
              placeholder="Search your studies..."
              value={searchQuery}
              onChange={setSearchQuery}
              showClearButton
              debounceMs={300}
              className="max-w-md"
            />
          </div>
        )}

        {/* Studies Grid */}
        {studies.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">
                No studies found. Create your first study to get started!
              </p>
            </div>
          </div>
        ) : filteredStudies.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">
                No studies match your search. Try a different query.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {paginatedStudies.map((study) => (
                <StudyCard
                  key={study._id}
                  study={study}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        title="Delete Study"
        titleId="delete-study-modal"
        maxWidth="md"
        preventBackdropClose={isDeleting}
        closeButtonDisabled={isDeleting}
      >
        <div className="space-y-4">
          <p className="text-foreground">
            Are you sure you want to delete{" "}
            <strong className="text-destructive">
              "{studyToDelete?.name}"
            </strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              onClick={cancelDelete}
              variant="secondary"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              variant="destructive"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
