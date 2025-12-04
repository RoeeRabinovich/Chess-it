import { useState } from "react";
import { Button } from "../../../../components/ui/Button";
import { cn } from "../../../../lib/utils";
import { User } from "../../../../types/user";
import { RoleChangeConfirmModal } from "./RoleChangeConfirmModal";

interface EditRoleSectionProps {
  user: User;
  onRoleUpdate?: (userId: string, newRole: "admin" | "user") => Promise<void>;
}

export const EditRoleSection = ({
  user,
  onRoleUpdate,
}: EditRoleSectionProps) => {
  const currentRole = user.isAdmin === true ? "admin" : "user";
  const [role, setRole] = useState<"admin" | "user">(currentRole);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingRole, setPendingRole] = useState<"admin" | "user">(currentRole);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as "admin" | "user";
    setPendingRole(newRole);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    setShowConfirm(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (onRoleUpdate) {
        await onRoleUpdate(user._id, pendingRole);
      }

      setRole(pendingRole);
    } catch {
      setPendingRole(currentRole);
      alert("Failed to update role. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="border-border space-y-4 border-b pb-4">
        <h4 className="text-foreground text-lg font-semibold">Change Role</h4>
        <div className="space-y-3">
          <div>
            <label className="text-muted-foreground mb-2 block text-sm font-medium">
              Role
            </label>
            <select
              value={role}
              onChange={handleRoleChange}
              disabled={isSaving}
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
                setShowConfirm(true);
              }}
              disabled={isSaving || role === currentRole}
              size="sm"
            >
              {isSaving ? "Saving..." : "Save Role"}
            </Button>
          </div>
        </div>
      </div>

      <RoleChangeConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setPendingRole(currentRole);
        }}
        user={user}
        pendingRole={pendingRole}
        onConfirm={handleConfirm}
      />
    </>
  );
};

