// import { useParams } from "react-router-dom";

// const UserProfilePage = () => {
//   const { userId } = useParams();
//   return <div>UserProfilePag {userId}</div>;
// };

// export default UserProfilePage;

import { FC } from "react";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string | null;
  profileImageUrl?: string | null;
  skills: Skill[];
  groups: Group[];
}

interface Skill {
  id: number;
  name: string;
  description: string | null;
  is_offered: boolean;
  tags: string[];
}

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

const mockUser: User = {
  id: "user-123",
  name: "Jane Doe",
  username: "janedoe",
  email: "jane.doe@example.com",
  bio: "Passionate web developer with a focus on React and TypeScript. Love contributing to open source projects.",
  profileImageUrl: "https://placehold.co/150x150/a78bfa/ffffff?text=JD",
  skills: [
    {
      id: 1,
      name: "React",
      description: "Building user interfaces",
      is_offered: true,
      tags: ["Frontend", "JavaScript"],
    },
    {
      id: 2,
      name: "TypeScript",
      description: "Strong typing for JavaScript",
      is_offered: true,
      tags: ["Programming", "JavaScript"],
    },
    {
      id: 3,
      name: "Tailwind CSS",
      description: "Utility-first CSS framework",
      is_offered: true,
      tags: ["Frontend", "CSS"],
    },
    {
      id: 4,
      name: "Node.js",
      description: "Backend JavaScript runtime",
      is_offered: true,
      tags: ["Backend", "JavaScript"],
    },
    {
      id: 5,
      name: "Python",
      description: "General purpose programming",
      is_offered: false,
      tags: ["Programming"],
    },
  ],
  groups: [
    {
      id: "grp-1",
      name: "React Developers Community",
      description: "A community for React enthusiasts...",
      memberCount: 1500,
    },
    {
      id: "grp-3",
      name: "TypeScript Enthusiasts",
      description: "Deep dive into the world of TypeScript...",
      memberCount: 950,
    },
    {
      id: "grp-5",
      name: "Open Source Contributors",
      description: "Find projects to contribute to...",
      memberCount: 700,
    },
  ],
};

const ProfilePage: FC = () => {
  const user = mockUser;

  const handleRequestSession = (skillName: string) => {
    console.log(`Request session for skill: ${skillName}`);

    alert(
      `You requested a session for "${skillName}". (This is a placeholder action)`
    );
  };

  const handleOfferToTeach = (skillName: string) => {
    console.log(`Offer to teach skill: ${skillName}`);

    alert(
      `You offered to teach "${skillName}". (This is a placeholder action)`
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
          <img
            src={
              user.profileImageUrl ||
              "https://placehold.co/150x150/cccccc/333333?text=No+Image"
            }
            alt={`${user.name}'s profile`}
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
          />

          <div className="flex-grow text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">@{user.username}</p>
            <p className="text-gray-700 mt-4">
              {user.bio || "No bio provided."}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Skills</h2>
          {user.skills.length === 0 ? (
            <p className="text-gray-600">No skills listed yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="bg-gray-50 p-4 rounded-md border border-gray-200 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {skill.name}
                    </h3>
                    {skill.description && (
                      <p className="text-gray-700 text-sm mt-1">
                        {skill.description}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-gray-500 mb-4">
                      {skill.is_offered ? (
                        <span className="inline-block bg-green-200 text-green-800 px-2 py-0.5 rounded-full mr-2">
                          Offering
                        </span>
                      ) : (
                        <span className="inline-block bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full mr-2">
                          Learning
                        </span>
                      )}
                      {skill.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mr-1 mb-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto">
                    {skill.is_offered ? (
                      <button
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
                        onClick={() => handleRequestSession(skill.name)}
                      >
                        Request Session
                      </button>
                    ) : (
                      <button
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-sm"
                        onClick={() => handleOfferToTeach(skill.name)}
                      >
                        Offer to Teach
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Groups</h2>
          {user.groups.length === 0 ? (
            <p className="text-gray-600">Not a member of any groups yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-gray-50 p-4 rounded-md border border-gray-200"
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    {group.name}
                  </h3>
                  <p className="text-gray-700 text-sm mt-1">
                    {group.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {group.memberCount} Members
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
