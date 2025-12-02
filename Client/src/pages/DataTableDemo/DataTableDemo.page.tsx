import { useState, useMemo, useEffect } from "react";
import {
  DataTable,
  DataTableColumn,
  SortState,
  getColumnKey,
} from "../../components/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/Dropdown-menu";
import { sortData, filterData } from "../../components/DataTable/utils";
import { MoreVertical, Edit, Trash, Eye } from "lucide-react";

// Mock data type for demo
interface DemoUser extends Record<string, unknown> {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  puzzleRating: number;
  createdAt: string;
}

// Mock data
const mockUsers: DemoUser[] = [
  {
    _id: "1",
    username: "chessmaster",
    email: "chessmaster@example.com",
    role: "admin",
    puzzleRating: 1850,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    _id: "2",
    username: "pawnpusher",
    email: "pawnpusher@example.com",
    role: "user",
    puzzleRating: 1200,
    createdAt: "2024-02-20T14:15:00Z",
  },
  {
    _id: "3",
    username: "knightrider",
    email: "knightrider@example.com",
    role: "user",
    puzzleRating: 1450,
    createdAt: "2024-03-10T09:00:00Z",
  },
  {
    _id: "4",
    username: "queenbee",
    email: "queenbee@example.com",
    role: "user",
    puzzleRating: 1650,
    createdAt: "2024-01-05T16:45:00Z",
  },
  {
    _id: "5",
    username: "rookstar",
    email: "rookstar@example.com",
    role: "user",
    puzzleRating: 1100,
    createdAt: "2024-04-01T11:20:00Z",
  },
];

export const DataTableDemo = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3); // Small page size for demo
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null,
  });

  // Column definitions
  const columns: DataTableColumn<DemoUser>[] = useMemo(
    () => [
      {
        header: "Username",
        accessor: "username",
        sortable: true,
      },
      {
        header: "Email",
        accessor: "email",
        sortable: true,
        visible: (breakpoint) => breakpoint !== "mobile", // Hide on mobile
      },
      {
        header: "Role",
        accessor: "role",
        render: (value) => {
          const isAdmin = value === "admin";
          return (
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {String(value).toUpperCase()}
            </Badge>
          );
        },
      },
      {
        header: "Puzzle Rating",
        accessor: "puzzleRating",
        sortable: true,
        render: (value) => (
          <span className="font-semibold">{String(value)}</span>
        ),
      },
      {
        header: "Join Date",
        accessor: "createdAt",
        sortable: true,
        visible: (breakpoint) => breakpoint !== "mobile", // Hide on mobile
        render: (value) => {
          const date = new Date(String(value));
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        },
      },
      {
        header: "Actions",
        accessor: "_id",
        cellClassName: "text-center",
        render: (_value, row) => {
          const user = row as DemoUser;
          return (
            <div className="flex items-center justify-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`View user: ${user.username}`);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Edit user: ${user.username}`);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete user ${user.username}?`)) {
                        alert(`User ${user.username} deleted`);
                      }
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [],
  );

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    // First, filter the data
    let result = filterData(mockUsers, columns, searchQuery);

    // Then, sort the filtered data
    if (sortState.column && sortState.direction) {
      // Find the column that matches the sort column
      const columnIndex = columns.findIndex((col, idx) => {
        const key = getColumnKey(col, idx);
        return key === sortState.column;
      });

      if (columnIndex !== -1) {
        const column = columns[columnIndex];
        result = sortData(
          result,
          column,
          sortState.direction,
          getColumnKey,
          columnIndex,
        );
      }
    }

    return result;
  }, [searchQuery, sortState, columns]);

  // Paginate the filtered and sorted data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, pageSize]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize) || 1;

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortState]);

  // Adjust current page if it's out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="container mx-auto mt-10 p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">DataTable Demo</h1>
        <p className="text-muted-foreground">
          This is a demo page to showcase the DataTable component
        </p>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setLoading(!loading)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 transition-colors"
        >
          {loading ? "Stop Loading" : "Show Loading State"}
        </button>
      </div>

      <DataTable
        data={paginatedData}
        columns={columns}
        rowIdKey="_id"
        loading={loading}
        hoverable={true}
        striped={true}
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: "Search users...",
          debounceMs: 100,
        }}
        sorting={{
          state: sortState,
          onSort: (column, direction) => {
            setSortState({ column, direction });
            console.log("Sort changed:", { column, direction });
          },
        }}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredAndSortedData.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setCurrentPage(1); // Reset to first page when page size changes
          },
          showPageSizeSelector: true,
        }}
        selection={{
          selectedIds: selectedUserIds,
          onSelectionChange: setSelectedUserIds,
          selectable: true,
        }}
        onRowClick={(row) => {
          console.log("Row clicked:", row);
          alert(`Clicked on user: ${row.username}`);
        }}
        emptyMessage="No users found"
      />

      <div className="text-muted-foreground mt-4 flex flex-wrap gap-4 text-sm">
        {searchQuery && (
          <div>
            Showing <strong>{filteredAndSortedData.length}</strong> of{" "}
            <strong>{mockUsers.length}</strong> users
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
        {sortState.column && (
          <div>
            Sorted by: <strong>{sortState.column}</strong> (
            {sortState.direction === "asc" ? "Ascending" : "Descending"})
          </div>
        )}
        {selectedUserIds.length > 0 && (
          <div>
            <strong>{selectedUserIds.length}</strong>{" "}
            {selectedUserIds.length === 1 ? "user" : "users"} selected
          </div>
        )}
      </div>
    </div>
  );
};
