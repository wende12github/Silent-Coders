import Button from "../components/ui/Button";
import { Input, Label, Textarea } from "../components/ui/Form";
import {
  createGroup,
  fetchMyGroups,
  fetchAllGroups,
  joinGroup,
} from "../services/groups";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CreateGroupRequest,
  GroupListItem,
  PaginatedResponse,
} from "../store/types";

import { ImageUpload } from "../components/ImageUpload";

import PaginatedList from "../components/ui/PaginatedList";

const GroupsPage = () => {
  const navigate = useNavigate();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: "",
    description: "",
    image: undefined,
  });
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [myGroupsData, setMyGroupsData] =
    useState<PaginatedResponse<GroupListItem> | null>(null);
  const [isLoadingMyGroups, setIsLoadingMyGroups] = useState(false);
  // const [errorMyGroups, setErrorMyGroups] = useState<string | null>(null);
  const [myGroupsPage, setMyGroupsPage] = useState(1);
  const [myGroupsPageSize] = useState(10);

  const [allGroupsData, setAllGroupsData] =
    useState<PaginatedResponse<GroupListItem> | null>(null);
  const [isLoadingAllGroups, setIsLoadingAllGroups] = useState(false);
  // const [errorAllGroups, setErrorAllGroups] = useState<string | null>(null);
  const [allGroupsPage, setAllGroupsPage] = useState(1);
  const [allGroupsPageSize] = useState(10);

  const [joinStates, setJoinStates] = useState<Record<number, string>>({});

  useEffect(() => {
    const loadMyGroups = async () => {
      setIsLoadingMyGroups(true);
      // setErrorMyGroups(null);
      try {
        const data = await fetchMyGroups({
          page: myGroupsPage,
          page_size: myGroupsPageSize,
        });
        setMyGroupsData(data);
      } catch (err: any) {
        console.error("Error fetching my groups:", err);
        // setErrorMyGroups(err.message || "Failed to fetch your groups.");
        setMyGroupsData(null);
      } finally {
        setIsLoadingMyGroups(false);
      }
    };

    loadMyGroups();
  }, [myGroupsPage, myGroupsPageSize, successMessage]);

  useEffect(() => {
    const loadAllGroups = async () => {
      setIsLoadingAllGroups(true);
      // setErrorAllGroups(null);
      try {
        const data = await fetchAllGroups({
          page: allGroupsPage,
          page_size: allGroupsPageSize,
        });
        setAllGroupsData(data);
      } catch (err: any) {
        console.error("Error fetching all groups:", err);
        // setErr orAllGroups(err.message || "Failed to fetch all groups.");
        setAllGroupsData(null);
      } finally {
        setIsLoadingAllGroups(false);
      }
    };

    loadAllGroups();
  }, [allGroupsPage, allGroupsPageSize, successMessage]);

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

  const handleImageChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      image: file || undefined,
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
      const dataToSend: CreateGroupRequest = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
      };

      const createdGroup = await createGroup(dataToSend);

      setSuccessMessage(`Group "${createdGroup.name}" created successfully!`);
      setFormData({ name: "", description: "", image: undefined });
      setIsFormVisible(false);

      setMyGroupsPage(1);
      setAllGroupsPage(1);
    } catch (err: any) {
      console.error("Error creating group:", err);

      let errorMessage = "Failed to create group";
      if (err.response && err.response.data) {
        errorMessage =
          err.response.data.detail ||
          err.response.data.message ||
          JSON.stringify(err.response.data);
      } else {
        errorMessage = err.message || String(err);
      }
      setFormError(errorMessage);
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
    } catch (error: any) {
      console.error("Join failed:", error);
      let errorMessage = "Failed to join group";
      if (error.response && error.response.data) {
        errorMessage =
          error.response.data.detail ||
          error.response.data.message ||
          JSON.stringify(error.response.data);
      } else {
        errorMessage = error.message || String(error);
      }
      setJoinStates((prev) => ({ ...prev, [groupId]: "error" }));
    }
  };

  const renderGroupItem = (group: GroupListItem) => {
    const isMyGroup = myGroupsData?.results?.some(
      (myGroup) => myGroup.id === group.id
    );

    return (
      <div
        key={group.id}
        className="p-6 rounded-lg shadow-md flex flex-col justify-between
                         bg-card text-card-foreground border border-border
                         dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
      >
        <div className="flex flex-col gap-1">
          {group.image && (
            <img
              src={group.image}
              alt={group.name}
              className="w-full md:h-52 h-20 object-cover rounded-md mb-4"
            />
          )}
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
        <div className="mt-4">
          {isMyGroup ? (
            <Link to={`/groups/${group.id}`}>
              <Button variant="secondary" size="sm">
                View Group
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              onClick={() => handleGroupJoin(group.id)}
              disabled={joinStates[group.id] === "loading"}
            >
              {joinStates[group.id] === "loading"
                ? "Joining..."
                : joinStates[group.id] === "error"
                ? "Join Failed"
                : "Join Group"}
            </Button>
          )}
        </div>
      </div>
    );
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
            {/* Create Group Form */}
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
                {/* Image Upload Field */}
                <div className="mb-4 flex justify-center">
                  <ImageUpload
                    value={formData.image}
                    onChange={handleImageChange}
                  />
                </div>
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

        {/* My Groups Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground dark:text-foreground-dark mb-6">
            My Groups
          </h2>
          {/* Use PaginatedList for My Groups */}
          <PaginatedList<GroupListItem>
            data={myGroupsData}
            isLoading={isLoadingMyGroups}
            onPageChange={setMyGroupsPage}
            renderItem={renderGroupItem}
            emptyMessage="You are not a member of any groups yet."
            loadingMessage="Loading your groups..."
            listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            paginationClassName="flex justify-center mt-8 space-x-4"
          />
        </div>

        {/* All Groups Section */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-foreground dark:text-foreground-dark mb-6">
            All Groups
          </h2>
          {/* Use PaginatedList for All Groups */}
          <PaginatedList<GroupListItem>
            data={allGroupsData}
            isLoading={isLoadingAllGroups}
            onPageChange={setAllGroupsPage}
            renderItem={renderGroupItem}
            emptyMessage="No groups available for you to join."
            loadingMessage="Loading all groups..."
            listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            paginationClassName="flex justify-center mt-8 space-x-4"
          />
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
