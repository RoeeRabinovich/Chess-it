import { useState, useMemo } from "react";
import {
  DataTable,
  DataTableColumn,
  SortState,
  getColumnKey,
} from "../../components/DataTable";
import { Badge } from "../../components/ui/Badge";
import { sortData, filterData } from "../../components/DataTable/utils";

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
        render: (value) => {
          const date = new Date(String(value));
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
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

  return (
    <div className="container mx-auto p-6">
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
        data={filteredAndSortedData}
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
        onRowClick={(row) => {
          console.log("Row clicked:", row);
          alert(`Clicked on user: ${row.username}`);
        }}
        emptyMessage="No users found"
      />

      <div className="text-muted-foreground mt-4 flex gap-4 text-sm">
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
      </div>
    </div>
  );
};
