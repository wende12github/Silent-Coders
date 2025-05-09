import React, { useState, useEffect, useCallback } from "react";
import Button from "../../components/ui/Button";
import { Input, Label, Textarea } from "../../components/ui/Form";
import {
  fetchAnnouncements,
  sendAnnouncement,
} from "../../services/groups";
import { GroupAnnouncement, GroupDetail, SendAnnouncementRequest } from "../../store/types";
import { useAuthStore } from "../../store/authStore";

interface AnnouncementsSectionProps {
  group: GroupDetail | null;
}

const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  group,
}) => {
  const { user: currentUser } = useAuthStore();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<SendAnnouncementRequest>({
    title: "",
    message: "",
  });
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [announcementData, setAnnouncementData] = useState<
  GroupAnnouncement[] | null
  >(null);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [errorAnnouncements, setErrorAnnouncements] = useState<string | null>(
    null
  );

  const currentPage = 1;

  const loadAnnouncements = useCallback(async () => {
    setIsLoadingAnnouncements(true);
    setErrorAnnouncements(null);
    if (!group?.id) {
      setIsLoadingAnnouncements(false);
      return;
    }

    try {
      const data = await fetchAnnouncements(group.id, undefined, currentPage);
      setAnnouncementData(data);
    } catch (err: any) {
      console.error("Error fetching announcements:", err);
      setErrorAnnouncements(err.message || "Failed to fetch announcements.");
    } finally {
      setIsLoadingAnnouncements(false);
    }
  }, [group?.id, currentPage]);

  useEffect(() => {
    if (group?.id) {
      loadAnnouncements();
    }
  }, [group?.id, loadAnnouncements]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError(null);
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!formData.message.trim()) {
      setFormError("Message is required.");
      return;
    }

    setIsAddingAnnouncement(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      if (!group?.id) {
        setFormError("Group ID is missing.");
        return;
      }

      const announcementRequest: SendAnnouncementRequest = {
        title: formData.title,
        message: formData.message,
      };

      await sendAnnouncement(group.id, announcementRequest);
      setSuccessMessage("Announcement created successfully");
      setFormData({ title: "", message: "" });
      setIsFormVisible(false);

      loadAnnouncements();
    } catch (err: any) {
      console.error("Error creating announcement:", err);
      setFormError(err.message || "Failed to create announcement");
    } finally {
      setIsAddingAnnouncement(false);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderContent = (
    isLoading: boolean,
    error: string | null,
    data: any[] | null,
    renderData: (data: any[]) => React.ReactNode,
    emptyMessage: string
  ) => {
    if (isLoading) {
      return (
        <div className="text-center py-4 text-muted-foreground dark:text-muted-foreground-dark text-sm">
          Loading...
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-4 text-destructive dark:text-destructive-dark text-sm">
          Error: {error}
        </div>
      );
    }
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground dark:text-muted-foreground-dark text-sm">
          {emptyMessage}
        </div>
      );
    }
    return renderData(data);
  };

  return (
    <div className="w-full max-w- mx-auto p4 mb-10">
      <div className="flex md:flex-row flex-col justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground dark:text-foreground-dark">
          Announcements
        </h2>
        {currentUser?.id === group?.owner && (
          <Button onClick={() => setIsFormVisible(!isFormVisible)}>
            {isFormVisible ? "Cancel" : "Add Announcement"}
          </Button>
        )}
      </div>

      {isFormVisible && (
        <form
          onSubmit={handleAddAnnouncement}
          className="mb-6 p-6 rounded-lg shadow-md border
                     bg-card text-card-foreground border-border
                     dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
        >
          <h3 className="text-xl font-semibold text-foreground dark:text-foreground-dark mb-4">
            Add Announcement
          </h3>
          <div className="mb-4">
            <Label htmlFor="title">Title:</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className={
                formError && formData.title.trim() === ""
                  ? "border-destructive dark:border-destructive-dark"
                  : ""
              }
            />
            {formError && formData.title.trim() === "" && (
              <p className="text-destructive dark:text-destructive-dark text-xs mt-1">
                {formError}
              </p>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="message">Message:</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              className={
                formError && formData.message.trim() === ""
                  ? "border-destructive dark:border-destructive-dark"
                  : ""
              }
            />
            {formError && formData.message.trim() === "" && (
              <p className="text-destructive dark:text-destructive-dark text-xs mt-1">
                {formError}
              </p>
            )}
          </div>
          {formError && (
            <p className="text-destructive dark:text-destructive-dark text-sm mb-4">
              {formError}
            </p>
          )}
          {successMessage && (
            <p className="text-green-600 dark:text-green-400 text-sm mb-4">
              {successMessage}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={isAddingAnnouncement}>
              {isAddingAnnouncement ? "Creating..." : "Create Announcement"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormVisible(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {renderContent(
        isLoadingAnnouncements,
        errorAnnouncements,
        announcementData,
        (announcements) => (
          <div className="space-y-4">
            {announcements.map((announcement: GroupAnnouncement) => (
              <div
                key={announcement.id}
                className="p-6 rounded-lg shadow-md border
                         bg-card text-card-foreground border-border
                         dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
              >
                <h3 className="text-xl font-semibold text-foreground dark:text-foreground-dark mb-2">
                  {announcement.title}
                </h3>
                <p
                  className="text-muted-foreground dark:text-muted-foreground-dark mb-3"
                  dangerouslySetInnerHTML={{
                    __html: announcement.message,
                  }}
                ></p>
                <div className="flex justify-between items-center text-sm text-muted-foreground dark:text-muted-foreground-dark">
                  <span>Posted by: {announcement.posted_by.username}</span>
                  <span>{formatTimestamp(announcement.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        ),
        "No announcements available at this time."
      )}
    </div>
  );
};

export default AnnouncementsSection;
