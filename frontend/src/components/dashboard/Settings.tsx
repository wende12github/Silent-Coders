import { useAuthStore } from "../../store/authStore";
import Tabs, { TabItem } from "../ui/Tabs";

import ProfileSettingsForm from "../setting/ProfileSettingsForm";
import NotificationSettings from "../setting/NotificationSetting";
import PrivacySettings from "../setting/PrivacySettings";
import PasswordSettingsForm from "../setting/PasswordSettingsForm";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();

  if (user === null) {
    return (
      <div className="p-6 w-full mx-auto text-center">Loading user data...</div>
    );
  }

  const settingsTabs: TabItem[] = [
    {
      value: "profile",
      label: "Profile",
      content: <ProfileSettingsForm user={user} setUser={setUser} />,
    },
    {
      value: "notifications",
      label: "Notifications",
      content: <NotificationSettings />,
    },
    {
      value: "privacy",
      label: "Privacy",
      content: <PrivacySettings />,
    },
    {
      value: "password",
      label: "Password",
      content: <PasswordSettingsForm />,
    },
  ];

  return (
    <div
      className="p-6 w-full mx-auto space-y-8 rounded-lg shadow-md
                bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-foreground-dark">
          Settings
        </h1>
        <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
          Manage your account settings and preferences
        </p>
      </div>
      <Tabs
        defaultValue="profile"
        items={settingsTabs}
        tabsListClassName="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-6"
      />
    </div>
  );
}
