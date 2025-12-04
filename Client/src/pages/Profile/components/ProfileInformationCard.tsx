import { User } from "../../../types/user";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { FormField } from "../../../components/ui/FormField";
import { Avatar } from "../../../components/ui/Avatar";
import { Badge } from "../../../components/ui/Badge";
import { Tooltip } from "../../../components/ui/Tooltip";
import { Edit } from "../../../components/icons/Edit.icon";
import { Loading } from "../../../components/icons/Loading.icon";

interface ProfileInformationCardProps {
  user: User;
  isEditingUsername: boolean;
  usernameValue: string;
  usernameError: string | null;
  isRequestingPasswordReset: boolean;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditUsername: () => void;
  onCancelEdit: () => void;
  onSubmitUsername: () => void;
  onResetPassword: () => void;
  formatDate: (dateString: string) => string;
}

export const ProfileInformationCard = ({
  user,
  isEditingUsername,
  usernameValue,
  usernameError,
  isRequestingPasswordReset,
  onUsernameChange,
  onEditUsername,
  onCancelEdit,
  onSubmitUsername,
  onResetPassword,
  formatDate,
}: ProfileInformationCardProps) => {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar username={user.username} size="xl" showBorder />
          <div>
            <h2 className="text-foreground text-2xl font-semibold">
              {user.username}
            </h2>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </div>

        <div className="border-border grid gap-4 border-t pt-6 md:grid-cols-2">
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Username
            </label>
            {isEditingUsername ? (
              <div className="mt-1 flex items-start gap-2">
                <div className="flex-1">
                  <FormField label="" error={usernameError || undefined}>
                    <Input
                      value={usernameValue}
                      onChange={onUsernameChange}
                      className="w-full"
                      autoFocus
                    />
                  </FormField>
                </div>
                <Button
                  onClick={onSubmitUsername}
                  disabled={!!usernameError || usernameValue === user.username}
                  size="sm"
                  className="bg-pastel-mint text-foreground hover:bg-pastel-mint/80 mt-0 dark:!text-[#1A1A1A]"
                >
                  Submit
                </Button>
                <Button
                  onClick={onCancelEdit}
                  variant="secondary"
                  size="sm"
                  className="mt-0"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="group relative mt-1 flex items-center gap-2">
                <p className="text-foreground text-base">{user.username}</p>
                <Tooltip content="Click to edit your username" side="top">
                  <button
                    onClick={onEditUsername}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Edit username"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>

          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Email
            </label>
            <p className="text-foreground mt-1 text-base">{user.email}</p>
          </div>

          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Member Since
            </label>
            <p className="text-foreground mt-1 text-base">
              {formatDate(user.createdAt)}
            </p>
          </div>

          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Puzzle Rating
            </label>
            <p className="text-foreground mt-1 text-base">
              {user.puzzleRating ?? "Not set"}
            </p>
          </div>

          {user.isAdmin !== undefined && (
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Role
              </label>
              <div className="mt-1">
                <Badge
                  variant={user.isAdmin === true ? "destructive" : "secondary"}
                  size="sm"
                >
                  {user.isAdmin === true ? "Admin" : "User"}
                </Badge>
              </div>
            </div>
          )}
        </div>

        <div className="border-border border-t pt-4">
          <Button
            onClick={onResetPassword}
            disabled={isRequestingPasswordReset}
            variant="outline"
          >
            {isRequestingPasswordReset ? (
              <>
                <Loading className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

