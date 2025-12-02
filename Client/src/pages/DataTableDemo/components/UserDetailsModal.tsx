import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { Avatar } from "../../../components/ui/Avatar";
import { Tabs, TabsList, Tab, TabContent } from "../../../components/ui/Tabs";
import { cn } from "../../../lib/utils";

interface DemoUser {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  puzzleRating: number;
  studiesCreated: number;
  createdAt: string;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: DemoUser | null;
  onUsernameUpdate?: (userId: string, newUsername: string) => Promise<void>;
  onRoleUpdate?: (userId: string, newRole: "admin" | "user") => Promise<void>;
  onPasswordReset?: (userId: string, email: string) => Promise<void>;
}

export const UserDetailsModal = ({
  isOpen,
  onClose,
  user,
  onUsernameUpdate,
  onRoleUpdate,
  onPasswordReset,
}: UserDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<"details" | "edit">("details");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
  const [showPasswordResetConfirm, setShowPasswordResetConfirm] =
    useState(false);
  const [pendingRole, setPendingRole] = useState<"admin" | "user">("user");

  // Initialize form values when user changes
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setRole(user.role);
      setUsernameError(null);
    }
  }, [user]);

  // Reset to details tab when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("details");
    }
  }, [isOpen]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    setUsernameError(null);
  };

  const handleUsernameBlur = async () => {
    if (!user || !username.trim()) return;

    // Check if username changed
    if (username.trim() === user.username) {
      setUsernameError(null);
      return;
    }

    // Validate username length
    if (username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }

    // Check uniqueness (mock - in real app, this would be an API call)
    // For demo, we'll simulate by checking against a list
    // In production, this would be a debounced API call
    setUsernameError(null);
  };

  const handleSaveUsername = async () => {
    if (!user || !username.trim() || username.trim() === user.username) return;

    if (username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }

    setIsSavingUsername(true);
    setUsernameError(null);

    try {
      // Mock API call - in production, call onUsernameUpdate
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (onUsernameUpdate) {
        await onUsernameUpdate(user._id, username.trim());
      }

      // Success - error will be cleared
    } catch (err) {
      setUsernameError(
        err instanceof Error ? err.message : "Failed to update username",
      );
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as "admin" | "user";
    setPendingRole(newRole);
    setShowRoleConfirm(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!user) return;

    setIsSavingRole(true);
    setShowRoleConfirm(false);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (onRoleUpdate) {
        await onRoleUpdate(user._id, pendingRole);
      }

      setRole(pendingRole);
    } catch {
      // Revert on error
      setPendingRole(user.role);
      alert("Failed to update role. Please try again.");
    } finally {
      setIsSavingRole(false);
    }
  };

  const handlePasswordResetClick = () => {
    if (!user) return;
    setShowPasswordResetConfirm(true);
  };

  const handleConfirmPasswordReset = async () => {
    if (!user) return;

    setIsResettingPassword(true);
    setShowPasswordResetConfirm(false);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onPasswordReset) {
        await onPasswordReset(user._id, user.email);
      }

      alert(`Password reset email sent to ${user.email}`);
    } catch {
      alert("Failed to send password reset email. Please try again.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${user.username} - User Details`}
        titleId="user-details-modal"
        maxWidth="lg"
        preventBackdropClose={
          isSavingUsername || isSavingRole || isResettingPassword
        }
        closeButtonDisabled={
          isSavingUsername || isSavingRole || isResettingPassword
        }
      >
        <Tabs
          defaultTab="details"
          value={activeTab}
          onTabChange={(tab) => setActiveTab(tab as "details" | "edit")}
        >
          <TabsList>
            <Tab id="details">User Details</Tab>
            <Tab id="edit">Edit User</Tab>
          </TabsList>

          <TabContent id="details" className="mt-4">
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <Avatar username={user.username} size="lg" showBorder />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-foreground text-xl font-semibold">
                      {user.username}
                    </h3>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
              </div>

              {/* Profile Information */}
              <div className="border-border space-y-4 border-t pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Username
                    </label>
                    <p className="text-foreground mt-1">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Email
                    </label>
                    <p className="text-foreground mt-1">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Role
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {user.role.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Puzzle Rating
                    </label>
                    <p className="text-foreground mt-1 font-semibold">
                      {user.puzzleRating}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Studies Created
                    </label>
                    <p className="text-foreground mt-1 font-semibold">
                      {user.studiesCreated}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Join Date
                    </label>
                    <p className="text-foreground mt-1">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabContent>

          <TabContent id="edit" className="mt-4">
            <div className="space-y-6">
              {/* Edit Username */}
              <div className="border-border space-y-4 border-b pb-4">
                <h4 className="text-foreground text-lg font-semibold">
                  Edit Username
                </h4>
                <div className="space-y-3">
                  <Input
                    label="Username"
                    value={username}
                    onChange={handleUsernameChange}
                    onBlur={handleUsernameBlur}
                    error={usernameError || undefined}
                    disabled={isSavingUsername}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveUsername}
                      disabled={
                        isSavingUsername ||
                        !username.trim() ||
                        username.trim() === user.username ||
                        !!usernameError
                      }
                      size="sm"
                    >
                      {isSavingUsername ? "Saving..." : "Save Username"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Change Role */}
              <div className="border-border space-y-4 border-b pb-4">
                <h4 className="text-foreground text-lg font-semibold">
                  Change Role
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-muted-foreground mb-2 block text-sm font-medium">
                      Role
                    </label>
                    <select
                      value={role}
                      onChange={handleRoleChange}
                      disabled={isSavingRole}
                      className={cn(
                        "border-input bg-background font-minecraft flex h-10 w-full rounded-none border-2 border-solid px-3 py-2 text-sm",
                        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
                        "hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))]",
                        "focus-visible:shadow-[3px_3px_0px_0px_hsl(var(--ring))]",
                      )}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        setPendingRole(role);
                        setShowRoleConfirm(true);
                      }}
                      disabled={isSavingRole || role === user.role}
                      size="sm"
                    >
                      {isSavingRole ? "Saving..." : "Save Role"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Reset Password */}
              <div className="space-y-4">
                <h4 className="text-foreground text-lg font-semibold">
                  Reset Password
                </h4>
                <p className="text-muted-foreground text-sm">
                  Send a password reset email to {user.email}
                </p>
                <div className="flex justify-end">
                  <Button
                    onClick={handlePasswordResetClick}
                    disabled={isResettingPassword}
                    variant="outline"
                    size="sm"
                  >
                    {isResettingPassword
                      ? "Sending..."
                      : "Send Password Reset Email"}
                  </Button>
                </div>
              </div>
            </div>
          </TabContent>
        </Tabs>
      </Modal>

      {/* Role Change Confirmation Modal */}
      {showRoleConfirm && (
        <Modal
          isOpen={showRoleConfirm}
          onClose={() => {
            setShowRoleConfirm(false);
            setPendingRole(user.role);
          }}
          title="Confirm Role Change"
          titleId="role-change-confirm-modal"
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-foreground">
              Are you sure you want to change <strong>{user.username}</strong>'s
              role from <strong>{user.role.toUpperCase()}</strong> to{" "}
              <strong>{pendingRole.toUpperCase()}</strong>?
            </p>
            {pendingRole === "admin" && (
              <div className="bg-destructive/10 border-destructive rounded-lg border p-3">
                <p className="text-destructive text-sm">
                  ⚠️ Promoting a user to admin grants them full administrative
                  privileges.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setShowRoleConfirm(false);
                  setPendingRole(user.role);
                }}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmRoleChange} variant="default">
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Password Reset Confirmation Modal */}
      {showPasswordResetConfirm && (
        <Modal
          isOpen={showPasswordResetConfirm}
          onClose={() => setShowPasswordResetConfirm(false)}
          title="Send Password Reset Email"
          titleId="password-reset-confirm-modal"
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-foreground">
              Are you sure you want to send a password reset email to{" "}
              <strong>{user.email}</strong>?
            </p>
            <p className="text-muted-foreground text-sm">
              The user will receive an email with instructions to reset their
              password.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowPasswordResetConfirm(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmPasswordReset} variant="default">
                Send Email
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
