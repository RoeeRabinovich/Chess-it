import { Badge } from "../../../components/ui/Badge";
import { Avatar } from "../../../components/ui/Avatar";
import { DemoUser } from "../types";

interface UserDetailsTabProps {
  user: DemoUser;
  formatDate: (dateString: string) => string;
}

export const UserDetailsTab = ({ user, formatDate }: UserDetailsTabProps) => {
  return (
    <div className="space-y-6">
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
                variant={user.role === "admin" ? "default" : "secondary"}
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
  );
};

