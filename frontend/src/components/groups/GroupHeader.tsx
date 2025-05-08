import React from "react";
import { Group } from "../../services/groups";

interface GroupHeaderProps {
  group: Group | null;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ group }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-foreground-dark">
        {group?.name || "Community"}
      </h1>
      <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
        {group?.description || "Browse members and check the leaderboard"}
      </p>
    </div>
  );
};

export default GroupHeader;
