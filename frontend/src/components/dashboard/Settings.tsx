import React, { useState, useEffect } from "react";
import { User as UserIcon, Mail, Shield } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";
import Switch from "../ui/Switch";
import Tabs, { TabItem } from "../ui/Tabs";
import { Input, Label, Textarea } from "../ui/Form";
import { updateCurrentUser } from "../../services/user"; // Assuming updateCurrentUser is in services/user.ts
import { User } from "../../store/types"; // Import User type
import { ImageUpload } from "../ImageUpload"; // Import the ImageUpload component
import {
  resetPassword,
  updateUserData,
  updatePreferences,
} from "../../services/settings";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    profile_picture: user?.profile_picture || null, // Add profile_picture to state
  });

  // State for profile update loading and error
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

  // Effect to update form state if user data in store changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        profile_picture: user.profile_picture || null, // Update profile_picture state
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

  // Handler for ImageUpload component
  const handleProfilePictureChange = (url: string | null) => {
    setProfileForm((prev) => ({
      ...prev,
      profile_picture: url, // Update profile_picture in state
    }));
    setProfileError(null);
    setProfileSuccess(null);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
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
      // Prepare data to send to the API
      const profileDataToUpdate: Partial<User> = {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        username: profileForm.username,
        bio: profileForm.bio,
        profile_picture: profileForm.profile_picture, // Include profile_picture
      };

      // Call the API to update the user profile
      const updatedUser = await updateCurrentUser(profileDataToUpdate);

      // Update the user state in the auth store with the response data
      setUser(updatedUser);

      setProfileSuccess("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setProfileError(error.message || "Failed to update profile.");
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
    // TODO: Add logic to save changes (e.g., API call) for notifications
    console.log("Notification settings updated:", { [key]: value });
  };

  const handlePrivacyChange = (
    key: keyof typeof privacySettings,
    value: boolean
  ) => {
    setPrivacySettings({
      ...privacySettings,
      [key]: value,
    });
    // TODO: Add logic to save changes (e.g., API call) for privacy
    console.log("Privacy settings updated:", { [key]: value });
  };
  // **Added Functions**

  // Reset Password
  const handleResetPassword = async () => {
    try {
      await resetPassword({
        old_password: "wear",
        new_password: "Hello",
      });
      alert("Password reset successfully!");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to reset password.");
    }
  };

  // Update Preferences
  const handleUpdatePreferences = async () => {
    try {
      await updatePreferences({
        newsletter: true,
        updates: true,
        skill_match_alerts: true,
      });
      alert("Preferences updated successfully!");
    } catch (error) {
      console.error("Error updating preferences:", error);
      alert("Failed to update preferences.");
    }
  };

  // Update User Data
  const handleUpdateUserData = async () => {
    try {
      await updateUserData({
        bio: "New bio",
        username: "new_username",
        availability: "Available",
      });
      alert("User data updated successfully!");
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update user data.");
    }
  };

  // Define the items for the Tabs component
  const settingsTabs: TabItem[] = [
    {
      value: "profile",
      label: "Profile",
      content: (
        <div className="space-y-6 p-6 border border-border rounded-lg shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Profile Information
            </h2>
            <p className="text-gray-600 mt-1">
              Update your personal information and profile picture
            </p>
          </div>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                {/* Image Upload Component */}
                <ImageUpload
                  value={profileForm.profile_picture}
                  onChange={handleProfilePictureChange}
                />

                <div className="flex-1 space-y-4 w-full">
                  {/* First Name Input */}
                  <div className="grid gap-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="first_name"
                        type="text"
                        name="first_name"
                        className="pl-10 pr-3 py-2 border border-border rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={profileForm.first_name}
                        onChange={handleProfileInputChange}
                        required
                      />
                    </div>
                  </div>
                  {/* Last Name Input */}
                  <div className="grid gap-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="last_name"
                        type="text"
                        name="last_name"
                        className="pl-10 pr-3 py-2 border border-border rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={profileForm.last_name}
                        onChange={handleProfileInputChange}
                        required
                      />
                    </div>
                  </div>
                  {/* Username Input */}
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="username"
                        type="text"
                        name="username"
                        className="pl-10 pr-3 py-2 border border-border rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={profileForm.username}
                        onChange={handleProfileInputChange}
                        required
                      />
                    </div>
                  </div>
                  {/* Email Input (likely read-only) */}
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        className="pl-10 pr-3 py-2 border border-border rounded-md w-full bg-gray-100 cursor-not-allowed"
                        value={profileForm.email}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Textarea */}
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px] px-3 py-2 border border-border rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={profileForm.bio || ""}
                  onChange={handleProfileInputChange}
                />
              </div>

              {/* Password Section - COMMENTED OUT */}
              {/*
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">Password</h3>
                <div className="grid gap-2">
                  <label
                    htmlFor="current-password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="current-password"
                      type="password"
                      className="pl-10 pr-3 py-2 border border-border rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="new-password"
                    className="text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="new-password"
                      type="password"
                      className="pl-10 pr-3 py-2 border border-border rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="confirm-password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="confirm-password"
                      type="password"
                      className="pl-10 pr-3 py-2 border border-border rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <Button variant="outline" type="button">
                  Change Password
                </Button>
              </div>
              */}
            </div>

            {/* Display error or success messages */}
            {profileError && (
              <p className="text-red-500 text-sm mt-4">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-green-600 text-sm mt-4">{profileSuccess}</p>
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
        <div className="space-y-6 p-6 border border-border rounded-lg shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Notification Preferences
            </h2>
            <p className="text-gray-600 mt-1">
              Manage how and when you receive notifications
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">
                Email Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="email-notifications"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email Notifications
                    </label>
                    <p className="text-sm text-gray-500">
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
                      className="text-sm font-medium text-gray-700"
                    >
                      Marketing Emails
                    </label>
                    <p className="text-sm text-gray-500">
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

            <hr className="border-gray-200" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">
                Session Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="session-reminders"
                      className="text-sm font-medium text-gray-700"
                    >
                      Session Reminders
                    </label>
                    <p className="text-sm text-gray-500">
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
                      className="text-sm font-medium text-gray-700"
                    >
                      New Session Requests
                    </label>
                    <p className="text-sm text-gray-500">
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
                      className="text-sm font-medium text-gray-700"
                    >
                      Completed Sessions
                    </label>
                    <p className="text-sm text-gray-500">
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
            <Button type="button">Save Preferences</Button>
          </div>
        </div>
      ),
    },
    {
      value: "privacy",
      label: "Privacy",
      content: (
        <div className="space-y-6 p-6 border border-border rounded-lg shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Privacy Settings
            </h2>
            <p className="text-gray-600 mt-1">
              Control what information is visible to other users
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">
                Profile Visibility
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="show-profile"
                      className="text-sm font-medium text-gray-700"
                    >
                      Show Profile
                    </label>
                    <p className="text-sm text-gray-500">
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
                      className="text-sm font-medium text-gray-700"
                    >
                      Show Skills
                    </label>
                    <p className="text-sm text-gray-500">
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
                      className="text-sm font-medium text-gray-700"
                    >
                      Show Time Wallet
                    </label>
                    <p className="text-sm text-gray-500">
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

            <hr className="border-gray-200" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">
                Communication
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="allow-messages"
                      className="text-sm font-medium text-gray-700"
                    >
                      Allow Messages
                    </label>
                    <p className="text-sm text-gray-500">
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

            <hr className="border-gray-200" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">
                Account Security
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full sm:w-auto"
                >
                  <Shield className="inline-block mr-2 h-4 w-4 text-gray-600" />
                  Enable Two-Factor Authentication
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-star">
            <Button type="button">Save Privacy Settings</Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 w-full mx-auto space-y-8 rounded-lg shadow-md">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="text-gray-600 mt-1">
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
