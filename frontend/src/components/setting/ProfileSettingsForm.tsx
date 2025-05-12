import React, { useState, useEffect } from "react";
import { User as UserIcon, Mail } from "lucide-react";
import Button from "../ui/Button";
import { Input, Label, Textarea } from "../ui/Form";

import {
  updateCurrentUser,
  UpdateCurrentUserPayload,
} from "../../services/user";
import { User } from "../../store/types";
import { ImageUpload } from "../ImageUpload";
import { toast } from "sonner";

interface ProfileSettingsFormProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

export default function ProfileSettingsForm({
  user,
  setUser,
}: ProfileSettingsFormProps) {
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",

    profile_picture: user?.profile_picture || null,

    profile_picture_file: null as File | null | "",
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        profile_picture: user.profile_picture || null,
        profile_picture_file: null,
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

  const handleProfilePictureChange = (file?: File | null) => {
    setProfileForm((prev) => ({
      ...prev,
      profile_picture: file ? URL.createObjectURL(file) : null,
    }));

    if (file !== undefined) {
      setProfileForm((prev) => ({
        ...prev,
        profile_picture_file: file,
      }));
    }

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
      const finalUpdatePayload: Partial<UpdateCurrentUserPayload> = {};
      if (user?.first_name !== profileForm.first_name)
        finalUpdatePayload.first_name = profileForm.first_name;
      if (user?.last_name !== profileForm.last_name)
        finalUpdatePayload.last_name = profileForm.last_name;
      if (user?.username !== profileForm.username)
        finalUpdatePayload.username = profileForm.username;

      if ((user?.bio || "") !== (profileForm.bio || ""))
        finalUpdatePayload.bio =
          profileForm.bio === "" ? null : profileForm.bio;

      if (
        profileForm.profile_picture_file !== null &&
        profileForm.profile_picture_file !== ""
      ) {
        finalUpdatePayload.profile_picture = profileForm.profile_picture_file;
      } else if (
        profileForm.profile_picture === null &&
        user?.profile_picture !== null
      ) {
        finalUpdatePayload.profile_picture = null;
      }

      const updatedUser = await updateCurrentUser(finalUpdatePayload);

      setUser(updatedUser);

      setProfileSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");

      setProfileForm((prev) => ({ ...prev, profile_picture_file: null }));
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

  if (!user) {
    return <div className="p-6">Loading profile settings...</div>;
  }

  return (
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
            {/* Pass the current URL for display and the handler for changes */}
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
                <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                  Email cannot be changed.
                </p>
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
  );
}
