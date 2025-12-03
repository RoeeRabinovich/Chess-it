import { useState, useEffect, useCallback } from "react";
import { SortState } from "../../../../components/DataTable";
import { adminStudyService } from "../../../../services/adminStudyService";
import { Study } from "../../../../types/study";

export const useAdminStudies = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedStudyIds, setSelectedStudyIds] = useState<string[]>([]);
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [studies, setStudies] = useState<Study[]>([]);
  const [totalStudies, setTotalStudies] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState<Study | null>(null);
  const [isSingleDeleteModalOpen, setIsSingleDeleteModalOpen] =
    useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("All");
  const [dateSort, setDateSort] = useState<"asc" | "desc">("desc");

  // Fetch studies from API
  const fetchStudies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminStudyService.getAllStudies({
        page: currentPage,
        pageSize,
        search: searchQuery,
        category: categoryFilter,
        isPublic: visibilityFilter,
        sortBy: "createdAt",
        sortOrder: dateSort,
        dateFilter,
      });

      setStudies(response.studies);
      setTotalStudies(response.totalStudies);
      setTotalPages(response.totalPages);
    } catch (err) {
      const error = err as { message?: string };
      console.error("Error fetching studies:", err);
      setError(error?.message || "Failed to fetch studies");
      setStudies([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    searchQuery,
    categoryFilter,
    visibilityFilter,
    dateFilter,
    dateSort,
  ]);

  // Fetch studies when filters change
  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  // Handle delete selected studies
  const handleDeleteSelected = useCallback(async () => {
    if (selectedStudyIds.length === 0) {
      setIsDeleteModalOpen(false);
      return;
    }

    setIsDeleting(true);
    try {
      await Promise.all(
        selectedStudyIds.map((studyId) =>
          adminStudyService.deleteStudy(studyId),
        ),
      );

      setSelectedStudyIds([]);
      setIsDeleteModalOpen(false);
      await fetchStudies();
    } catch (error) {
      const err = error as { message?: string };
      console.error("Error deleting studies:", error);
      alert(err?.message || "Failed to delete studies. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [selectedStudyIds, fetchStudies]);

  // Handle single study delete
  const handleSingleDelete = useCallback(
    async (study: Study) => {
      setIsDeleting(true);
      try {
        await adminStudyService.deleteStudy(study._id);
        setIsSingleDeleteModalOpen(false);
        setStudyToDelete(null);
        await fetchStudies();
      } catch (error) {
        const err = error as { message?: string };
        console.error("Error deleting study:", error);
        alert(
          err?.message || "Failed to delete study. Please try again.",
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [fetchStudies],
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, visibilityFilter, dateFilter, dateSort]);

  // Adjust current page if it's out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return {
    // State
    loading,
    studies,
    totalStudies,
    totalPages,
    currentPage,
    pageSize,
    searchQuery,
    sortState,
    selectedStudyIds,
    error,
    // Filter state
    categoryFilter,
    visibilityFilter,
    dateFilter,
    dateSort,
    // Modal state
    isDeleteModalOpen,
    isDeleting,
    selectedStudy,
    isEditModalOpen,
    studyToDelete,
    isSingleDeleteModalOpen,
    // Setters
    setCurrentPage,
    setPageSize,
    setSearchQuery,
    setSortState,
    setSelectedStudyIds,
    setCategoryFilter,
    setVisibilityFilter,
    setDateFilter,
    setDateSort,
    setIsDeleteModalOpen,
    setSelectedStudy,
    setIsEditModalOpen,
    setStudyToDelete,
    setIsSingleDeleteModalOpen,
    // Actions
    fetchStudies,
    handleDeleteSelected,
    handleSingleDelete,
  };
};

