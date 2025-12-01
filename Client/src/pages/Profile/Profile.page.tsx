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
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Tabs, TabsList, Tab, TabContent } from "../../components/ui/Tabs";
import { ProfileInformationCard } from "./components/ProfileInformationCard";
import { StatisticsCard } from "./components/StatisticsCard";
import { ConfirmUsernameModal } from "./components/ConfirmUsernameModal";
import { useUsernameEditing } from "./hooks/useUsernameEditing";
import { usePasswordReset } from "./hooks/usePasswordReset";

export const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    isEditingUsername,
    usernameValue,
    usernameError,
    showConfirmModal,
    isSubmitting,
    handleEditUsername,
    handleCancelEdit,
    handleUsernameChange,
    handleOpenConfirmModal,
    handleConfirmUsernameChange,
    closeConfirmModal,
  } = useUsernameEditing({
    user,
    onUserUpdate: setUser,
  });

  const { isRequestingPasswordReset, handleResetPassword } = usePasswordReset();

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

  const handlePasswordReset = () => {
    if (user?.email) {
      handleResetPassword(user.email);
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
            <ProfileInformationCard
              user={user}
              isEditingUsername={isEditingUsername}
              usernameValue={usernameValue}
              usernameError={usernameError}
              isRequestingPasswordReset={isRequestingPasswordReset}
              onUsernameChange={handleUsernameChange}
              onEditUsername={handleEditUsername}
              onCancelEdit={handleCancelEdit}
              onSubmitUsername={handleOpenConfirmModal}
              onResetPassword={handlePasswordReset}
              formatDate={formatDate}
            />
          </TabContent>

          <TabContent id="statistics">
            <StatisticsCard />
          </TabContent>
        </Tabs>
      </div>

      <ConfirmUsernameModal
        isOpen={showConfirmModal}
        onClose={closeConfirmModal}
        usernameValue={usernameValue}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmUsernameChange}
      />
    </div>
  );
};
