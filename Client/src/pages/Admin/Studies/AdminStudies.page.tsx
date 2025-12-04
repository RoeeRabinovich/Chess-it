import { useMemo } from "react";
import {
  DataTable,
  DataTableColumn,
  getColumnKey,
} from "../../../components/DataTable";
import { sortData } from "../../../components/DataTable/utils";
import { Study } from "../../../types/study";
import { StudyFilters } from "./components/StudyFilters";
import { StudyModals } from "./components/StudyModals";
import { useAdminStudies } from "./hooks/useAdminStudies";
import { useStudyTableConfig } from "./hooks/useStudyTableConfig";
import { getStudyColumns } from "./components/studyColumns";

export const AdminStudies = () => {
  const {
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
  } = useAdminStudies();

  const columns = useMemo(
    () =>
      getStudyColumns({
        onEdit: (study) => {
          setSelectedStudy(study);
          setIsEditModalOpen(true);
        },
        onDelete: (study) => {
          setStudyToDelete(study);
          setIsSingleDeleteModalOpen(true);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // setState functions are stable, callbacks are recreated but that's fine
  );

  // Get selected study names for delete modal
  const selectedNames = useMemo(
    () =>
      studies
        .filter((study) => selectedStudyIds.includes(study._id))
        .map((study) => study.studyName),
    [studies, selectedStudyIds],
  );

  // Client-side sorting (server handles pagination and search)
  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return studies;
    }

    const columnIndex = columns.findIndex(
      (col: DataTableColumn<Study>, idx: number) => {
        const key = getColumnKey(col, idx);
        return key === sortState.column;
      },
    );

    if (columnIndex === -1) {
      return studies;
    }

    const column = columns[columnIndex];
    return sortData(
      studies,
      column,
      sortState.direction,
    );
  }, [studies, sortState, columns]);

  const { dataTableProps, deleteSelectedButton } = useStudyTableConfig({
    sortedData,
    columns,
    loading,
    searchQuery,
    setSearchQuery,
    sortState,
    setSortState,
    currentPage,
    totalPages,
    pageSize,
    totalStudies,
    setCurrentPage,
    setPageSize,
    selectedStudyIds,
    setSelectedStudyIds,
    setIsDeleteModalOpen,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Study Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage studies, metadata, and visibility
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-4">
          {error}
        </div>
      )}

      <StudyFilters
        categoryFilter={categoryFilter}
        visibilityFilter={visibilityFilter}
        dateFilter={dateFilter}
        dateSort={dateSort}
        onCategoryChange={setCategoryFilter}
        onVisibilityChange={setVisibilityFilter}
        onDateFilterChange={setDateFilter}
        onDateSortChange={setDateSort}
      />

      <DataTable {...(dataTableProps as Parameters<typeof DataTable>[0])}>
        {deleteSelectedButton}
      </DataTable>

      <StudyModals
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        selectedNames={selectedNames}
        isDeleting={isDeleting}
        onDeleteSelected={handleDeleteSelected}
        studyToDelete={studyToDelete}
        isSingleDeleteModalOpen={isSingleDeleteModalOpen}
        setIsSingleDeleteModalOpen={setIsSingleDeleteModalOpen}
        setStudyToDelete={setStudyToDelete}
        onSingleDelete={handleSingleDelete}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        selectedStudy={selectedStudy}
        setSelectedStudy={setSelectedStudy}
        fetchStudies={fetchStudies}
      />
    </div>
  );
};
