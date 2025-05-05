import { useEffect, useState } from "react";
import { BookOpen, Edit, Plus, Trash2, MapPin, Clock } from "lucide-react"; // Added Clock icon

import Tabs, { TabItem } from "../ui/Tabs";
import Button from "../ui/Button";

import Switch from "../ui/Switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Badge } from "../ui/Badge";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { Input, Label, Textarea } from "../ui/Form";
import { Skill } from "../../store/types";
import { TagInput } from "../skills/TagSelectInput";
import {
  createSkill,
  fetchMySkills,
  updateSkill,
  deleteSkill,
} from "../../services/skill";
import { toast } from "sonner";
import {
  Availability,
  fetchMyAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from "../../services/booking"; // Import new availability services
import { Select, SelectItem } from "../ui/Select"; // Import Select components

const MySkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false); // Renamed skill dialog state
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: "",
    description: "",
    is_offered: false,
    location: "local",
    address: null,
    tags: [],
    is_visible: true,
  });

  const [myAvailability, setMyAvailability] = useState<Availability[]>([]);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] =
    useState(false); // State for availability dialog
  const [editingAvailability, setEditingAvailability] =
    useState<Availability | null>(null); // State for availability being edited
  const [newAvailability, setNewAvailability] = useState({
    weekday: 0,
    start_time: "09:00",
    end_time: "17:00",
  });

  const weekdays = [
    { value: 0, label: "Monday" },
    { value: 1, label: "Tuesday" },
    { value: 2, label: "Wednesday" },
    { value: 3, label: "Thursday" },
    { value: 4, label: "Friday" },
    { value: 5, label: "Saturday" },
    { value: 6, label: "Sunday" },
  ];

  useEffect(() => {
    fetchMySkills()
      .then((fetchedSkills) => {
        setSkills(fetchedSkills);
      })
      .catch((error) => {
        console.error("Error fetching skills:", error);
        toast.error("Failed to fetch skills.");
        setSkills([]);
      });
  }, []); 

  // Fetch availability on component mount
  useEffect(() => {
    fetchMyAvailability()
      .then((availability) => {
        setMyAvailability(availability);
        console.log("Fetched availability:", availability);
      })
      .catch((error) => {
        console.error("Error fetching availability:", error);
        toast.error("Failed to fetch availability.");
        setMyAvailability([]);
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  const initialTags = [
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

  // Filter skills for tabs - based on the existing logic
  const offeredSkills = skills.filter((skill) => skill.is_offered);
  const neededSkills = skills.filter((skill) => !skill.is_offered);
  // Note: The current tabs show 'All', 'Local', 'Remote'. The logic inside
  // them seems to display offered skills filtered by location. This might
  // need adjustment based on desired behavior (e.g., "Local Skills" shows
  // *both* offered and needed skills that are local). For now, preserving
  // the existing rendering logic which seems to filter offered skills by location.

  const handleAddSkill = () => {
    // Check for availability before allowing skill creation if needed (original logic)
    if (myAvailability.length === 0 && newSkill.is_offered) {
      // Only check if offering
      toast.error(
        "Please add at least one availability slot before offering a skill."
      );
      return;
    }
    if (!newSkill.name?.trim()) {
      toast.error("Please enter a name for the skill.");
      return;
    }

    const skillPayload = {
      name: newSkill.name.trim(),
      description: newSkill.description?.trim() || "",
      is_offered: newSkill.is_offered || false,
      location: newSkill.location || "local",
      address:
        (newSkill.location === "local" ? newSkill.address?.trim() : null) ||
        null, // Only send address if location is local
      tags: newSkill.tags || [],
      is_visible: newSkill.is_visible ?? true,
    };

    createSkill(skillPayload)
      .then((response) => {
        toast.success("Skill created successfully!");
        setSkills([...skills, response]);

        setNewSkill({
          // Reset new skill form
          name: "",
          description: "",
          is_offered: false,
          location: "local",
          address: null,
          tags: [],
          is_visible: true,
        });
        setIsSkillDialogOpen(false); // Close skill dialog
      })
      .catch((error) => {
        console.error("Error creating skill:", error);
        toast.error(
          `Failed to create skill: ${error.message || "Unknown error"}`
        );
      });
  };

  const handleEditSkill = () => {
    if (!editingSkill || !editingSkill.name.trim()) {
      toast.error("Skill name cannot be empty.");
      return;
    }

    // Check for availability before allowing skill creation if needed (original logic)
    if (myAvailability.length === 0 && editingSkill.is_offered) {
      // Only check if offering
      toast.error(
        "Please add at least one availability slot before offering a skill."
      );
      return;
    }

    const skillPayload = {
      name: editingSkill.name.trim(),
      description: editingSkill.description?.trim() || "",
      is_offered: editingSkill.is_offered,
      location: editingSkill.location,
      address:
        (editingSkill.location === "local"
          ? editingSkill.address?.trim()
          : null) || null, // Only send address if location is local
      tags: editingSkill.tags,
      is_visible: editingSkill.is_visible ?? true,
    };

    updateSkill(editingSkill.id, skillPayload)
      .then((response) => {
        toast.success("Skill updated successfully!");

        const updatedSkills = skills.map((skill) =>
          skill.id === response.id ? response : skill
        );
        setSkills(updatedSkills);
        setEditingSkill(null); // Clear editing state
        setIsSkillDialogOpen(false); // Close skill dialog
      })
      .catch((error) => {
        console.error("Error updating skill:", error);
        toast.error(
          `Failed to update skill: ${error.message || "Unknown error"}`
        );
      });
  };

  const handleDeleteSkill = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) {
      return;
    }

    // Optimistically remove the skill from the UI
    const skillsAfterDelete = skills.filter((skill) => skill.id !== id);
    setSkills(skillsAfterDelete);
    toast.info("Deleting skill..."); // Show pending state

    deleteSkill(id)
      .then(() => {
        toast.success("Skill deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting skill:", error);
        toast.error(
          `Failed to delete skill: ${error.message || "Unknown error"}`
        );
        // If delete fails, revert the UI state (refetch or add back)
        // A full refetch is simpler for now:
        fetchMySkills()
          .then(setSkills)
          .catch(() => setSkills(skills)); // Revert or show error
      });
  };

  const openEditSkillDialog = (skill: Skill) => {
    // Renamed
    setEditingSkill(skill);
    setIsSkillDialogOpen(true);
  };

  const openAddSkillDialog = () => {
    // Renamed
    setEditingSkill(null); // Clear editing state

    setNewSkill({
      // Reset new skill form
      name: "",
      description: "",
      is_offered: false,
      location: "local",
      address: null,
      tags: [],
      is_visible: true,
    });
    setIsSkillDialogOpen(true); // Open skill dialog
  };

  // --- Availability Handlers ---

  const openAddAvailabilityDialog = () => {
    setEditingAvailability(null); // Clear editing state
    setNewAvailability({
      // Reset new availability form
      weekday: 0, // Monday
      start_time: "09:00",
      end_time: "17:00",
    });
    setIsAvailabilityDialogOpen(true); // Open availability dialog
  };

  const openEditAvailabilityDialog = (availability: Availability) => {
    setEditingAvailability(availability);
    // Set the form state based on the availability being edited
    setNewAvailability({
      weekday: availability.weekday,
      start_time: availability.start_time,
      end_time: availability.end_time,
    });
    setIsAvailabilityDialogOpen(true); // Open availability dialog
  };

  const handleSaveAvailability = async () => {
    // Determine if adding or editing
    const isEditing = editingAvailability !== null;

    // Get data from current form state (using newAvailability state)
    const payload = {
      weekday: newAvailability.weekday,
      start_time: newAvailability.start_time,
      end_time: newAvailability.end_time,
    };

    // Basic validation
    if (payload.start_time >= payload.end_time) {
      toast.error("Start time must be before end time.");
      return;
    }
    // Add more robust time format validation if needed

    try {
      if (isEditing && editingAvailability) {
        // Call the external updateAvailability function
        const updatedAvailability = await updateAvailability(
          editingAvailability.id,
          payload
        );
        toast.success("Availability updated successfully!");
        // Update the local state with the updated availability
        setMyAvailability(
          myAvailability.map((avail) =>
            avail.id === updatedAvailability.id ? updatedAvailability : avail
          )
        );
      } else {
        // Call the external createAvailability function
        const createdAvailability = await createAvailability(payload);
        toast.success("Availability added successfully!");
        // Add the new availability to the local state
        setMyAvailability([...myAvailability, createdAvailability]);
      }

      // Close dialog and reset state
      setIsAvailabilityDialogOpen(false);
      setEditingAvailability(null);
      setNewAvailability({
        weekday: 0,
        start_time: "09:00",
        end_time: "17:00",
      });

      // If adding availability, check if there are now slots for offering skills
      if (!isEditing && myAvailability.length === 0) {
        // Potentially re-evaluate the skills list or notify user they can now offer skills
        // For now, just showing a message.
        toast.info("You can now add skills you offer!");
      }
    } catch (error: any) {
      console.error("Error saving availability:", error);
      toast.error(
        `Failed to save availability: ${error.message || "Unknown error"}`
      );
    }
  };

  const handleDeleteAvailability = async (id: number) => {
    if (
      !window.confirm("Are you sure you want to delete this availability slot?")
    ) {
      return;
    }

    // Optimistically remove from UI
    const availabilityAfterDelete = myAvailability.filter(
      (avail) => avail.id !== id
    );
    setMyAvailability(availabilityAfterDelete);
    toast.info("Deleting availability...");

    try {
      // Call the external deleteAvailability function
      await deleteAvailability(id);
      toast.success("Availability deleted successfully!");
      // Check if there are now no availability slots left
      if (availabilityAfterDelete.length === 0) {
        toast.warning(
          "You have no availability slots. Skills you offer may not be bookable."
        );
      }
    } catch (error: any) {
      console.error("Error deleting availability:", error);
      toast.error(
        `Failed to delete availability: ${error.message || "Unknown error"}`
      );
      // Revert UI on failure
      fetchMyAvailability()
        .then(setMyAvailability)
        .catch(() => setMyAvailability(myAvailability)); // Revert or show error
    }
  };

  // Tabs definition (remains largely the same, filtering handled by state)
  const skillTabs: TabItem[] = [
    {
      value: "all",
      label: "All Skills",
      // Content logic remains as before, displaying all skills
      content: (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Display skills. Decide if you want to show *all* here, or filter offered/needed */}
          {/* Current logic shows only 'offeredSkills' in 'all' tab - this seems incorrect based on label*/}
          {/* Let's display ALL skills here, and filter in the other tabs */}
          {skills.length > 0 ? (
            skills.map(
              (
                skill // Use 'skills' array for 'all' tab
              ) => (
                <Card key={skill.id} className="">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between ">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center text-2xl font-semibold">
                          <BookOpen className="mr-2 h-4 w-4 text-blue-600" />
                          {skill.name}
                        </CardTitle>

                        <CardDescription className="flex items-center text-gray-600">
                          <MapPin className="mr-1 h-4 w-4 text-gray-500" />
                          {skill.location === "local"
                            ? `Local${
                                skill.address ? ` (${skill.address})` : ""
                              }`
                            : "Remote"}
                        </CardDescription>
                      </div>

                      <Badge
                        variant="outline"
                        className={
                          skill.is_offered
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-200 text-gray-900"
                        }
                      >
                        {skill.is_offered ? "Offering" : "Learning"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {skill.description || "No description provided."}
                    </p>
                  </CardContent>

                  <CardFooter className="flex flex-wrap gap-1 justify-end">
                    {skill.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </CardFooter>

                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditSkillDialog(skill)}
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSkill(skill.id)}
                    >
                      <Trash2 className="mr-2 h-3 w-3 text-red-600" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              )
            )
          ) : (
            <Card className="col-span-full py-10">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="h-10 w-10 text-gray-600 mb-4" />
                <p className="text-center text-gray-600 mb-4">
                  You don't have any skills added yet.
                </p>
                <Button onClick={openAddSkillDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ),
    },
    {
      value: "offering", // Changed value to 'offering' for clarity
      label: "Offering Skills", // Changed label
      content: (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offeredSkills.length > 0 ? (
            offeredSkills.map((skill) => (
              // Card rendering logic for offered skills
              <Card key={skill.id} className="">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between ">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center text-2xl font-semibold">
                        <BookOpen className="mr-2 h-4 w-4 text-blue-600" />
                        {skill.name}
                      </CardTitle>

                      <CardDescription className="flex items-center text-gray-600">
                        <MapPin className="mr-1 h-4 w-4 text-gray-500" />
                        {skill.location === "local"
                          ? `Local${skill.address ? ` (${skill.address})` : ""}`
                          : "Remote"}
                      </CardDescription>
                    </div>

                    <Badge
                      variant="outline"
                      className={"bg-blue-100 text-blue-600"} // Always offering in this tab
                    >
                      Offering
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {skill.description || "No description provided."}
                  </p>
                </CardContent>

                <CardFooter className="flex flex-wrap gap-1 justify-end">
                  {skill.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </Badge>
                  ))}
                </CardFooter>

                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditSkillDialog(skill)}
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSkill(skill.id)}
                  >
                    <Trash2 className="mr-2 h-3 w-3 text-red-600" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="col-span-full py-10">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="h-10 w-10 text-gray-600 mb-4" />
                <p className="text-center text-gray-600 mb-4">
                  You haven't added any skills you offer yet.
                </p>
                <Button onClick={openAddSkillDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ),
    },
    {
      value: "seeking", // Changed value to 'seeking' for clarity
      label: "Needed Skills", // Changed label
      content: (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {neededSkills.length > 0 ? (
            neededSkills.map((skill) => (
              // Card rendering logic for needed skills
              <Card key={skill.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center text-2xl font-semibold">
                        <BookOpen className="mr-2 h-4 w-4 text-blue-600" />
                        {skill.name}
                      </CardTitle>

                      <CardDescription className="flex items-center text-gray-600">
                        <MapPin className="mr-1 h-4 w-4 text-gray-500" />
                        {skill.location === "local"
                          ? `Local${skill.address ? ` (${skill.address})` : ""}`
                          : "Remote"}
                      </CardDescription>
                    </div>

                    <Badge
                      variant="outline"
                      className={"bg-gray-200 text-gray-900"} // Always learning in this tab
                    >
                      Learning
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {skill.description || "No description provided."}
                  </p>
                </CardContent>

                <CardFooter className="flex flex-wrap gap-1 justify-end">
                  {skill.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </Badge>
                  ))}
                </CardFooter>

                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditSkillDialog(skill)}
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSkill(skill.id)}
                  >
                    <Trash2 className="mr-2 h-3 w-3 text-red-600" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="col-span-full py-10">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="h-10 w-10 text-gray-600 mb-4" />
                <p className="text-center text-gray-600 mb-4">
                  You haven't added any skills you want to learn yet.
                </p>
                <Button onClick={openAddSkillDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-white h-full w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            My Skills & Availability
          </h1>
          <p className="text-gray-600">
            Manage your skills, whether you offer or want to learn them, and
            your availability.
          </p>
        </div>
        <div className="flex space-x-4">
          <Button onClick={openAddAvailabilityDialog} variant="secondary">
            <Clock className="mr-2 h-4 w-4" />
            Add Availability
          </Button>
          <Button onClick={openAddSkillDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </div>
      </div>

      {/* --- Availability Section --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">My Availability</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myAvailability.length > 0 ? (
            myAvailability.map((avail) => (
              <Card key={avail.id}>
                <CardContent className="flex justify-between items-center py-4!">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {weekdays[avail.weekday]?.label || "Unknown Day"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {avail.start_time} - {avail.end_time}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditAvailabilityDialog(avail)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAvailability(avail.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full py-6">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <Clock className="h-8 w-8 text-gray-600 mb-3" />
                <p className="text-center text-gray-600 mb-3">
                  You haven't added any availability yet.
                </p>
                <Button onClick={openAddAvailabilityDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Availability
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* --- End Availability Section --- */}

      <Tabs
        defaultValue="all"
        items={skillTabs}
        tabsListClassName="w-full grid grid-cols-3 gap-1 mb-6"
      />

      {/* Skill Add/Edit Dialog */}
      <Dialog
        open={isSkillDialogOpen}
        onOpenChange={setIsSkillDialogOpen}
        className="max-h-screen overflow-y-auto"
      >
        <div className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSkill ? "Edit Skill" : "Add New Skill"}
            </DialogTitle>
            <DialogDescription>
              {editingSkill
                ? "Update your skill details below."
                : "Add a new skill you offer or want to learn."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="skill-name">Skill Name</Label>
              <Input
                id="skill-name"
                placeholder="e.g., JavaScript Programming"
                value={editingSkill ? editingSkill.name : newSkill.name || ""}
                onChange={(e) =>
                  editingSkill
                    ? setEditingSkill({ ...editingSkill, name: e.target.value })
                    : setNewSkill({ ...newSkill, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="skill-description">Description (Optional)</Label>
              <Textarea
                id="skill-description"
                placeholder="Describe your skill or what you want to learn..."
                value={
                  editingSkill
                    ? editingSkill.description || ""
                    : newSkill.description || ""
                }
                onChange={(e) =>
                  editingSkill
                    ? setEditingSkill({
                        ...editingSkill,
                        description: e.target.value,
                      })
                    : setNewSkill({ ...newSkill, description: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="skill-type"
                checked={
                  editingSkill
                    ? editingSkill.is_offered
                    : newSkill.is_offered || false
                }
                onCheckedChange={(checked) =>
                  editingSkill
                    ? setEditingSkill({ ...editingSkill, is_offered: checked })
                    : setNewSkill({ ...newSkill, is_offered: checked })
                }
              />
              <Label htmlFor="skill-type">
                {editingSkill
                  ? editingSkill.is_offered
                    ? "I offer this skill"
                    : "I want to learn this skill"
                  : newSkill.is_offered
                  ? "I offer this skill"
                  : "I want to learn this skill"}
              </Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="skill-location">Mode</Label>
              {/* Using Shadcn Select for consistency */}
              <Select
                value={
                  editingSkill
                    ? editingSkill.location
                    : newSkill.location || "local"
                }
                onValueChange={(value: string) => {
                  const selectedLocation =
                    value === "remote" ? "remote" : "local";

                  if (editingSkill) {
                    setEditingSkill({
                      ...editingSkill,
                      location: selectedLocation,
                    });
                  } else {
                    setNewSkill({ ...newSkill, location: selectedLocation });
                  }
                }}
              >
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </Select>
            </div>

            {(editingSkill?.location === "local" ||
              newSkill.location === "local") && (
              <div className="grid gap-2">
                <Label htmlFor="skill-address">Address (Optional)</Label>
                <Input
                  id="skill-address"
                  placeholder="e.g., 123 Main St"
                  value={
                    editingSkill
                      ? editingSkill.address || ""
                      : newSkill.address || ""
                  }
                  onChange={(e) =>
                    editingSkill
                      ? setEditingSkill({
                          ...editingSkill,
                          address: e.target.value,
                        })
                      : setNewSkill({ ...newSkill, address: e.target.value })
                  }
                />
              </div>
            )}

            <div className="">
              <Label htmlFor="tags">Tags</Label>
              <TagInput
                initialTags={initialTags}
                selectedTags={
                  editingSkill ? editingSkill.tags : newSkill.tags || []
                }
                onSelectedTagsChange={(tags: string[]) =>
                  editingSkill
                    ? setEditingSkill({ ...editingSkill, tags })
                    : setNewSkill({ ...newSkill, tags })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="skill-visibility"
                checked={
                  editingSkill
                    ? editingSkill.is_visible ?? true
                    : newSkill.is_visible ?? true
                }
                onCheckedChange={(checked) =>
                  editingSkill
                    ? setEditingSkill({ ...editingSkill, is_visible: checked })
                    : setNewSkill({ ...newSkill, is_visible: checked })
                }
              />
              <Label htmlFor="skill-visibility">
                {editingSkill
                  ? editingSkill.is_visible
                    ? "Skill is visible"
                    : "Skill is hidden"
                  : newSkill.is_visible
                  ? "Skill will be visible"
                  : "Skill will be hidden"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSkillDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button onClick={editingSkill ? handleEditSkill : handleAddSkill}>
              {editingSkill ? "Save Changes" : "Add Skill"}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>

      {/* Availability Add/Edit Dialog */}
      <Dialog
        open={isAvailabilityDialogOpen}
        onOpenChange={setIsAvailabilityDialogOpen}
        className="max-h-screen"
      >
        <div className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingAvailability
                ? "Edit Availability"
                : "Add New Availability Slot"}
            </DialogTitle>
            <DialogDescription>
              {editingAvailability
                ? "Update your availability slot details below."
                : "Add a new time slot when you are available."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="availability-weekday">Day of the Week</Label>
              {/* Using Shadcn Select for consistency */}
              <Select
                value={newAvailability.weekday.toString()} // Select value should be string
                onValueChange={(value) =>
                  setNewAvailability({
                    ...newAvailability,
                    weekday: Number(value),
                  })
                }
              >
                {weekdays.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="availability-start-time">Start Time</Label>
                <Input
                  id="availability-start-time"
                  type="time" // Use type="time" for time input
                  value={newAvailability.start_time}
                  onChange={(e) =>
                    setNewAvailability({
                      ...newAvailability,
                      start_time: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="availability-end-time">End Time</Label>
                <Input
                  id="availability-end-time"
                  type="time" // Use type="time" for time input
                  value={newAvailability.end_time}
                  onChange={(e) =>
                    setNewAvailability({
                      ...newAvailability,
                      end_time: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAvailabilityDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button onClick={handleSaveAvailability}>
              {editingAvailability ? "Save Changes" : "Add Slot"}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
};

export default MySkills;
