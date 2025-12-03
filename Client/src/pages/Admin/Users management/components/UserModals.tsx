import { userService } from "../../../../services/userService";
import { User } from "../../../../types/user";
import { DeleteSelectedModal } from "./DeleteSelectedModal";
import { UserDetailsModal } from "./UserDetailsModal";

interface UserModalsProps {
  // Bulk delete modal
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;
  selectedUsernames: string[];
  adminUsernames: string[];
  isDeleting: boolean;
  onDeleteSelected: () => Promise<void>;
  // Single delete modal
  userToDelete: User | null;
  isSingleDeleteModalOpen: boolean;
  setIsSingleDeleteModalOpen: (open: boolean) => void;
  setUserToDelete: (user: User | null) => void;
  onSingleDelete: (user: User) => Promise<void>;
  // User details modal
  isUserDetailsModalOpen: boolean;
  setIsUserDetailsModalOpen: (open: boolean) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  fetchUsers: () => Promise<void>;
}

export const UserModals = ({
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  selectedUsernames,
  adminUsernames,
  isDeleting,
  onDeleteSelected,
  userToDelete,
  isSingleDeleteModalOpen,
  setIsSingleDeleteModalOpen,
  setUserToDelete,
  onSingleDelete,
  isUserDetailsModalOpen,
  setIsUserDetailsModalOpen,
  selectedUser,
  setSelectedUser,
  fetchUsers,
}: UserModalsProps) => {
  return (
    <>
      {/* Bulk Delete Modal */}
      <DeleteSelectedModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        usernames={selectedUsernames}
        adminUsernames={adminUsernames}
        isDeleting={isDeleting}
        onConfirm={onDeleteSelected}
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
          onConfirm={() => onSingleDelete(userToDelete)}
        />
      )}

      {/* User Details Modal */}
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
    </>
  );
};
