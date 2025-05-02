import { useState } from "react";
import { Search, Calendar, Filter, MapPin } from "lucide-react";
import UserSkillCard from "../components/users/UserSkillCard.tsx";
import Tabs, { TabItem } from "../components/ui/Tabs.tsx";
import { Select, SelectItem } from "../components/ui/Select.tsx";
import { Label } from "../components/ui/Form.tsx";
import { mockSkills, Skill } from "../store/types.ts";

// Filter categories
const tags = [
  "All",
  "Tech",
  "Fitness",
  "Music",
  "Languages",
  "Design",
  "Business",
  "Art",
  "Cooking",
  "Health",
];

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // Removed activeTab state as Tabs component manages it internally
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [locationFilter, setLocationFilter] = useState("all"); // 'all', 'remote', 'local'
  const [showFilters, setShowFilters] = useState(false);

  // Filter skills based on active tab (passed from Tabs), search term, and filters
  const filterSkills = (skillsToFilter: Skill[], currentActiveTab: string) => {
    return skillsToFilter.filter((skill) => {
      // Filter by tab (using the activeTab value passed from Tabs)
      if (currentActiveTab === "offering" && skill.is_offered)
        return false;
      if (currentActiveTab === "seeking" && !skill.is_offered)
        return false;

      // Filter by search term
      if (
        searchTerm &&
        !skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !skill.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Filter by category
      if (
        selectedCategory !== "All" &&
        !skill.tags.includes(selectedCategory)
      ) {
        return false;
      }

      // Filter by location
      if (
        locationFilter !== "all" &&
        skill.location.toLowerCase() !== locationFilter
      ) {
        return false;
      }

      return true;
    });
  };

  // Define the items for the Tabs component
  const skillTabs: TabItem[] = [
    {
      value: "all",
      label: "All Skills",
      content: (
        <div className="max-w-7xl mx-auto px-4">
          {filterSkills(mockSkills, "all").length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterSkills(mockSkills, "all").map((skill) => (
                <UserSkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No skills found
              </h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      value: "offering",
      label: "Offered Skills",
      content: (
        <div className="max-w-7xl mx-auto px-4">
          {filterSkills(mockSkills, "offering").length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterSkills(mockSkills, "offering").map((skill) => (
                <UserSkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No offered skills found
              </h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      value: "seeking",
      label: "Needed Skills",
      content: (
        <div className="max-w-7xl mx-auto px-4">
          {filterSkills(mockSkills, "seeking").length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterSkills(mockSkills, "seeking").map((skill) => (
                <UserSkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No needed skills found
              </h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-full">
      <div className="bg-white px-4 py-4 shadow-sm sm:sticky sm:top-0 z-10 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for skills..."
                className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Additional filters (hidden by default on mobile) */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  {tags.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="location"
                  className="flex gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  Location
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"></div>
                  <Select
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                    icon={<MapPin className="h-4 w-4 text-gray-400" />}
                  >
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="remote">Remote Only</SelectItem>
                    <SelectItem value="local">In-Person Only</SelectItem>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto sm:px-4 px-2 sm:py-2">
        <Tabs
          defaultValue="all"
          items={skillTabs}
          tabsListClassName="sm:mb-4"
        />
      </div>
    </div>
  );
};

export default HomePage;
