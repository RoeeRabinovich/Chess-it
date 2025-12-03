import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataTable,
  DataTableColumn,
  SortState,
  getColumnKey,
} from "../../../components/DataTable";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/Dropdown-menu";
import { sortData } from "../../../components/DataTable/utils";
import { MoreVertical, Edit, Trash } from "lucide-react";
import { adminStudyService } from "../../../services/adminStudyService";
import { Study } from "../../../types/study";
import { DeleteSelectedStudiesModal } from "./components/DeleteSelectedStudiesModal";
import { EditStudyMetadataModal } from "./components/EditStudyMetadataModal";

export const AdminStudies = () => {
  const navigate = useNavigate();
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
  const [isSingleDeleteModalOpen, setIsSingleDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("All");
  const [dateSort, setDateSort] = useState<"asc" | "desc">("desc");

  // Fetch studies from API
  const fetchStudies = async () => {
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
  };

  // Fetch studies when filters change
  useEffect(() => {
    fetchStudies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    pageSize,
    searchQuery,
    categoryFilter,
    visibilityFilter,
    dateFilter,
    dateSort,
  ]);

  // Column definitions
  const columns: DataTableColumn<Study>[] = useMemo(
    () => [
      {
        header: "Study Name",
        accessor: "studyName",
        sortable: true,
      },
      {
        header: "Category",
        accessor: "category",
        sortable: true,
        render: (value) => <Badge variant="secondary">{String(value)}</Badge>,
      },
      {
        header: "Creator",
        accessor: "createdBy",
        visible: (breakpoint) => breakpoint !== "mobile",
        render: (value) => {
          const creator = value as { username: string } | null;
          return creator ? (
            <span className="font-medium">{creator.username}</span>
          ) : (
            <span className="text-muted-foreground">Unknown</span>
          );
        },
      },
      {
        header: "Visibility",
        accessor: "isPublic",
        render: (value) => {
          const isPublic = value === true;
          return (
            <Badge variant={isPublic ? "default" : "secondary"}>
              {isPublic ? "Public" : "Private"}
            </Badge>
          );
        },
      },
      {
        header: "Likes",
        accessor: "likes",
        sortable: true,
        render: (value) => (
          <span className="font-semibold">{String(value)}</span>
        ),
      },
      {
        header: "Created Date",
        accessor: "createdAt",
        sortable: true,
        visible: (breakpoint) => breakpoint !== "mobile",
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
          const study = row as Study;
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
                  className="bg-secondary"
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudy(study);
                      setIsEditModalOpen(true);
                    }}
                    className="hover:bg-accent cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setStudyToDelete(study);
                      setIsSingleDeleteModalOpen(true);
                    }}
                    className="text-destructive focus:text-destructive hover:bg-pastel-red/20 focus:bg-destructive/10 cursor-pointer"
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

  // Get selected study names for delete modal
  const selectedStudyNames = useMemo(() => {
    return studies
      .filter((study) => selectedStudyIds.includes(study._id))
      .map((study) => study.studyName);
  }, [selectedStudyIds, studies]);

  // Handle delete selected studies
  const handleDeleteSelected = async () => {
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
  };

  // Client-side sorting (server handles pagination and search)
  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return studies;
    }

    const columnIndex = columns.findIndex((col, idx) => {
      const key = getColumnKey(col, idx);
      return key === sortState.column;
    });

    if (columnIndex === -1) {
      return studies;
    }

    const column = columns[columnIndex];
    return sortData(
      studies,
      column,
      sortState.direction,
      getColumnKey,
      columnIndex,
    );
  }, [studies, sortState, columns]);

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

      {/* Filters */}
      <div className="bg-card flex flex-wrap gap-4 rounded-lg border p-4">
        <div className="min-w-[200px] flex-1">
          <label className="text-muted-foreground mb-2 block text-sm font-medium">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border-input bg-background font-minecraft focus-visible:ring-ring h-10 w-full rounded-none border-2 border-solid px-3 py-2 text-sm shadow-[2px_2px_0px_0px_hsl(var(--foreground))] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value="All">All</option>
            <option value="Opening">Opening</option>
            <option value="Endgame">Endgame</option>
            <option value="Strategy">Strategy</option>
            <option value="Tactics">Tactics</option>
          </select>
        </div>

        <div className="min-w-[200px] flex-1">
          <label className="text-muted-foreground mb-2 block text-sm font-medium">
            Visibility
          </label>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="border-input bg-background font-minecraft focus-visible:ring-ring h-10 w-full rounded-none border-2 border-solid px-3 py-2 text-sm shadow-[2px_2px_0px_0px_hsl(var(--foreground))] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value="All">All</option>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>

        <div className="min-w-[200px] flex-1">
          <label className="text-muted-foreground mb-2 block text-sm font-medium">
            Date Filter
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border-input bg-background font-minecraft focus-visible:ring-ring h-10 w-full rounded-none border-2 border-solid px-3 py-2 text-sm shadow-[2px_2px_0px_0px_hsl(var(--foreground))] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value="All">All</option>
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
            <option value="Last year">Last year</option>
          </select>
        </div>

        <div className="min-w-[200px] flex-1">
          <label className="text-muted-foreground mb-2 block text-sm font-medium">
            Date Sort
          </label>
          <select
            value={dateSort}
            onChange={(e) => setDateSort(e.target.value as "asc" | "desc")}
            className="border-input bg-background font-minecraft focus-visible:ring-ring h-10 w-full rounded-none border-2 border-solid px-3 py-2 text-sm shadow-[2px_2px_0px_0px_hsl(var(--foreground))] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      <DataTable
        data={sortedData as unknown as Record<string, unknown>[]}
        columns={
          columns as unknown as DataTableColumn<Record<string, unknown>>[]
        }
        rowIdKey="_id"
        loading={loading}
        hoverable={true}
        striped={true}
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: "Search by study name...",
          debounceMs: 500,
        }}
        sorting={{
          state: sortState,
          onSort: (column, direction) => {
            setSortState({ column, direction });
          },
        }}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: totalStudies,
          onPageChange: setCurrentPage,
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          },
          showPageSizeSelector: true,
        }}
        selection={{
          selectedIds: selectedStudyIds,
          onSelectionChange: setSelectedStudyIds,
          selectable: true,
        }}
        onRowClick={(row) => {
          const study = row as unknown as Study;
          navigate(`/studies/${study._id}`);
        }}
        emptyMessage="No studies found"
      >
        {selectedStudyIds.length > 0 && (
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
        )}
      </DataTable>

      {/* Bulk Delete Modal */}
      <DeleteSelectedStudiesModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        studyNames={selectedStudyNames}
        isDeleting={isDeleting}
        onConfirm={handleDeleteSelected}
      />

      {/* Single Study Delete Modal */}
      {studyToDelete && (
        <DeleteSelectedStudiesModal
          isOpen={isSingleDeleteModalOpen}
          onClose={() => {
            setIsSingleDeleteModalOpen(false);
            setStudyToDelete(null);
          }}
          studyNames={[studyToDelete.studyName]}
          isDeleting={isDeleting}
          onConfirm={async () => {
            setIsDeleting(true);
            try {
              await adminStudyService.deleteStudy(studyToDelete._id);
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
          }}
        />
      )}

      {/* Edit Metadata Modal */}
      <EditStudyMetadataModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudy(null);
        }}
        study={selectedStudy}
        onSave={async (studyId, data) => {
          try {
            await adminStudyService.updateStudyMetadata(studyId, data);
            await fetchStudies();
          } catch (error) {
            const err = error as { message?: string };
            throw new Error(err?.message || "Failed to update study");
          }
        }}
      />
    </div>
  );
};
