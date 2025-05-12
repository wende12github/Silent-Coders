import { useState } from "react";
import Button from "../ui/Button";
import Switch from "../ui/Switch";
import { Shield } from "lucide-react";
import { toast } from "sonner";

export default function PrivacySettings() {
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showSkills: true,
    showTimeWallet: false,
    allowMessages: true,
  });

  const handlePrivacyChange = (
    key: keyof typeof privacySettings,
    value: boolean
  ) => {
    setPrivacySettings({
      ...privacySettings,
      [key]: value,
    });
  };

  const handleSavePrivacySettings = async () => {
    try {
      console.log("Saving privacy settings:", privacySettings);

      toast.success("Privacy settings saved!");
    } catch (error: any) {
      console.error("Error saving privacy settings:", error);
      toast.error(
        `Failed to save privacy settings: ${error.message || "Unknown error"}`
      );
    }
  };

  const handleEnableTwoFactor = () => {
    alert("Two-factor authentication functionality not yet implemented.");
  };

  return (
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
                  className="text-sm font-medium text-foreground dark:text-foreground-dark cursor-pointer"
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
                  className="text-sm font-medium text-foreground dark:text-foreground-dark cursor-pointer"
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
                  className="text-sm font-medium text-foreground dark:text-foreground-dark cursor-pointer"
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
                  className="text-sm font-medium text-foreground dark:text-foreground-dark cursor-pointer"
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
              onClick={handleEnableTwoFactor}
            >
              <Shield className="inline-block mr-2 h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
              Enable Two-Factor Authentication (Soon)
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
  );
}
