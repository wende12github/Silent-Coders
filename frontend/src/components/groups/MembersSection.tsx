import React from "react";
import Avatar from "../../components/ui/Avatar";
import { GroupMember, GroupDetail } from "../../store/types";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Badge } from "../ui/Badge";

interface MembersSectionProps {
  group: GroupDetail | null;
  isLoading: boolean;
  error: string | null;
}

const MembersSection: React.FC<MembersSectionProps> = ({
  group,
  isLoading,
  error,
}) => {
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

  const currentUser = useAuthStore((state) => state.user);

  return (
    <div className="flex flex-col gap-5 lg:w-1/3 lg:border-r-2 border-border dark:border-border-dark h-full pr-2">
      <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-foreground-dark">
        Members
      </h1>

      {renderContent(
        isLoading,
        error,
        group?.members || [],
        (members) => (
          <div className="grid gap-6">
            {Array.isArray(members) &&
              members.map((member: GroupMember) => (
                <Link to={currentUser ? "/users/" + member.user.id : "#"}>
                  <div
                    key={member.user.id}
                    className="rounded-lg shadow-sm p-4 flex items-center space-x-4 transition
                             bg-card text-card-foreground border border-border hover:shadow-md
                             dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
                  >
                    <Avatar
                      fallback={member.user.first_name?.charAt(0) || "U"}
                      src={
                        member.user.profile_picture ||
                        `https://placehold.co/100x100/ff7f7f/ffffff?text=${
                          member.user.first_name?.charAt(0) || "U"
                        }`
                      }
                      alt={member.user.first_name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-lg font-semibold text-foreground dark:text-foreground-dark">
                        {member.user.first_name}
                      </p>
                    </div>
                    {currentUser && member.user.id === currentUser.id && (
                      <Badge
                        size="lg"
                        variant="secondary"
                        className="absolute top-0 right-0"
                      >
                        You
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
          </div>
        ),
        "No members found for this group."
      )}
    </div>
  );
};

export default MembersSection;
