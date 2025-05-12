import React, { useState } from "react";
import Button from "../ui/Button"; // Adjust path if needed
import { Input, Label } from "../ui/Form"; // Adjust path if needed
import { Lock } from "lucide-react"; // Adjust path if needed (lucide-react import)
import { toast } from "sonner";
import { resetPassword } from "../../services/settings";

export default function PasswordSettingsForm() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPasswordError(null); // Clear errors on input change
    setPasswordSuccess(null); // Clear success on input change
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!passwordForm.currentPassword) {
      setPasswordError("Current Password is required.");
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError("New Password is required.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      await resetPassword({
        old_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      });

      setPasswordSuccess("Password changed successfully!");
      toast.success("Password changed successfully!");
      // Clear form fields on success
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
        const errorMessage =
        error?.response?.data?.detail ||
        error.message ||
        "Failed to change password.";
      setPasswordError(errorMessage);
      toast.error(`Failed to change password: ${errorMessage}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
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

      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="current-password">Current Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
            <Input
              id="current-password"
              type="password"
              name="currentPassword"
              className="pl-10 pr-3 py-2 w-full"
              placeholder="Enter current password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordInputChange}
              required
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
              name="newPassword"
              className="pl-10 pr-3 py-2 w-full"
              placeholder="Enter new password"
              value={passwordForm.newPassword}
              onChange={handlePasswordInputChange}
              required
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
              name="confirmNewPassword"
              className="pl-10 pr-3 py-2 w-full"
              placeholder="Confirm new password"
              value={passwordForm.confirmNewPassword}
              onChange={handlePasswordInputChange}
              required
            />
          </div>
        </div>
         {passwordError && (
          <p className="text-destructive dark:text-destructive-dark text-sm mt-4">
            {passwordError}
          </p>
        )}
        {passwordSuccess && (
          <p className="text-green-600 dark:text-green-400 text-sm mt-4">
            {passwordSuccess}
          </p>
        )}
        <Button
          type="submit"
          disabled={isChangingPassword}
        >
          {isChangingPassword ? "Changing..." : "Change Password"}
        </Button>
      </form>
    </div>
  );
}