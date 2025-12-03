import { DataTableColumn } from "../../../../components/DataTable";
import { Button } from "../../../../components/ui/Button";
import { Trash } from "lucide-react";
import { User } from "../../../../types/user";
import { SortState } from "../../../../components/DataTable";

interface UseUserTableConfigProps {
  // Data
  sortedData: User[];
  columns: DataTableColumn<User>[];
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
  totalUsers: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  // Selection
  selectedUserIds: string[];
  setSelectedUserIds: (ids: string[]) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
}

export const useUserTableConfig = ({
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
  totalUsers,
  setCurrentPage,
  setPageSize,
  selectedUserIds,
  setSelectedUserIds,
  setIsDeleteModalOpen,
}: UseUserTableConfigProps) => {
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
      placeholder: "Search users...",
      debounceMs: 500,
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
      totalItems: totalUsers,
      onPageChange: setCurrentPage,
      onPageSizeChange: (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
      },
      showPageSizeSelector: true,
    },
    selection: {
      selectedIds: selectedUserIds,
      onSelectionChange: setSelectedUserIds,
      selectable: true,
    },
    emptyMessage: "No users found" as const,
  };

  const deleteSelectedButton =
    selectedUserIds.length > 0 ? (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsDeleteModalOpen(true)}
        disabled={selectedUserIds.length === 0}
        className="ml-auto"
      >
        <Trash className="mr-2 h-4 w-4" />
        Delete Selected{" "}
        {selectedUserIds.length > 0 && `(${selectedUserIds.length})`}
      </Button>
    ) : null;

  return { dataTableProps, deleteSelectedButton };
};
