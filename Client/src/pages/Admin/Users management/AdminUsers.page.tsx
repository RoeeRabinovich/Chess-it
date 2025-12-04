import { useMemo } from "react";
import { DataTable, getColumnKey } from "../../../components/DataTable";
import { sortData } from "../../../components/DataTable/utils";
import { UserModals } from "./components/UserModals";
import { useAdminUsers } from "./hooks/useAdminUsers";
import { useUserTableConfig } from "./hooks/useUserTableConfig";
import { getUserColumns } from "./components/userColumns";

export const AdminUsers = () => {
  const {
    // State
    loading,
    users,
    totalUsers,
    totalPages,
    currentPage,
    pageSize,
    searchQuery,
    sortState,
    selectedUserIds,
    error,
    // Modal state
    isDeleteModalOpen,
    isDeleting,
    selectedUser,
    isUserDetailsModalOpen,
    userToDelete,
    isSingleDeleteModalOpen,
    // Computed
    adminUsers,
    nonAdminUsers,
    // Setters
    setCurrentPage,
    setPageSize,
    setSearchQuery,
    setSortState,
    setSelectedUserIds,
    setIsDeleteModalOpen,
    setSelectedUser,
    setIsUserDetailsModalOpen,
    setUserToDelete,
    setIsSingleDeleteModalOpen,
    // Actions
    fetchUsers,
    handleDeleteSelected,
    handleSingleDelete,
  } = useAdminUsers();

  const columns = useMemo(
    () =>
      getUserColumns({
        onEdit: (user) => {
          setSelectedUser(user);
          setIsUserDetailsModalOpen(true);
        },
        onDelete: (user) => {
          setUserToDelete(user);
          setIsSingleDeleteModalOpen(true);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // setState functions are stable, callbacks are recreated but that's fine
  );

  // Get selected usernames for the delete modal (only non-admin users)
  const selectedUsernames = useMemo(() => {
    return nonAdminUsers.map((user) => user.username);
  }, [nonAdminUsers]);

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
    );
  }, [users, sortState, columns]);

  const { dataTableProps, deleteSelectedButton } = useUserTableConfig({
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
  });

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

      <DataTable {...(dataTableProps as Parameters<typeof DataTable>[0])}>
        {deleteSelectedButton}
      </DataTable>

      <UserModals
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        selectedUsernames={selectedUsernames}
        adminUsernames={adminUsers.map((user) => user.username)}
        isDeleting={isDeleting}
        onDeleteSelected={handleDeleteSelected}
        userToDelete={userToDelete}
        isSingleDeleteModalOpen={isSingleDeleteModalOpen}
        setIsSingleDeleteModalOpen={setIsSingleDeleteModalOpen}
        setUserToDelete={setUserToDelete}
        onSingleDelete={handleSingleDelete}
        isUserDetailsModalOpen={isUserDetailsModalOpen}
        setIsUserDetailsModalOpen={setIsUserDetailsModalOpen}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        fetchUsers={fetchUsers}
      />
    </div>
  );
};
