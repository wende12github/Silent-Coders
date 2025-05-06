import React, { useState, useEffect } from "react";
import { User as UserIcon, Mail, Shield, Lock } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";
import Switch from "../ui/Switch";
import Tabs, { TabItem } from "../ui/Tabs";
import { Input, Label, Textarea } from "../ui/Form";
import { updateCurrentUser } from "../../services/user";
import { User } from "../../store/types";
import { ImageUpload } from "../ImageUpload";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    profile_picture: user?.profile_picture || null,
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    sessionReminders: true,
    newRequests: true,
    completedSessions: true,
    marketingEmails: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showSkills: true,
    showTimeWallet: false,
    allowMessages: true,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        profile_picture: user.profile_picture || null,
      });
    }
  }, [user]);

  const handleProfileInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setProfileError(null);
    setProfileSuccess(null);
  };

  const handleProfilePictureChange = (url: string | null) => {
    setProfileForm((prev) => ({
      ...prev,
      profile_picture: url,
    }));
    setProfileError(null);
    setProfileSuccess(null);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileForm.first_name.trim()) {
      setProfileError("First Name is required.");
      return;
    }
    if (!profileForm.last_name.trim()) {
      setProfileError("Last Name is required.");
      return;
    }
    if (!profileForm.username.trim()) {
      setProfileError("Username is required.");
      return;
    }

    setIsUpdatingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const profileDataToUpdate: Partial<User> = {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        username: profileForm.username,
        bio: profileForm.bio,
        profile_picture: profileForm.profile_picture,
      };

      const updatedUser = await updateCurrentUser(profileDataToUpdate);

      setUser(updatedUser);

      setProfileSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        error.message ||
        "Failed to update profile.";
      setProfileError(errorMessage);
      toast.error(`Failed to update profile: ${errorMessage}`);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleNotificationChange = (
    key: keyof typeof notificationSettings,
    value: boolean
  ) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: value,
    });
  };

  const handlePrivacyChange = (
    key: keyof typeof privacySettings,
    value: boolean
  ) => {
    setPrivacySettings({
      ...privacySettings,
      [key]: value,
    });
  };

  const handleSavePreferences = async () => {
    try {
      toast.success("Notification preferences saved!");
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast.error(
        `Failed to save preferences: ${error.message || "Unknown error"}`
      );
    }
  };

  const handleSavePrivacySettings = async () => {
    try {
      toast.success("Privacy settings saved!");
    } catch (error: any) {
      console.error("Error saving privacy settings:", error);
      toast.error(
        `Failed to save privacy settings: ${error.message || "Unknown error"}`
      );
    }
  };

  const handleResetPassword = () => {
    alert("Password reset functionality not yet implemented.");
  };

  const settingsTabs: TabItem[] = [
    {
      value: "profile",
      label: "Profile",
      content: (
        <div
          className="space-y-6 p-6 rounded-lg shadow-sm
                       bg-card text-card-foreground border border-border
                       dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground dark:text-foreground-dark">
              Profile Information
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
              Update your personal information and profile picture
            </p>
          </div>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                <ImageUpload
                  value={profileForm.profile_picture}
                  onChange={handleProfilePictureChange}
                />

                <div className="flex-1 space-y-4 w-full">
                  <div className="grid gap-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
                      <Input
                        id="first_name"
                        type="text"
                        name="first_name"
                        className="pl-10 pr-3 py-2 w-full"
                        value={profileForm.first_name}
                        onChange={handleProfileInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
                      <Input
                        id="last_name"
                        type="text"
                        name="last_name"
                        className="pl-10 pr-3 py-2 w-full"
                        value={profileForm.last_name}
                        onChange={handleProfileInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
                      <Input
                        id="username"
                        type="text"
                        name="username"
                        className="pl-10 pr-3 py-2 w-full"
                        value={profileForm.username}
                        onChange={handleProfileInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        className="pl-10 pr-3 py-2 w-full bg-muted dark:bg-muted-dark cursor-not-allowed"
                        value={profileForm.email}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px] px-3 py-2 w-full"
                  value={profileForm.bio || ""}
                  onChange={handleProfileInputChange}
                />
              </div>

              {/*
              <div className="space-y-4 pt-4 border-t border-border dark:border-border-dark">
                <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark">Password</h3>
                <div className="grid gap-2">
                  <label
                    htmlFor="current-password"
                    className="text-sm font-medium text-foreground dark:text-foreground-dark"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
                    <input
                      id="current-password"
                      type="password"
                      className="pl-10 pr-3 py-2 border border-input rounded-md w-full focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
                                 bg-background text-foreground
                                 dark:border-input-dark dark:bg-background-dark dark:text-foreground-dark dark:focus:ring-ring-dark dark:focus:border-ring-dark"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="new-password"
                    className="text-sm font-medium text-foreground dark:text-foreground-dark"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
                    <input
                      id="new-password"
                      type="password"
                      className="pl-10 pr-3 py-2 border border-input rounded-md w-full focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
                                 bg-background text-foreground
                                 dark:border-input-dark dark:bg-background-dark dark:text-foreground-dark dark:focus:ring-ring-dark dark:focus:border-ring-dark"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="confirm-password"
                    className="text-sm font-medium text-foreground dark:text-foreground-dark"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
                    <input
                      id="confirm-password"
                      type="password"
                      className="pl-10 pr-3 py-2 border border-input rounded-md w-full focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
                                 bg-background text-foreground
                                 dark:border-input-dark dark:bg-background-dark dark:text-foreground-dark dark:focus:ring-ring-dark dark:focus:border-ring-dark"
                    />
                  </div>
                </div>
                <Button variant="outline" type="button" onClick={handleResetPassword}>
                  Change Password
                </Button>
              </div>
              */}
            </div>

            {profileError && (
              <p className="text-destructive dark:text-destructive-dark text-sm mt-4">
                {profileError}
              </p>
            )}
            {profileSuccess && (
              <p className="text-green-600 dark:text-green-400 text-sm mt-4">
                {profileSuccess}
              </p>
            )}

            <div className="flex justify-start">
              <Button type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      ),
    },
    {
      value: "notifications",
      label: "Notifications",
      content: (
        <div
          className="space-y-6 p-6 rounded-lg shadow-sm
                       bg-card text-card-foreground border border-border
                       dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground dark:text-foreground-dark">
              Notification Preferences
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
              Manage how and when you receive notifications
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark">
                Email Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="email-notifications"
                      className="text-sm font-medium text-foreground dark:text-foreground-dark"
                    >
                      Email Notifications
                    </label>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("emailNotifications", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="marketing-emails"
                      className="text-sm font-medium text-foreground dark:text-foreground-dark"
                    >
                      Marketing Emails
                    </label>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                      Receive emails about new features and promotions
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("marketingEmails", checked)
                    }
                  />
                </div>
              </div>
            </div>

            <hr className="border-border dark:border-border-dark" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark">
                Session Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="session-reminders"
                      className="text-sm font-medium text-foreground dark:text-foreground-dark"
                    >
                      Session Reminders
                    </label>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                      Receive reminders before your scheduled sessions
                    </p>
                  </div>
                  <Switch
                    id="session-reminders"
                    checked={notificationSettings.sessionReminders}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("sessionReminders", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="new-requests"
                      className="text-sm font-medium text-foreground dark:text-foreground-dark"
                    >
                      New Session Requests
                    </label>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                      Get notified when someone requests a session with you
                    </p>
                  </div>
                  <Switch
                    id="new-requests"
                    checked={notificationSettings.newRequests}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("newRequests", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="completed-sessions"
                      className="text-sm font-medium text-foreground dark:text-foreground-dark"
                    >
                      Completed Sessions
                    </label>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                      Get notified when a session is marked as completed
                    </p>
                  </div>
                  <Switch
                    id="completed-sessions"
                    checked={notificationSettings.completedSessions}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("completedSessions", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-start pt-6">
            <Button type="button" onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </div>
        </div>
      ),
    },
    {
      value: "privacy",
      label: "Privacy",
      content: (
        <div
          className="space-y-6 p-6 rounded-lg shadow-sm
                       bg-card text-card-foreground border border-border
                       dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground dark:text-foreground-dark">
              Privacy Settings
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
              Control what information is visible to other users
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark">
                Profile Visibility
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="show-profile"
                      className="text-sm font-medium text-foreground dark:text-foreground-dark"
                    >
                      Show Profile
                    </label>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                      Make your profile visible to other TimeBank users
                    </p>
                  </div>
                  <Switch
                    id="show-profile"
                    checked={privacySettings.showProfile}
                    onCheckedChange={(checked) =>
                      handlePrivacyChange("showProfile", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="show-skills"
                      className="text-sm font-medium text-foreground dark:text-foreground-dark"
                    >
                      Show Skills
                    </label>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                      Display your skills on your public profile
                    </p>
                  </div>
                  <Switch
                    id="show-skills"
                    checked={privacySettings.showSkills}
                    onCheckedChange={(checked) =>
                      handlePrivacyChange("showSkills", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="show-time-wallet"
                      className="text-sm font-medium text-foreground dark:text-foreground-dark"
                    >
                      Show Time Wallet
                    </label>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                      Display your time credit balance to other users
                    </p>
                  </div>
                  <Switch
                    id="show-time-wallet"
                    checked={privacySettings.showTimeWallet}
                    onCheckedChange={(checked) =>
                      handlePrivacyChange("showTimeWallet", checked)
                    }
                  />
                </div>
              </div>
            </div>

            <hr className="border-border dark:border-border-dark" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark">
                Communication
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="allow-messages"
                      className="text-sm font-medium text-foreground dark:text-foreground-dark"
                    >
                      Allow Messages
                    </label>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                      Let other users send you direct messages
                    </p>
                  </div>
                  <Switch
                    id="allow-messages"
                    checked={privacySettings.allowMessages}
                    onCheckedChange={(checked) =>
                      handlePrivacyChange("allowMessages", checked)
                    }
                  />
                </div>
              </div>
            </div>

            <hr className="border-border dark:border-border-dark" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark">
                Account Security
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    alert(
                      "Two-factor authentication functionality not yet implemented."
                    )
                  }
                >
                  <Shield className="inline-block mr-2 h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
                  Enable Two-Factor Authentication
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-start pt-6">
            <Button type="button" onClick={handleSavePrivacySettings}>
              Save Privacy Settings
            </Button>
          </div>
        </div>
      ),
    },
    {
      value: "password",
      label: "Password",
      content: (
        <div
          className="space-y-6 p-6 rounded-lg shadow-sm
                       bg-card text-card-foreground border border-border
                       dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground dark:text-foreground-dark">
              Change Password
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
              Update your account password.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
                <Input
                  id="current-password"
                  type="password"
                  className="pl-10 pr-3 py-2 w-full"
                  placeholder="Enter current password"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
                <Input
                  id="new-password"
                  type="password"
                  className="pl-10 pr-3 py-2 w-full"
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
                <Input
                  id="confirm-password"
                  type="password"
                  className="pl-10 pr-3 py-2 w-full"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <Button
              variant="outline"
              type="button"
              onClick={handleResetPassword}
            >
              Change Password
            </Button>
          </div>
        </div>
      ),
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
        tabsListClassName="grid w-full grid-cols-3 mb-6"
      />
    </div>
  );
}
