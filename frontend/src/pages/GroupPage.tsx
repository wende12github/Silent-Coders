import { Send, Trophy } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Tabs, { TabItem } from "../components/ui/Tabs";
import { useAuthStore } from "../store/authStore";
import {
  allUsers,
  ChatMessage,
  initialMockMessages,
  mockLeaderboard,
} from "../store/types";
import Avatar from "../components/ui/Avatar";
import { Announcement } from "../store/types";

const GroupPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(initialMockMessages);
  const [newMessageText, setNewMessageText] = useState("");
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessageText.trim() === "") return;

    const newMessage: ChatMessage = {
      id: messages.length + 1,
      senderId: currentUser?.id || 0,
      senderName: currentUser?.name || "Unknown User",
      senderAvatar:
        currentUser?.profile_picture ||
        "https://placehold.co/100x100/ff7f7f/ffffff?text=AJ",
      text: newMessageText,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setNewMessageText("");

    console.log("Sending message:", newMessage);
  };
  const members = allUsers;
  const leaderboard = mockLeaderboard;

  const mockAnnouncements: Announcement[] = [
    {
      id: "1",
      title: "System Update Scheduled",
      content:
        "We will be performing a system update on May 5th. Expect downtime between 2:00 AM and 4:00 AM.",
      author: allUsers[1],
      timestamp: "2025-05-01T10:00:00Z",
    },
    {
      id: "2",
      title: "New Feature Release",
      content:
        "We&nbsp;re excited to introduce a new feature that enhances user experience. Check it out in your settings!",
      author: allUsers[1],
      timestamp: "2025-05-02T09:30:00Z",
    },
    {
      id: "3",
      title: "Upcoming Event: Developer Meetup",
      author: allUsers[1],
      content:
        "Join us for an exclusive developer meetup on May 10th! Register now to secure your spot.",

      timestamp: "2025-05-02T11:00:00Z",
    },
  ];
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
  const communityTabs: TabItem[] = [
    {
      value: "general",
      label: "General",
      content: (
        <div className="">
          <div className="w-full max-w- mx-auto p4 mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Announcements
            </h2>
            {mockAnnouncements.length === 0 ? (
              <p className="text-gray-600">
                No announcements available at this time.
              </p>
            ) : (
              <div className="space-y-4">
                {mockAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {announcement.title}
                    </h3>
                    <p
                      className="text-gray-700 mb-3"
                      dangerouslySetInnerHTML={{ __html: announcement.content }}
                    ></p>{" "}
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Posted by: {announcement.author.name}</span>
                      <span>{formatTimestamp(announcement.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Members
            </h1>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4 hover:shadow-md transition"
                >
                  <Avatar
                    fallback={member.name || "U"}
                    src={member.profile_picture}
                    alt={member.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {member.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {member.time_wallet} Credits
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      value: "chat",
      label: "Chat",
      content: (
        <div className="flex flex-col h-full max-h-[700px] mb-10 bg-white rounded-lg shadow-sm border border-gray-200">
          <div
            ref={messagesEndRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.senderId === currentUser?.id ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar
                  fallback="U"
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
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <span
                    className={`text-xs text-gray-500 mt-1 ${
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
            ))}
          </div>
          <div className="border-t border-gray-200 p-4 flex items-center gap-3">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSendMessage}
              disabled={newMessageText.trim() === ""}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      ),
    },
    {
      value: "leaderboard",
      label: "Leaderboard",
      content: (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-md shadow-sm overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Credits
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((member, index) => (
                <tr key={member.id} className="border-t border-gray-200">
                  {" "}
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {index === 0 ? (
                      <span className="inline-flex items-center font-semibold text-yellow-500">
                        <Trophy className="h-5 w-5 mr-1" /> 1
                      </span>
                    ) : (
                      index + 1
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                    <Avatar
                      fallback={member.user.name || "U"}
                      src={member.user.profile_picture}
                      alt={member.user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {member.user.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {member.user.time_wallet} credits
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Community
          </h1>
          <p className="text-gray-600 mt-1">
            Browse members and check the leaderboard
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

export default GroupPage;
