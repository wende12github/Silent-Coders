import { Send, Trophy } from "lucide-react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Tabs, { TabItem } from "../components/ui/Tabs";
import { useAuthStore } from "../store/authStore";
import { LeaderboardEntry } from "../store/types";
import Avatar from "../components/ui/Avatar";
import {
  fetchGroupById,
  getGroupLeaderboard,
  fetchMyGroups,
  fetchAllGroups,
  Group,
  AllGroups,
  sendGroupMessage,
  ChatMessage,
  fetchGroupMessages,
  SendAnnouncementRequest,
  sendAnnouncement,
  createAnnouncementRequest,
  AnnouncementResponse,
  fetchAnnouncements,
} from "../services/groups";
import Button from "../components/ui/Button";
import { Input, Label, Textarea } from "../components/ui/Form";

const GroupsPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const { groupId } = useParams<{ groupId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [group, setGroup] = useState<Group | null>(null);
  const [groupLeaderboard, setGroupLeaderboard] = useState<
    LeaderboardEntry[] | null
  >(null);
  const [myGroups, setMyGroups] = useState<AllGroups[] | null>(null);
  const [allGroups, setAllGroups] = useState<AllGroups[] | null>(null);

  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [errorGroup, setErrorGroup] = useState<string | null>(null);

  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [errorLeaderboard, setErrorLeaderboard] = useState<string | null>(null);

  const [isLoadingMyGroups, setIsLoadingMyGroups] = useState(false);
  const [errorMyGroups, setErrorMyGroups] = useState<string | null>(null);

  const [isLoadingAllGroups, setIsLoadingAllGroups] = useState(false);
  const [errorAllGroups, setErrorAllGroups] = useState<string | null>(null);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<createAnnouncementRequest>({
    title: "",
    message: "",
  });
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [announcementData, setAnnouncementData] = useState<
    AnnouncementResponse[] | null
  >(null);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [errorAnnouncements, setErrorAnnouncements] = useState<string | null>(
    null
  );

  const [currentPage] = useState(1);

  useEffect(() => {
    if (!groupId) return;

    const loadGroup = async () => {
      setIsLoadingGroup(true);
      try {
        const data = await fetchGroupById(groupId);
        setGroup(data);
      } catch (error: any) {
        console.error(`Error fetching group ${groupId}:`, error);
        setErrorGroup(`Failed to fetch group: ${error.message}`);
      } finally {
        setIsLoadingGroup(false);
      }
    };

    loadGroup();
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;

    const loadLeaderboard = async () => {
      setIsLoadingLeaderboard(true);
      try {
        const data = await getGroupLeaderboard(groupId);
        setGroupLeaderboard(data);
      } catch (error: any) {
        console.error(
          `Error fetching leaderboard for group ${groupId}:`,
          error
        );
        setErrorLeaderboard(`Failed to fetch leaderboard: ${error.message}`);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    loadLeaderboard();
  }, [groupId]);

  useEffect(() => {
    const loadMyGroups = async () => {
      setIsLoadingMyGroups(true);
      try {
        const data = await fetchMyGroups();
        setMyGroups(data);
      } catch (error: any) {
        console.error("Error fetching all groups:", error);
        setErrorMyGroups(`Failed to fetch all groups: ${error.message}`);
      } finally {
        setIsLoadingMyGroups(false);
      }
    };

    loadMyGroups();
  }, []);

  useEffect(() => {
    const loadAllGroups = async () => {
      setIsLoadingAllGroups(true);
      try {
        const data = await fetchAllGroups();
        setAllGroups(data);
      } catch (error: any) {
        console.error("Error fetching all groups:", error);
        setErrorAllGroups(`Failed to fetch all groups: ${error.message}`);
      } finally {
        setIsLoadingAllGroups(false);
      }
    };

    loadAllGroups();
  }, []);

  const loadMessages = useCallback(async () => {
    if (!group?.name) return;

    setIsLoadingMessages(true);
    try {
      const fetchedMessages = await fetchGroupMessages(group.name);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [group?.name]);

  useEffect(() => {
    if (group?.name) {
      loadMessages();
    }
  }, [group?.name, loadMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (newMessageText.trim() === "") return;
    if (!group?.name || !currentUser?.id) return;

    const tempId = Date.now();

    const newMessage: ChatMessage = {
      id: tempId,
      senderId: currentUser.id,
      senderName:
        currentUser.first_name || currentUser.username || "Unknown User",
      senderAvatar:
        currentUser.profile_picture ||
        `https://placehold.co/100x100/ff7f7f/ffffff?text=${
          currentUser.first_name?.charAt(0) ||
          currentUser.username?.charAt(0) ||
          "U"
        }`,
      text: newMessageText,
      timestamp: new Date().toISOString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, newMessage]);
    setNewMessageText("");

    try {
      const response = await sendGroupMessage({
        is_group_chat: true,
        message: newMessageText,
        room_name: group.name,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                timestamp: response.created_at,
                status: "delivered",
              }
            : msg
        )
      );
      loadMessages();
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                status: "failed",
                error:
                  error instanceof Error ? error.message : "Failed to send",
              }
            : msg
        )
      );
    }
  };

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
      if (!group?.id) return;

      const announcementRequest: SendAnnouncementRequest = {
        group: group.id,
        title: formData.title,
        message: formData.message,
      };

      await sendAnnouncement(group.id, announcementRequest);
      setSuccessMessage("Announcement created successfully");
      setFormData({ title: "", message: "" });
      setIsFormVisible(false);
      // Refresh announcements after creating a new one
      loadAnnouncements();
    } catch (err: any) {
      console.error("Error creating announcement:", err);
      setFormError(err.message || "Failed to create announcement");
    } finally {
      setIsAddingAnnouncement(false);
    }
  };

  const loadAnnouncements = useCallback(async () => {
    setIsLoadingAnnouncements(true);
    setErrorAnnouncements(null);
    if (!group?.id) return;

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

  const communityTabs: TabItem[] = [
    {
      value: "general",
      label: "General",
      content: (
        <div className="">
          <div className="w-full max-w- mx-auto p4 mb-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground dark:text-foreground-dark mb-6">
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
                    {isAddingAnnouncement
                      ? "Creating..."
                      : "Create Announcement"}
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
                  {announcements.map((announcement) => (
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
                        <span>Posted by: {announcement.posted_by}</span>
                        <span>{formatTimestamp(announcement.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ),
              "No announcements available at this time."
            )}
          </div>
          <div className="flex flex-col gap-5 mt-10">
            <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-foreground-dark">
              Members
            </h1>

            {renderContent(
              isLoadingGroup,
              errorGroup,
              group?.members || [],
              (members) => (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {Array.isArray(members) &&
                    members.map(
                      (member: {
                        email: string;
                        name: string;
                        profile_picture?: string;
                      }) => (
                        <div
                          key={member.email}
                          className="rounded-lg shadow-sm p-4 flex items-center space-x-4 transition
                                 bg-card text-card-foreground border border-border hover:shadow-md
                                 dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
                        >
                          <Avatar
                            fallback={member.name?.charAt(0) || "U"}
                            src={
                              member.profile_picture ||
                              `https://placehold.co/100x100/ff7f7f/ffffff?text=${
                                member.name?.charAt(0) || "U"
                              }`
                            }
                            alt={member.name}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-lg font-semibold text-foreground dark:text-foreground-dark">
                              {member.name}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                </div>
              ),
              "No members found for this group."
            )}
          </div>
        </div>
      ),
    },
    {
      value: "chat",
      label: "Chat",
      content: (
        <div
          className="flex flex-col h-full max-h-[700px] mb-10 rounded-lg shadow-sm border min-h-1/2
                       bg-card text-card-foreground border-border
                       dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
        >
          <div
            ref={messagesEndRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {isLoadingMessages ? (
              <div className="text-center py-4 text-muted-foreground dark:text-muted-foreground-dark">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground dark:text-muted-foreground-dark">
                No messages yet
              </div>
            ) : (
              [...messages].reverse().map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.senderId === currentUser?.id
                      ? "flex-row-reverse"
                      : ""
                  }`}
                >
                  <Avatar
                    fallback={message.senderName?.charAt(0) || "U"}
                    src={message.senderAvatar}
                    alt={message.senderName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div
                    className={`flex flex-col ${
                      message.senderId === currentUser?.id
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg p-3 ${
                        message.senderId === currentUser?.id
                          ? "bg-primary text-primary-foreground dark:bg-primary-dark dark:text-primary-foreground-dark"
                          : "bg-secondary text-secondary-foreground dark:bg-secondary-dark dark:text-secondary-foreground-dark"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <span
                      className={`text-xs text-muted-foreground dark:text-muted-foreground-dark mt-1 ${
                        message.senderId === currentUser?.id
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {message.senderName} •{" "}
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div
            className="border-t p-4 flex items-center gap-3
                         border-border bg-background dark:border-border-dark dark:bg-background-dark"
          >
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-full focus:outline-none focus:ring-2 text-sm
                         border border-input bg-background text-foreground focus:ring-ring focus:border-ring
                         dark:border-input-dark dark:bg-background-dark dark:text-foreground-dark dark:focus:ring-ring-dark dark:focus:border-ring-dark"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Button
              className="rounded-full p-2"
              onClick={handleSendMessage}
              disabled={newMessageText.trim() === ""}
              size="icon"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ),
    },
    {
      value: "leaderboard",
      label: "Leaderboard",
      content: (
        <div className="overflow-x-auto rounded-md border border-border dark:border-border-dark">
          {renderContent(
            isLoadingLeaderboard,
            errorLeaderboard,
            groupLeaderboard,
            (leaderboard) => (
              <table
                className="min-w-full rounded-md shadow-sm overflow-hidden
                               bg-card text-card-foreground"
              >
                <thead className="bg-muted dark:bg-muted-dark">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider">
                      Time Credits
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(leaderboard) &&
                    leaderboard.map((entry, index) => (
                      <tr
                        key={entry.user.id}
                        className="border-t border-border dark:border-border-dark hover:bg-muted/50 dark:hover:bg-muted-dark/50"
                      >
                        <td className="px-6 py-4 text-sm text-foreground dark:text-foreground-dark whitespace-nowrap">
                          {index === 0 ? (
                            <span className="inline-flex items-center font-semibold text-primary dark:text-primary-dark">
                              <Trophy className="h-5 w-5 mr-1" /> 1
                            </span>
                          ) : (
                            index + 1
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                          <Avatar
                            fallback={
                              entry.user.first_name?.charAt(0) ||
                              entry.user.username?.charAt(0) ||
                              "U"
                            }
                            src={entry.user.profile_picture}
                            alt={entry.user.first_name || entry.user.username}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-sm font-medium text-foreground dark:text-foreground-dark">
                            {entry.user.first_name || entry.user.username}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground dark:text-muted-foreground-dark">
                          {entry.net_contribution} credits
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ),
            "No leaderboard data available for this group."
          )}
        </div>
      ),
    },
  ];

  if (isLoadingGroup && !group) {
    return (
      <div className="text-center py-10 text-muted-foreground dark:text-muted-foreground-dark">
        Loading group details...
      </div>
    );
  }

  if (errorGroup && !group) {
    return (
      <div className="text-center py-10 text-destructive dark:text-destructive-dark">
        Error loading group: {errorGroup}
      </div>
    );
  }

  if (!group && !errorGroup) {
    return (
      <div className="text-center py-10 text-muted-foreground dark:text-muted-foreground-dark">
        Please provide a valid group ID.
      </div>
    );
  }

  return (
    <div
      className="p-6 space-y-6 flex-grow
                   bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark"
    >
      <div className="max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-foreground-dark">
            {group?.name || "Community"}
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
            {group?.description || "Browse members and check the leaderboard"}
          </p>
        </div>
        <div className="mt-6">
          <Tabs
            defaultValue="general"
            items={communityTabs}
            tabsListClassName="mb-4"
          />
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
