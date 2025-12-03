import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { User } from "../../../types/user";

interface EditUsernameSectionProps {
  user: User;
  onUsernameUpdate?: (userId: string, newUsername: string) => Promise<void>;
}

export const EditUsernameSection = ({
  user,
  onUsernameUpdate,
}: EditUsernameSectionProps) => {
  const [username, setUsername] = useState(user.username);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    setUsernameError(null);
  };

  const handleUsernameBlur = async () => {
    if (!username.trim()) return;

    if (username.trim() === user.username) {
      setUsernameError(null);
      return;
    }

    if (username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }

    setUsernameError(null);
  };

  const handleSave = async () => {
    if (!username.trim() || username.trim() === user.username) return;

    if (username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }

    setIsSaving(true);
    setUsernameError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (onUsernameUpdate) {
        await onUsernameUpdate(user._id, username.trim());
      }
    } catch (err) {
      setUsernameError(
        err instanceof Error ? err.message : "Failed to update username",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border-border space-y-4 border-b pb-4">
      <h4 className="text-foreground text-lg font-semibold">Edit Username</h4>
      <div className="space-y-3">
        <Input
          label="Username"
          value={username}
          onChange={handleUsernameChange}
          onBlur={handleUsernameBlur}
          error={usernameError || undefined}
          disabled={isSaving}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={
              isSaving ||
              !username.trim() ||
              username.trim() === user.username ||
              !!usernameError
            }
            size="sm"
          >
            {isSaving ? "Saving..." : "Save Username"}
          </Button>
        </div>
      </div>
    </div>
  );
};
