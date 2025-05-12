import { useState, useEffect } from "react";
import Button from "../ui/Button";
import Switch from "../ui/Switch";
import { toast } from "sonner";
import {
  EmailPreferencesData,
  fetchEmailPreferences,
  updatePreferences,
} from "../../services/settings";

export default function NotificationSettings() {
  const [emailPreferences, setEmailPreferences] =
    useState<EmailPreferencesData>({
      newsletter: false,
      updates: false,
      skill_match_alerts: false,
    });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPreferences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const preferences = await fetchEmailPreferences();
        setEmailPreferences(preferences);
      } catch (err: any) {
        console.error("Failed to fetch email preferences:", err);
        setError("Failed to load preferences. Please try again.");
        toast.error("Failed to load notification preferences.");
      } finally {
        setIsLoading(false);
      }
    };

    getPreferences();
  }, []);

  const handlePreferenceChange = (
    key: keyof EmailPreferencesData,
    value: boolean
  ) => {
    setEmailPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const updatedPreferences = await updatePreferences(emailPreferences);
      setEmailPreferences(updatedPreferences);
      toast.success("Notification preferences saved!");
    } catch (err: any) {
      console.error("Failed to save preferences:", err);
      const errorMessage =
        err?.response?.data?.detail ||
        err.message ||
        "Failed to save preferences.";
      setError(errorMessage);
      toast.error(`Failed to save preferences: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading notification settings...</div>;
  }

  if (error && !isLoading) {
    return (
      <div className="p-6 text-destructive dark:text-destructive-dark">
        {error}
      </div>
    );
  }

  return (
    <div
      className="space-y-6 p-6 rounded-lg shadow-sm
                bg-card text-card-foreground border border-border
                dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
    >
      <div>
        <h2 className="text-xl font-semibold text-foreground dark:text-foreground-dark">
          Email Notification Preferences
        </h2>
        <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
          Manage which emails you receive
        </p>
      </div>
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark">
            Email Categories
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label
                  htmlFor="updates"
                  className="text-sm font-medium text-foreground dark:text-foreground-dark cursor-pointer"
                >
                  Important Updates
                </label>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                  Receive emails about changes to terms, privacy, or important
                  account issues.
                </p>
              </div>
              <Switch
                id="updates"
                checked={emailPreferences.updates}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("updates", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label
                  htmlFor="skill_match_alerts"
                  className="text-sm font-medium text-foreground dark:text-foreground-dark cursor-pointer"
                >
                  Skill Match Alerts
                </label>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                  Get notified when a new request matches your listed skills.
                </p>
              </div>
              <Switch
                id="skill_match_alerts"
                checked={emailPreferences.skill_match_alerts}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("skill_match_alerts", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label
                  htmlFor="newsletter"
                  className="text-sm font-medium text-foreground dark:text-foreground-dark cursor-pointer"
                >
                  Newsletter
                </label>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                  Receive our periodic newsletter with news, tips, and features.
                </p>
              </div>
              <Switch
                id="newsletter"
                checked={emailPreferences.newsletter}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("newsletter", checked)
                }
              />
            </div>
          </div>
        </div>
      </div>
      {error && !isLoading && (
        <p className="text-destructive dark:text-destructive-dark text-sm mt-4">
          {error}
        </p>
      )}
      <div className="flex justify-start pt-6">
        <Button
          type="button"
          onClick={handleSavePreferences}
          disabled={isLoading || isSaving}
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
