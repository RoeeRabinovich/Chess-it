import { useState, useEffect, useCallback, useMemo } from "react";
import { SortState } from "../../../../components/DataTable";
import { userService } from "../../../../services/userService";
import { User } from "../../../../types/user";

export const useAdminUsers = () => {
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
  const fetchUsers = useCallback(async () => {
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
  }, [currentPage, pageSize, searchQuery]);

  // Fetch users when page, pageSize, or search changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  // Handle delete selected users (only non-admin users)
  const handleDeleteSelected = useCallback(async () => {
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
  }, [nonAdminUsers, fetchUsers]);

  // Handle single user delete
  const handleSingleDelete = useCallback(
    async (user: User) => {
      if (user.isAdmin === true || user.role === "admin") {
        setIsSingleDeleteModalOpen(false);
        setUserToDelete(null);
        return;
      }

      setIsDeleting(true);
      try {
        await userService.deleteUser(user._id);
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
    },
    [fetchUsers],
  );

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

  return {
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
  };
};
