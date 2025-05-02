import React from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import Button from "../ui/Button";
import { Badge } from "../ui/Badge";
import clsx from "clsx";
import { Skill } from "../../store/types";
import Avatar from "../ui/Avatar";
// interface User {
//   id: string;
//   name: string;
//   profilePicture: string;
// }

// export interface Skill {
//   id: string;
//   user: User;
//   title: string;
//   description: string;
//   is_offered: boolean;
//   credits: number;
//   location: string;
//   tags: string[];
// }

interface UserSkillCardProps {
  skill: Skill;
}

const UserSkillCard: React.FC<UserSkillCardProps> = ({ skill }) => {
  const isOffering = skill.is_offered;

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-transform duration-200 hover:shadow-md hover:-translate-y-1 ">
      <div
        className={`px-4 py-3 flex items-center justify-between ${
          isOffering ? "bg-green-50" : "bg-blue-50"
        }`}
      >
        <Link to={`/profile/${skill.user?.id}`} className="flex items-center">
          <Avatar
            src={skill.user?.profile_picture}
            alt={skill.user?.name}
            fallback={skill.user?.name || "U"}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="ml-2 text-sm font-medium text-gray-900">
            {skill.user?.name}
          </span>
        </Link>
        <Badge
          variant="ghost"
          className={clsx(
            isOffering
              ? "bg-green-100! text-green-800!"
              : "bg-blue-100! text-blue-800!"
          )}
        >
          {isOffering ? "Offering" : "Seeking"}
        </Badge>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {skill.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {skill.description}
          </p>
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Clock className="h-4 w-4 mr-1" />
            <span> 12 credits/hour</span>
            {/* <span>{skill.credits} credits/hour</span> */}
            <div className="mx-2 h-1 w-1 rounded-full bg-gray-300"></div>
            <MapPin className="h-4 w-4 mr-1" />
            <span>{skill.location}</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-4">
            {skill.tags.map((tag, index) => (
              <Badge variant="secondary" key={index}>
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Button className="w-full">Request Session</Button>
      </div>
    </div>
  );
};

export default UserSkillCard;
