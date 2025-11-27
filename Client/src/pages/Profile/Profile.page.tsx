import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAppDispatch } from "../../store/hooks";
import { login as loginAction } from "../../store/authSlice";
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
import { Input } from "../../components/ui/Input";
import { FormField } from "../../components/ui/FormField";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Edit } from "../../components/icons/Edit.icon";
import { Loading } from "../../components/icons/Loading.icon";
import { Modal } from "../../components/ui/Modal";
import { Avatar } from "../../components/ui/Avatar";
import { Tabs, TabsList, Tab, TabContent } from "../../components/ui/Tabs";
import { Badge } from "../../components/ui/Badge";
import { useToast } from "../../hooks/useToast";
import Joi from "joi";

const usernameSchema = Joi.string().min(3).max(30).required().messages({
  "string.empty": "Username is required.",
  "string.min": "Username must be at least 3 characters.",
  "string.max": "Username must be at most 30 characters.",
});

export const Profile = () => {
  const { user: authUser } = useAuth();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameValue, setUsernameValue] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingPasswordReset, setIsRequestingPasswordReset] =
    useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profileData = await apiService.getProfile();
        setUser(profileData);
        setUsernameValue(profileData.username);
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

  useEffect(() => {
    if (user) {
      setUsernameValue(user.username);
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditUsername = () => {
    if (user) {
      setUsernameValue(user.username);
      setIsEditingUsername(true);
      setUsernameError(null);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setUsernameValue(user.username);
      setIsEditingUsername(false);
      setUsernameError(null);
    }
  };

  const validateUsername = (value: string): string | null => {
    const { error } = usernameSchema.validate(value);
    if (error) {
      return error.details[0].message;
    }
    if (value === user?.username) {
      return "Username is the same as current";
    }
    return null;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsernameValue(value);
    if (value !== user?.username) {
      const error = validateUsername(value);
      setUsernameError(error);
    } else {
      setUsernameError(null);
    }
  };

  const handleOpenConfirmModal = () => {
    const error = validateUsername(usernameValue);
    if (error) {
      setUsernameError(error);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmUsernameChange = async () => {
    if (!user || !usernameValue) return;

    setIsSubmitting(true);
    try {
      const updatedUser = await apiService.updateUsername(usernameValue);
      setUser(updatedUser);
      setIsEditingUsername(false);
      setShowConfirmModal(false);
      setUsernameError(null);
      // Update auth state and localStorage with new username
      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch(loginAction(updatedUser));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update username";
      setUsernameError(errorMessage);
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;

    setIsRequestingPasswordReset(true);
    try {
      await apiService.forgotPassword(user.email);
      toast({
        title: "Reset link sent",
        description:
          "A password reset link has been sent to your email address.",
        variant: "success",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send reset email. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRequestingPasswordReset(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="large" text="Loading profile..." />
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
        <Tabs defaultTab="profile">
          <TabsList>
            <Tab id="profile">Profile</Tab>
            <Tab id="statistics">Statistics</Tab>
          </TabsList>

          <TabContent id="profile">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Avatar */}
                <div className="flex items-center gap-6">
                  <Avatar username={user.username} size="xl" showBorder />
                  <div>
                    <h2 className="text-foreground text-2xl font-semibold">
                      {user.username}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* User Details */}
                <div className="border-border grid gap-4 border-t pt-6 md:grid-cols-2">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Username
                    </label>
                    {isEditingUsername ? (
                      <div className="mt-1 flex items-start gap-2">
                        <div className="flex-1">
                          <FormField
                            label=""
                            error={usernameError || undefined}
                          >
                            <Input
                              value={usernameValue}
                              onChange={handleUsernameChange}
                              className="w-full"
                              autoFocus
                            />
                          </FormField>
                        </div>
                        <Button
                          onClick={handleOpenConfirmModal}
                          disabled={
                            !!usernameError || usernameValue === user.username
                          }
                          size="sm"
                          className="bg-pastel-mint text-foreground hover:bg-pastel-mint/80 mt-0 dark:!text-[#1A1A1A]"
                        >
                          Submit
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="secondary"
                          size="sm"
                          className="mt-0"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="group relative mt-1 flex items-center gap-2">
                        <p className="text-foreground text-base">
                          {user.username}
                        </p>
                        <button
                          onClick={handleEditUsername}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Edit username"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Email
                    </label>
                    <p className="text-foreground mt-1 text-base">
                      {user.email}
                    </p>
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
                      <div className="mt-1">
                        <Badge
                          variant={
                            user.role === "admin" ? "destructive" : "secondary"
                          }
                          size="sm"
                        >
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reset Password Button */}
                <div className="border-border border-t pt-4">
                  <Button
                    onClick={handleResetPassword}
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
          </TabContent>

          <TabContent id="statistics">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>
                  Your activity and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground py-8 text-center text-sm">
                  Statistics coming soon...
                </div>
              </CardContent>
            </Card>
          </TabContent>
        </Tabs>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Username Change"
        titleId="confirm-username-modal"
        maxWidth="md"
        preventBackdropClose={isSubmitting}
        closeButtonDisabled={isSubmitting}
      >
        <div className="space-y-4">
          <p className="text-foreground">
            Are you sure you want to change your username to:{" "}
            <strong className="text-pastel-mint">"{usernameValue}"</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setShowConfirmModal(false)}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUsernameChange}
              disabled={isSubmitting}
              className="bg-pastel-mint text-foreground hover:bg-pastel-mint/80 dark:!text-[#1A1A1A]"
            >
              {isSubmitting ? "Changing..." : "Change Username"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
