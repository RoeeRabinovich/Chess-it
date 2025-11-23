import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { apiService } from "../../services/api";
import { User } from "../../types/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profileData = await apiService.getProfile();
        setUser(profileData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchProfile();
    }
  }, [authUser]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground text-lg">
              Loading profile...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-background min-h-screen pt-16 sm:pt-20 md:pt-24">
      <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-foreground text-4xl font-bold tracking-tight">
            Profile
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            View and manage your account information
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center gap-6">
                <div className="border-border bg-muted flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2">
                  {user.image?.url ? (
                    <img
                      src={user.image.url}
                      alt={user.image.alt || user.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground text-2xl font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-foreground text-2xl font-semibold">
                    {user.username}
                  </h2>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
              </div>

              {/* User Details */}
              <div className="border-border grid gap-4 border-t pt-6 md:grid-cols-2">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Username
                  </label>
                  <p className="text-foreground mt-1 text-base">
                    {user.username}
                  </p>
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

                {user.role && (
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Role
                    </label>
                    <p className="text-foreground mt-1 text-base capitalize">
                      {user.role}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Card (placeholder for future stats) */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Your activity and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground py-8 text-center text-sm">
                Statistics coming soon...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
