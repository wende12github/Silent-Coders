import Button from "../components/ui/Button";
import { Input, Label, Textarea } from "../components/ui/Form";
import {
  CreateGroupRequest,
  createGroup,
  fetchMyGroups,
  fetchAllGroups,
  AllGroups,
  joinGroup,
} from "../services/groups";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const GroupsPage = () => {
  const navigate = useNavigate();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: "",
    description: "",
  });
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [myGroupData, setMyGroupData] = useState<AllGroups[] | null>(null);
  const [isLoadingMyGroups, setIsLoadingMyGroups] = useState(false);
  const [errorMyGroups, setErrorMyGroups] = useState<string | null>(null);

  const [allGroupData, setAllGroupData] = useState<AllGroups[] | null>(null);
  const [isLoadingAllGroups, setIsLoadingAllGroups] = useState(false);
  const [errorAllGroups, setErrorAllGroups] = useState<string | null>(null);

  const [currentPage] = useState(1);
  const [joinStates, setJoinStates] = useState<Record<number, string>>({});
  useEffect(() => {
    const loadMyGroups = async () => {
      setIsLoadingMyGroups(true);
      setErrorMyGroups(null);
      try {
        const data = await fetchMyGroups(undefined, currentPage);
        setMyGroupData(data);
      } catch (err: any) {
        console.error("Error fetching my groups:", err);
        setErrorMyGroups(err.message || "Failed to fetch your groups.");
      } finally {
        setIsLoadingMyGroups(false);
      }
    };

    loadMyGroups();
  }, [currentPage, successMessage]);

  useEffect(() => {
    const loadAllGroups = async () => {
      setIsLoadingAllGroups(true);
      setErrorAllGroups(null);
      try {
        const data = await fetchAllGroups(undefined, currentPage);
        setAllGroupData(data);
      } catch (err: any) {
        console.error("Error fetching all groups:", err);
        setErrorAllGroups(err.message || "Failed to fetch all groups.");
      } finally {
        setIsLoadingAllGroups(false);
      }
    };

    loadAllGroups();
  }, [currentPage, successMessage]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError("Group Name is required.");
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Description is required.");
      return;
    }

    setIsCreatingGroup(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const createdGroup = await createGroup(formData);
      setSuccessMessage(`Group "${createdGroup.name}" created successfully!`);
      setFormData({ name: "", description: "" });
      setIsFormVisible(false);
    } catch (err: any) {
      console.error("Error creating group:", err);
      setFormError(err.message || "Failed to create group");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleGroupJoin = async (groupId: number) => {
    setJoinStates((prev) => ({ ...prev, [groupId]: "loading" }));
    try {
      await joinGroup(groupId);
      setJoinStates((prev) => ({ ...prev, [groupId]: "success" }));
      navigate(`/groups/${groupId}`);
    } catch (error) {
      console.error("Join failed:", error);
      setJoinStates((prev) => ({ ...prev, [groupId]: "error" }));
    }
  };

  const renderListContent = (
    isLoading: boolean,
    error: string | null,
    data: any[] | null,
    renderItems: (data: any[]) => React.ReactNode,
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
    return renderItems(data);
  };

  return (
    <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground dark:text-foreground-dark">
            Browse Groups
          </h1>
          <div className="relative">
            <Button onClick={() => setIsFormVisible(!isFormVisible)}>
              {isFormVisible ? "Cancel" : "Create New Group"}
            </Button>
            {isFormVisible && (
              <form
                onSubmit={handleSubmit}
                className="absolute z-10 top-full right-0 mt-2 shadow-lg rounded-md p-6 w-80
                           bg-card text-card-foreground border border-border
                           dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
              >
                <h3 className="text-xl font-semibold text-foreground dark:text-foreground-dark mb-4">
                  Create Group
                </h3>
                <div className="mb-4">
                  <Label htmlFor="name">Group Name:</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={
                      formError && formData.name.trim() === ""
                        ? "border-destructive dark:border-destructive-dark"
                        : ""
                    }
                  />
                  {formError && formData.name.trim() === "" && (
                    <p className="text-destructive dark:text-destructive-dark text-xs mt-1">
                      {formError}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <Label htmlFor="description">Description:</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className={
                      formError && formData.description.trim() === ""
                        ? "border-destructive dark:border-destructive-dark"
                        : ""
                    }
                  />
                  {formError && formData.description.trim() === "" && (
                    <p className="text-destructive dark:text-destructive-dark text-xs mt-1">
                      {formError}
                    </p>
                  )}
                </div>
                {formError && !isCreatingGroup && (
                  <p className="text-destructive dark:text-destructive-dark text-sm mb-4">
                    {formError}
                  </p>
                )}
                {successMessage && (
                  <p className="text-green-600 dark:text-green-400 text-sm mb-4">
                    {successMessage}
                  </p>
                )}
                <Button type="submit" disabled={isCreatingGroup}>
                  {isCreatingGroup ? "Creating..." : "Create Group"}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground dark:text-foreground-dark mb-6">
            My Groups
          </h2>
          {renderListContent(
            isLoadingMyGroups,
            errorMyGroups,
            myGroupData,
            (groups) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="p-6 rounded-lg shadow-md flex flex-col justify-between
                               bg-card text-card-foreground border border-border
                               dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dar"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-foreground dark:text-foreground-dark mb-2">
                        {group.name}
                      </h3>
                      <p className="text-muted-foreground dark:text-muted-foreground-dark text-sm mb-4">
                        {group.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground dark:text-muted-foreground-dark mt-auto">
                      <Link to={`/groups/${group.id}`}>
                        <Button variant="secondary" size="sm">
                          View Group
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ),
            "You are not a member of any groups yet."
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-foreground dark:text-foreground-dark mb-6">
            All Groups
          </h2>
          {renderListContent(
            isLoadingAllGroups,
            errorAllGroups,
            allGroupData,
            (groups) => {
              const filteredGroups = groups.filter((group) => {
                const isMyGroup = myGroupData?.some(
                  (myGroup) => myGroup.id === group.id
                );

                return !isMyGroup;
              });

              if (filteredGroups.length === 0) {
                return (
                  <div className="text-center py-4 text-muted-foreground dark:text-muted-foreground-dark text-sm">
                    No groups available for you to join.
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGroups.map((group) => (
                    <div
                      key={group.id}
                      className="p-6 rounded-lg shadow-md flex flex-col justify-between
                                 bg-card text-card-foreground border border-border
                                 dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
                    >
                      <div className="flex flex-col gap-1">
                        <h3 className="text-xl font-semibold text-foreground dark:text-foreground-dark mb-2">
                          {group.name}
                        </h3>
                        <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
                          {group.description}
                        </p>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark mt-2">
                          Members: {group.member_count}
                        </p>
                      </div>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleGroupJoin(group.id)}
                          disabled={joinStates[group.id] === "loading"}
                        >
                          {joinStates[group.id] === "loading"
                            ? "Joining..."
                            : "Join Group"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            },

            // Fallback content if no groups are available
            "No groups available for you to join."
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
