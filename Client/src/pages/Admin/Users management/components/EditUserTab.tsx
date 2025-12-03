import { User } from "../../../../types/user";
import { EditUsernameSection } from "./EditUsernameSection";
import { EditRoleSection } from "./EditRoleSection";
import { ResetPasswordSection } from "./ResetPasswordSection";

interface EditUserTabProps {
  user: User;
  onUsernameUpdate?: (userId: string, newUsername: string) => Promise<void>;
  onRoleUpdate?: (userId: string, newRole: "admin" | "user") => Promise<void>;
  onPasswordReset?: (userId: string) => Promise<void>;
}

export const EditUserTab = ({
  user,
  onUsernameUpdate,
  onRoleUpdate,
  onPasswordReset,
}: EditUserTabProps) => {
  return (
    <div className="space-y-6">
      <EditUsernameSection user={user} onUsernameUpdate={onUsernameUpdate} />
      <EditRoleSection user={user} onRoleUpdate={onRoleUpdate} />
      <ResetPasswordSection user={user} onPasswordReset={onPasswordReset} />
    </div>
  );
};

