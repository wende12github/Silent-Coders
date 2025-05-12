import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Tabs, { TabItem } from "../components/ui/Tabs";
import { fetchGroupDetail, getGroupLeaderboard } from "../services/groups";
import { LeaderboardEntry, GroupDetail } from "../store/types";

import GroupHeader from "../components/groups/GroupHeader";
import AnnouncementsSection from "../components/groups/AnnouncementsSection";
import MembersSection from "../components/groups/MembersSection";
import ChatSection from "../components/groups/ChatSection";
import LeaderboardSection from "../components/groups/LeaderboardSection";

const GroupPage = () => {
  const { groupId } = useParams<{ groupId: string }>();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [groupLeaderboard, setGroupLeaderboard] = useState<
    LeaderboardEntry[] | null
  >(null);

  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [errorGroup, setErrorGroup] = useState<string | null>(null);

  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [errorLeaderboard, setErrorLeaderboard] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    const loadGroup = async () => {
      setIsLoadingGroup(true);
      try {
        const data = await fetchGroupDetail(Number(groupId));
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
        const data = await getGroupLeaderboard(Number(groupId));
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

  const communityTabs: TabItem[] = [
    {
      value: "general",
      label: "General",
      content: (
        <div className="flex sm:flex-row flex-col-reverse gap-10">
          <MembersSection
            group={group}
            isLoading={isLoadingGroup}
            error={errorGroup}
          />
          <AnnouncementsSection group={group} />
        </div>
      ),
    },
    {
      value: "chat",
      label: "Chat",
      content: <ChatSection group={group} />,
    },
    {
      value: "leaderboard",
      label: "Leaderboard",
      content: (
        <LeaderboardSection
          leaderboard={groupLeaderboard}
          isLoading={isLoadingLeaderboard}
          error={errorLeaderboard}
        />
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
    <div className="p-6 space-y-6 flex flex-grow flex-shrink-0 bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark ">
      <div className="max-w-7xl mx-auto min-h-full flex flex-col flex-grow">
        <GroupHeader group={group} />

        <Tabs
          tabsContentClassName={"flex-grow"}
          className="mt-6 flex-grow flex flex-col"
          defaultValue="general"
          items={communityTabs}
          tabsListClassName="mb-4"
        />
      </div>
    </div>
  );
};

export default GroupPage;
