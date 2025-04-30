import { useState } from "react";
import { Search, Calendar, Filter, MapPin } from "lucide-react";
import UserSkillCard, { Skill } from "../components/users/UserSkillCard.tsx";

// Mock data for skills
const mockSkills: Skill[] = [
  {
    id: "1",
    user: {
      id: "user-123",
      name: "John Doe",
      profilePicture:
        "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    title: "JavaScript Development",
    description:
      "Front-end web development with a focus on React and modern JavaScript",
    type: "offering",
    credits: 3,
    location: "Remote",
    tags: ["Tech", "Programming", "Web"],
  },
  {
    id: "2",
    user: {
      id: "user-456",
      name: "Jane Smith",
      profilePicture:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    title: "Yoga Instruction",
    description:
      "Beginner to intermediate yoga lessons focusing on proper form and mindfulness",
    type: "offering",
    credits: 2,
    location: "Local",
    tags: ["Fitness", "Wellness", "Health"],
  },
  {
    id: "3",
    user: {
      id: "user-789",
      name: "Michael Brown",
      profilePicture:
        "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    title: "Guitar Lessons",
    description:
      "Acoustic and electric guitar instruction for beginners, focus on basic chords and melodies",
    type: "offering",
    credits: 2,
    location: "Local",
    tags: ["Music", "Arts", "Learning"],
  },
  {
    id: "4",
    user: {
      id: "user-101",
      name: "Emily Wilson",
      profilePicture:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    title: "Graphic Design",
    description:
      "Logo design, branding materials, and digital illustrations for personal or small business use",
    type: "offering",
    credits: 4,
    location: "Remote",
    tags: ["Design", "Creative", "Business"],
  },
  {
    id: "5",
    user: {
      id: "user-202",
      name: "David Lee",
      profilePicture:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    title: "Spanish Tutoring",
    description:
      "Conversational Spanish lessons for beginners, focus on practical vocabulary and grammar",
    type: "seeking",
    credits: 2,
    location: "Remote",
    tags: ["Languages", "Education", "Communication"],
  },
  {
    id: "6",
    user: {
      id: "user-303",
      name: "Sarah Johnson",
      profilePicture:
        "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    title: "Photography Basics",
    description:
      "Learn composition, lighting, and basic editing techniques for digital photography",
    type: "seeking",
    credits: 3,
    location: "Local",
    tags: ["Photography", "Arts", "Creative"],
  },
];

// Filter categories
const categories = [
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
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'offering', 'seeking'
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [locationFilter, setLocationFilter] = useState("all"); // 'all', 'remote', 'local'
  const [showFilters, setShowFilters] = useState(false);

  // Filter skills based on active tab, search term, and filters
  const filteredSkills = mockSkills.filter((skill) => {
    // Filter by tab
    if (activeTab === "offering" && skill.type !== "offering") return false;
    if (activeTab === "seeking" && skill.type !== "seeking") return false;

    // Filter by search term
    if (
      searchTerm &&
      !skill.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !skill.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Filter by category
    if (selectedCategory !== "All" && !skill.tags.includes(selectedCategory)) {
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

  return (
    <div className="min-h-full bg-gray-50">
      {/* Search bar and filters */}
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

          {/* Tabs */}
          <div className="mt-4 flex space-x-4 border-b border-gray-200">
            <button
              className={`pb-2 px-1 text-sm font-medium ${
                activeTab === "all"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All Skills
            </button>
            <button
              className={`pb-2 px-1 text-sm font-medium ${
                activeTab === "offering"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("offering")}
            >
              Offered Skills
            </button>
            <button
              className={`pb-2 px-1 text-sm font-medium ${
                activeTab === "seeking"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("seeking")}
            >
              Needed Skills
            </button>
          </div>

          {/* Additional filters (hidden by default on mobile) */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Locations</option>
                    <option value="remote">Remote Only</option>
                    <option value="local">In-Person Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skills grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
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
    </div>
  );
};

export default HomePage;
