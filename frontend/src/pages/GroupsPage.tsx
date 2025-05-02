import Button from "../components/ui/Button";
import { mockGroups } from "../store/types";

const GroupsPage = () => {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Browse Groups
        </h1>
        {mockGroups.length === 0 ? (
          <p className="text-center text-gray-600">
            No groups available at this time.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockGroups.map((group) => (
              <div
                key={group.id} 
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {group.name}
                  </h2>
                  <p className="text-gray-700 text-sm mb-4">
                    {group.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                  <span>{group.memberCount} Members</span>
                  <Button>
                    View Group
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;
