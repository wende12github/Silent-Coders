import React, { useState } from "react";
import { User as UserIcon, Mail, Lock, Shield, Upload } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";
import Switch from "../ui/Switch";
import Tabs, { TabItem } from "../ui/Tabs";

export default function SettingsPage() {
  const { user } = useAuthStore();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });

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

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would update the user profile here
    console.log("Profile updated:", profileForm);
    // Add logic to save changes (e.g., API call)
  };

  const handleNotificationChange = (
    key: keyof typeof notificationSettings,
    value: boolean
  ) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: value,
    });
    // Add logic to save changes (e.g., API call)
  };

  const handlePrivacyChange = (
    key: keyof typeof privacySettings,
    value: boolean
  ) => {
    setPrivacySettings({
      ...privacySettings,
      [key]: value,
    });
    // Add logic to save changes (e.g., API call)
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
                <div className="flex flex-col items-center gap-2">
                  <div className="relative flex shrink-0 overflow-hidden rounded-full h-24 w-24 border border-gray-300">
                    <img
                      src={user?.profile_picture || ""}
                      alt={user?.name || "User"}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <Button variant="outline" type="button">
                    {" "}
                    {/* Use reusable Button */}
                    <Upload className="inline-block mr-2 h-4 w-4 text-gray-600" />{" "}
                    {/* Renamed icon */}
                    Change Photo
                  </Button>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid gap-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />{" "}
                      {/* Renamed icon */}
                      <input
                        id="name"
                        type="text"
                        className="pl-10 pr-3 py-2 border border-border rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label
                      htmlFor="username"
                      className="text-sm font-medium text-gray-700"
                    >
                      Username
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />{" "}
                      {/* Renamed icon */}
                      <input
                        id="username"
                        type="text"
                        className="pl-10 pr-3 py-2 border border-border rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={profileForm.username}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            username: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />{" "}
                      {/* Renamed icon */}
                      <input
                        id="email"
                        type="email"
                        className="pl-10 pr-3 py-2 border border-border rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="bio"
                  className="text-sm font-medium text-gray-700"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px] px-3 py-2 border border-border rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={profileForm.bio || ""}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bio: e.target.value })
                  }
                />
              </div>

              {/* Password Section */}
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
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />{" "}
                    {/* Renamed icon */}
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
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />{" "}
                    {/* Renamed icon */}
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
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />{" "}
                    {/* Renamed icon */}
                    <input
                      id="confirm-password"
                      type="password"
                      className="pl-10 pr-3 py-2 border border-border rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <Button variant="outline" type="button">
                  {" "}
                  {/* Use reusable Button */}
                  Change Password
                </Button>
              </div>
            </div>
            <div className="flex justify-start">
              <Button type="submit">Save Changes</Button>{" "}
              {/* Use reusable Button */}
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
                  />{" "}
                  {/* Use reusable Switch */}
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
                  />{" "}
                  {/* Use reusable Switch */}
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
                  />{" "}
                  {/* Use reusable Switch */}
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
                  />{" "}
                  {/* Use reusable Switch */}
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
                  />{" "}
                  {/* Use reusable Switch */}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-start pt-6">
            <Button type="button">Save Preferences</Button>{" "}
            {/* Use reusable Button */}
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
                  />{" "}
                  {/* Use reusable Switch */}
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
                  />{" "}
                  {/* Use reusable Switch */}
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
                  />{" "}
                  {/* Use reusable Switch */}
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
                  />{" "}
                  {/* Use reusable Switch */}
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
                  {" "}
                  {/* Use reusable Button */}
                  <Shield className="inline-block mr-2 h-4 w-4 text-gray-600" />{" "}
                  {/* Renamed icon */}
                  Enable Two-Factor Authentication
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-star">
            <Button type="button">Save Privacy Settings</Button>{" "}
            {/* Use reusable Button */}
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
