import Button from "../components/ui/Button";
import { Input, Label, Textarea } from "../components/ui/Form";
import {
  CreateGroupRequest,
  GroupResponse,
  createGroup,
  fetchMyGroups,
  fetchAllGroups, // Import fetchAllGroups
  AllGroups, // Import AllGroups type
} from "../services/groups";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const GroupsPage = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: "",
    description: "",
  });
  const [isCreatingGroup, setIsCreatingGroup] = useState(false); // Use more specific loading state
  const [formError, setFormError] = useState<string | null>(null); // State for form-specific errors
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [myGroupData, setMyGroupData] = useState<
    Omit<GroupResponse, "members">[] | null
  >(null);
  const [isLoadingMyGroups, setIsLoadingMyGroups] = useState(false); // Loading state for My Groups
  const [errorMyGroups, setErrorMyGroups] = useState<string | null>(null); // Error state for My Groups

  const [allGroupData, setAllGroupData] = useState<AllGroups[] | null>(null); // State for All Groups
  const [isLoadingAllGroups, setIsLoadingAllGroups] = useState(false); // Loading state for All Groups
  const [errorAllGroups, setErrorAllGroups] = useState<string | null>(null); // Error state for All Groups

  const [currentPage] = useState(1); // Assuming pagination is handled elsewhere or not needed for initial load

  // Fetch My Groups
  useEffect(() => {
    const loadMyGroups = async () => {
      setIsLoadingMyGroups(true);
      setErrorMyGroups(null);
      try {
        const data = await fetchMyGroups(currentPage);
        setMyGroupData(data);
      } catch (err: any) {
        console.error("Error fetching my groups:", err);
        setErrorMyGroups(err.message || "Failed to fetch your groups.");
      } finally {
        setIsLoadingMyGroups(false);
      }
    };

    loadMyGroups();
  }, [currentPage, successMessage]); // Refetch My Groups after a successful creation

  // Fetch All Groups
  useEffect(() => {
    const loadAllGroups = async () => {
      setIsLoadingAllGroups(true);
      setErrorAllGroups(null);
      try {
        const data = await fetchAllGroups(undefined, currentPage); // Fetch all groups, potentially add search/pagination later
        setAllGroupData(data);
      } catch (err: any) {
        console.error("Error fetching all groups:", err);
        setErrorAllGroups(err.message || "Failed to fetch all groups.");
      } finally {
        setIsLoadingAllGroups(false);
      }
    };

    loadAllGroups();
  }, [currentPage]); // Refetch All Groups on page change (if pagination is added)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear form error when input changes
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form Validation
    if (!formData.name.trim()) {
      setFormError("Group Name is required.");
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Description is required.");
      return;
    }

    setIsCreatingGroup(true);
    setFormError(null); // Clear previous form errors
    setSuccessMessage(null); // Clear previous success messages

    try {
      const createdGroup = await createGroup(formData);
      setSuccessMessage(`Group "${createdGroup.name}" created successfully!`);
      setFormData({ name: "", description: "" }); // Reset form
      setIsFormVisible(false); // Hide form on success
      // The useEffect for my groups will refetch automatically due to successMessage dependency
    } catch (err: any) {
      console.error("Error creating group:", err);
      setFormError(err.message || "Failed to create group"); // Use formError state
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Helper function to render loading/error/empty states for lists
  const renderListContent = (
    isLoading: boolean,
    error: string | null,
    data: any[] | null,
    renderItems: (data: any[]) => React.ReactNode,
    emptyMessage: string
  ) => {
    if (isLoading) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-4 text-red-500 text-sm">
          Error: {error}
        </div>
      );
    }
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          {emptyMessage}
        </div>
      );
    }
    return renderItems(data);
  };

  return (
    <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          {" "}
          {/* Added items-center for vertical alignment */}
          <h1 className="text-3xl font-bold text-gray-800">Browse Groups</h1>
          <div className="relative">
            {" "}
            {/* Keep relative for absolute form positioning */}
            <Button onClick={() => setIsFormVisible(!isFormVisible)}>
              {isFormVisible ? "Cancel" : "Create New Group"}
            </Button>
            {/* Create Group Form */}
            {isFormVisible && (
              <form
                onSubmit={handleSubmit}
                className="absolute z-10 top-full right-0 mt-2 shadow-lg rounded-md bg-white p-6 w-80" // Adjusted positioning and styling
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Create Group
                </h3>
                <div className="mb-4">
                  {" "}
                  {/* Use Tailwind classes for spacing */}
                  <Label htmlFor="name">Group Name:</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required // Add HTML required attribute
                    className={
                      formError && formData.name.trim() === ""
                        ? "border-red-500"
                        : ""
                    } // Add error border
                  />
                  {formError && formData.name.trim() === "" && (
                    <p className="text-red-500 text-xs mt-1">{formError}</p>
                  )}{" "}
                  {/* Display specific error */}
                </div>
                <div className="mb-4">
                  <Label htmlFor="description">Description:</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required // Add HTML required attribute
                    className={
                      formError && formData.description.trim() === ""
                        ? "border-red-500"
                        : ""
                    } // Add error border
                  />
                  {formError && formData.description.trim() === "" && (
                    <p className="text-red-500 text-xs mt-1">{formError}</p>
                  )}{" "}
                  {/* Display specific error */}
                </div>
                {formError && !isCreatingGroup && (
                  <p className="text-red-500 text-sm mb-4">{formError}</p>
                )}{" "}
                {/* Display general form error */}
                {successMessage && (
                  <p className="text-green-600 text-sm mb-4">
                    {successMessage}
                  </p>
                )}{" "}
                {/* Display success message */}
                <Button type="submit" disabled={isCreatingGroup}>
                  {isCreatingGroup ? "Creating..." : "Create Group"}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* My Groups Section */}
        <div className="mt-8">
          {" "}
          {/* Adjusted margin top */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Groups</h2>
          {renderListContent(
            isLoadingMyGroups,
            errorMyGroups,
            myGroupData,
            (groups) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(groups) &&
                  groups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {group.name}
                        </h3>
                        <p className="text-gray-700 text-sm mb-4">
                          {group.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                        {/* Assuming member_count is available on the Omit<GroupResponse, "members"> type if needed */}
                        {/* <span className="text-gray-600">{group.member_count} Members</span> */}
                        <Link to={`/groups/${group.id}`}>
                          {" "}
                          {/* Link to individual group page */}
                          <Button variant="secondary" size="sm">
                            View Group
                          </Button>{" "}
                          {/* Use a secondary button variant */}
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            ),
            "You are not a member of any groups yet."
          )}
        </div>

        {/* All Groups Section */}
        <div className="mt-10">
          {" "}
          {/* Added margin top */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">All Groups</h2>
          {renderListContent(
            isLoadingAllGroups,
            errorAllGroups,
            allGroupData,
            (groups) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(groups) &&
                  groups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {group.name}
                        </h3>
                        <p className="text-gray-700 text-sm mt-1">
                          {group.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Members: {group.member_count}
                        </p>
                      </div>
                      <div className="mt-auto">
                        {" "}
                        {/* Push button to the bottom */}
                        {/* Link to individual group page or a join button */}
                        <Link to={`/groups/${group.id}`}>
                          {" "}
                          {/* Link to individual group page */}
                          <Button size="sm">View Group</Button>{" "}
                          {/* Primary button for viewing/joining */}
                        </Link>
                        {/* You might add a Join button here conditionally */}
                      </div>
                    </div>
                  ))}
              </div>
            ),
            "No groups available."
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
