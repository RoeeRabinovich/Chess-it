import { useNavigate } from "react-router-dom";
import { DataTableColumn } from "../../../../components/DataTable";
import { Button } from "../../../../components/ui/Button";
import { Trash } from "lucide-react";
import { Study } from "../../../../types/study";
import { SortState } from "../../../../components/DataTable";

interface UseStudyTableConfigProps {
  // Data
  sortedData: Study[];
  columns: DataTableColumn<Study>[];
  loading: boolean;
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Sorting
  sortState: SortState;
  setSortState: (state: SortState) => void;
  // Pagination
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalStudies: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  // Selection
  selectedStudyIds: string[];
  setSelectedStudyIds: (ids: string[]) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
}

export const useStudyTableConfig = ({
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
}: UseStudyTableConfigProps) => {
  const navigate = useNavigate();

  const dataTableProps = {
    data: sortedData as unknown as Record<string, unknown>[],
    columns: columns as unknown as DataTableColumn<Record<string, unknown>>[],
    rowIdKey: "_id" as const,
    loading,
    hoverable: true,
    striped: true,
    search: {
      value: searchQuery,
      onChange: setSearchQuery,
      placeholder: "Search by study name...",
      debounceMs: 50,
    },
    sorting: {
      state: sortState,
      onSort: (column: string, direction: "asc" | "desc" | null) => {
        setSortState({ column, direction });
      },
    },
    pagination: {
      currentPage,
      totalPages,
      pageSize,
      totalItems: totalStudies,
      onPageChange: setCurrentPage,
      onPageSizeChange: (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
      },
      showPageSizeSelector: true,
    },
    selection: {
      selectedIds: selectedStudyIds,
      onSelectionChange: setSelectedStudyIds,
      selectable: true,
    },
    onRowClick: (row: Record<string, unknown>) => {
      const study = row as unknown as Study;
      navigate(`/studies/${study._id}`);
    },
    emptyMessage: "No studies found" as const,
  };

  const deleteSelectedButton =
    selectedStudyIds.length > 0 ? (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsDeleteModalOpen(true)}
        disabled={selectedStudyIds.length === 0}
        className="ml-auto"
      >
        <Trash className="mr-2 h-4 w-4" />
        Delete Selected{" "}
        {selectedStudyIds.length > 0 && `(${selectedStudyIds.length})`}
      </Button>
    ) : null;

  return { dataTableProps, deleteSelectedButton };
};
