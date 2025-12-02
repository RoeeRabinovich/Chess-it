import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Tabs, TabsList, Tab, TabContent } from "../../../components/ui/Tabs";
import { UserDetailsTab } from "./UserDetailsTab";
import { EditUserTab } from "./EditUserTab";
import { DemoUser } from "../types";

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

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${user.username} - User Details`}
      titleId="user-details-modal"
      maxWidth="lg"
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
          <UserDetailsTab user={user} formatDate={formatDate} />
        </TabContent>

        <TabContent id="edit" className="mt-4">
          <EditUserTab
            user={user}
            onUsernameUpdate={onUsernameUpdate}
            onRoleUpdate={onRoleUpdate}
            onPasswordReset={onPasswordReset}
          />
        </TabContent>
      </Tabs>
    </Modal>
  );
};
