import React from "react";
import { MapPin } from "lucide-react";
import Button from "../ui/Button";
import { Badge } from "../ui/Badge";
import clsx from "clsx";
import { Skill } from "../../store/types";
import Avatar from "../ui/Avatar";
import { Link } from "react-router-dom";

interface UserSkillCardProps {
  skill: Skill;
  onRequestSession: () => void;
}

const UserSkillCard: React.FC<UserSkillCardProps> = ({
  skill,
  onRequestSession,
}) => {
  const isOffering = skill.is_offered;

  const userData = skill.user;

  return (
    <div
      className="flex flex-col rounded-lg shadow-sm overflow-hidden transition-transform duration-200
                bg-card text-card-foreground border border-border hover:shadow-md hover:-translate-y-1
                dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
    >
      <div
        className={clsx(
          "px-4 py-3 flex items-center justify-between",
          isOffering
            ? "bg-green-50 dark:bg-green-900/30"
            : "bg-blue-50 dark:bg-blue-900/30"
        )}
      >
        {userData ? (
          <Link to={"/users/" + userData.id}>
            <div className="flex items-center">
              <Avatar
                src={userData.profile_picture}
                alt={userData.first_name}
                fallback={userData.first_name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="ml-2 text-sm font-medium text-foreground dark:text-foreground-dark">
                {userData.first_name}
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-muted dark:bg-muted-dark animate-pulse"></div>
            <div className="ml-2 w-20 h-4 bg-muted dark:bg-muted-dark rounded animate-pulse"></div>
          </div>
        )}

        <Badge
          variant="ghost"
          className={clsx(
            isOffering
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
          )}
        >
          {isOffering ? "Offering" : "Seeking"}
        </Badge>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="">
          <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark mb-2">
            {skill.name}
          </h3>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark mb-4 line-clamp-2">
            {skill.description}
          </p>
          <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground-dark mb-3">
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{skill.location}</span>{" "}
              </div>
              <span>{skill.location === "local" && skill.address}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mb-4">
            {skill.tags?.map((tag, index) => (
              <Badge variant="secondary" key={index}>
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Button onClick={onRequestSession} className="w-full">
          {isOffering ? "Request to learn" : "Request to teach"}
        </Button>
      </div>
    </div>
  );
};

export default UserSkillCard;
