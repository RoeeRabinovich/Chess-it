import { useState, useMemo, useEffect } from "react";
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
import { UserDetailsModal } from "../../DataTableDemo/components/UserDetailsModal";
import { DeleteSelectedModal } from "../../DataTableDemo/components/DeleteSelectedModal";
import { userService } from "../../../services/userService";
import { User } from "../../../types/user";

export const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSingleDeleteModalOpen, setIsSingleDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAllUsers({
        page: currentPage,
        pageSize,
        search: searchQuery,
      });

      // Use User[] directly from API response
      const transformedUsers: User[] = response.users.map((user: User) => ({
        ...user,
        puzzleRating: user.puzzleRating ?? 0,
        studiesCreated: user.studiesCreated ?? 0,
      }));

      setUsers(transformedUsers);
      setTotalUsers(response.totalUsers);
      setTotalPages(response.totalPages);
    } catch (err) {
      const error = err as { message?: string };
      console.error("Error fetching users:", err);
      setError(error?.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users when page, pageSize, or search changes
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchQuery]);

  // Column definitions
  const columns: DataTableColumn<User>[] = useMemo(
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
        visible: (breakpoint) => breakpoint !== "mobile",
      },
      {
        header: "Role",
        accessor: "role",
        render: (value, row) => {
          const user = row as User;
          const isAdmin = value === "admin" || user.isAdmin === true;
          return (
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {isAdmin ? "ADMIN" : "USER"}
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
        header: "Studies Created",
        accessor: "studiesCreated",
        sortable: true,
        visible: (breakpoint) => breakpoint !== "mobile",
        render: (value) => <span className="font-medium">{String(value)}</span>,
      },
      {
        header: "Join Date",
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
          const user = row as User;
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
                      setSelectedUser(user);
                      setIsUserDetailsModalOpen(true);
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
                      setUserToDelete(user);
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

  // Get selected users and separate admin from non-admin
  const { adminUsers, nonAdminUsers } = useMemo(() => {
    const selected = users.filter((user) => selectedUserIds.includes(user._id));
    const admins = selected.filter(
      (user) => user.isAdmin === true || user.role === "admin",
    );
    const nonAdmins = selected.filter(
      (user) => !user.isAdmin && user.role !== "admin",
    );
    return {
      adminUsers: admins,
      nonAdminUsers: nonAdmins,
    };
  }, [selectedUserIds, users]);

  // Get selected usernames for the delete modal (only non-admin users)
  const selectedUsernames = useMemo(() => {
    return nonAdminUsers.map((user) => user.username);
  }, [nonAdminUsers]);

  // Handle delete selected users (only non-admin users)
  const handleDeleteSelected = async () => {
    const nonAdminUserIds = nonAdminUsers.map((user) => user._id);

    if (nonAdminUserIds.length === 0) {
      setIsDeleteModalOpen(false);
      return;
    }

    setIsDeleting(true);
    try {
      await Promise.all(
        nonAdminUserIds.map((userId) => userService.deleteUser(userId)),
      );

      setSelectedUserIds([]);
      setIsDeleteModalOpen(false);
      await fetchUsers();
    } catch (error) {
      const err = error as { message?: string };
      console.error("Error deleting users:", error);
      alert(err?.message || "Failed to delete users. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side sorting (server handles pagination and search)
  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return users;
    }

    const columnIndex = columns.findIndex((col, idx) => {
      const key = getColumnKey(col, idx);
      return key === sortState.column;
    });

    if (columnIndex === -1) {
      return users;
    }

    const column = columns[columnIndex];
    return sortData(
      users,
      column,
      sortState.direction,
      getColumnKey,
      columnIndex,
    );
  }, [users, sortState, columns]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Adjust current page if it's out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, roles, and permissions
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-4">
          {error}
        </div>
      )}

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
          placeholder: "Search users...",
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
          totalItems: totalUsers,
          onPageChange: setCurrentPage,
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          },
          showPageSizeSelector: true,
        }}
        selection={{
          selectedIds: selectedUserIds,
          onSelectionChange: setSelectedUserIds,
          selectable: true,
        }}
        emptyMessage="No users found"
      >
        {selectedUserIds.length > 0 && (
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
        )}
      </DataTable>

      {/* Bulk Delete Modal */}
      <DeleteSelectedModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        usernames={selectedUsernames}
        adminUsernames={adminUsers.map((user) => user.username)}
        isDeleting={isDeleting}
        onConfirm={handleDeleteSelected}
      />

      {/* Single User Delete Modal */}
      {userToDelete && (
        <DeleteSelectedModal
          isOpen={isSingleDeleteModalOpen}
          onClose={() => {
            setIsSingleDeleteModalOpen(false);
            setUserToDelete(null);
          }}
          usernames={
            userToDelete.isAdmin === true || userToDelete.role === "admin"
              ? []
              : [userToDelete.username]
          }
          adminUsernames={
            userToDelete.isAdmin === true || userToDelete.role === "admin"
              ? [userToDelete.username]
              : []
          }
          isDeleting={isDeleting}
          onConfirm={async () => {
            if (
              userToDelete.isAdmin === true ||
              userToDelete.role === "admin"
            ) {
              setIsSingleDeleteModalOpen(false);
              setUserToDelete(null);
              return;
            }

            setIsDeleting(true);
            try {
              await userService.deleteUser(userToDelete._id);
              setIsSingleDeleteModalOpen(false);
              setUserToDelete(null);
              await fetchUsers();
            } catch (error) {
              const err = error as { message?: string };
              console.error("Error deleting user:", error);
              alert(err?.message || "Failed to delete user. Please try again.");
            } finally {
              setIsDeleting(false);
            }
          }}
        />
      )}

      <UserDetailsModal
        isOpen={isUserDetailsModalOpen}
        onClose={() => {
          setIsUserDetailsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUsernameUpdate={async (userId, newUsername) => {
          try {
            await userService.adminUpdateUsername(userId, newUsername);
            await fetchUsers();
          } catch (error) {
            const err = error as { message?: string };
            throw new Error(err?.message || "Failed to update username");
          }
        }}
        onRoleUpdate={async (userId, newRole) => {
          try {
            await userService.updateUserRole(userId, newRole === "admin");
            await fetchUsers();
          } catch (error) {
            const err = error as { message?: string };
            throw new Error(err?.message || "Failed to update role");
          }
        }}
        onPasswordReset={async (userId) => {
          try {
            await userService.adminResetPassword(userId);
          } catch (error) {
            const err = error as { message?: string };
            throw new Error(
              err?.message || "Failed to send password reset email",
            );
          }
        }}
      />
    </div>
  );
};
