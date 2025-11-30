import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { EmptyState } from "../../components/ui/EmptyState";
import { Book } from "../../components/icons/Book.icon";
import { Tabs, TabsList, Tab } from "../../components/ui/Tabs";
import { EditStudyModal } from "./components/EditStudyModal";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [studyToEdit, setStudyToEdit] = useState<
    (PublicStudy & { isPublic?: boolean }) | null
  >(null);
  const [activeTab, setActiveTab] = useState<"all" | "public" | "private">(
    "all",
  );
  const { toast } = useToast();
  const navigate = useNavigate();

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

  // Filter studies based on tab (public/private) and search query
  const filteredStudies = useMemo(() => {
    let result = studies;

    // Filter by tab (public/private)
    // Note: getUserStudies returns studies with isPublic field, but PublicStudy type doesn't include it
    if (activeTab === "public") {
      result = result.filter(
        (study) =>
          (study as PublicStudy & { isPublic?: boolean }).isPublic === true,
      );
    } else if (activeTab === "private") {
      result = result.filter(
        (study) =>
          (study as PublicStudy & { isPublic?: boolean }).isPublic === false,
      );
    }
    // "all" tab shows all studies, no filtering needed

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (study) =>
          study.studyName.toLowerCase().includes(query) ||
          study.description.toLowerCase().includes(query) ||
          study.category.toLowerCase().includes(query),
      );
    }

    return result;
  }, [studies, activeTab, searchQuery]);

  // Calculate pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudies.length / ITEMS_PER_PAGE),
  );
  const paginatedStudies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredStudies.slice(startIndex, endIndex);
  }, [filteredStudies, currentPage]);

  // Reset to page 1 when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const handleDelete = (studyId: string) => {
    // Find the study to get its name for confirmation
    const study = studies.find((s) => s._id === studyId);
    const studyName = study?.studyName || "this study";

    // Set the study to delete and show modal
    setStudyToDelete({ id: studyId, name: studyName });
    setShowDeleteModal(true);
  };

  const handleEdit = (studyId: string) => {
    // Find the study to edit
    const study = studies.find((s) => s._id === studyId);
    if (study) {
      setStudyToEdit(study as PublicStudy & { isPublic?: boolean });
      setShowEditModal(true);
    }
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setStudyToEdit(null);
  };

  const handleEditUpdate = () => {
    // Refresh the studies list after update
    fetchStudies();
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
          <EmptyState
            variant="error"
            title="Error loading studies"
            description={error}
            action={
              <Button onClick={fetchStudies} variant="outline">
                Try Again
              </Button>
            }
          />
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
          {studies.length > 0 && (
            <p className="text-muted-foreground text-sm">
              You have {studies.length}{" "}
              {studies.length === 1 ? "study" : "studies"}.
            </p>
          )}
        </div>

        {/* Tabs */}
        {studies.length > 0 && (
          <Tabs
            value={activeTab}
            onTabChange={(tabId) =>
              setActiveTab(tabId as "all" | "public" | "private")
            }
          >
            <TabsList>
              <Tab id="all">All Studies</Tab>
              <Tab id="public">Public</Tab>
              <Tab id="private">Private</Tab>
            </TabsList>
          </Tabs>
        )}

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
          <EmptyState
            variant="empty"
            icon={<Book className="text-muted-foreground h-12 w-12" />}
            title="No studies yet"
            description="Create your first study to get started!"
            action={
              <Button onClick={() => navigate("/create-study")}>
                Create Study
              </Button>
            }
          />
        ) : filteredStudies.length === 0 ? (
          <EmptyState
            variant="search"
            title="No results found"
            description={
              activeTab === "all"
                ? "No studies match your search. Try a different query."
                : activeTab === "public"
                  ? "You don't have any public studies matching your search."
                  : "You don't have any private studies matching your search."
            }
            action={
              <Button onClick={() => setSearchQuery("")} variant="outline">
                Clear Search
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {paginatedStudies.map((study) => (
                <StudyCard
                  key={study._id}
                  study={study}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
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

      {/* Edit Study Modal */}
      {studyToEdit && (
        <EditStudyModal
          isOpen={showEditModal}
          onClose={handleEditClose}
          study={studyToEdit}
          onUpdate={handleEditUpdate}
        />
      )}
    </div>
  );
};
