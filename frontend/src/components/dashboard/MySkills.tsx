import { useEffect, useState } from "react";
import {
  BookOpen,
  Edit,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Video,
} from "lucide-react";

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
import { Input, Label, RadioButton, Textarea } from "../ui/Form";
import { Availability, Skill, Tag } from "../../store/types";
import { TagInput } from "../skills/TagSelectInput";
import {
  createSkill,
  fetchMySkills,
  updateSkill,
  deleteSkill,
  fetchAllTags,
} from "../../services/skill";
import { toast } from "sonner";
import {
  fetchMyAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from "../../services/booking";
import { Select, SelectItem } from "../ui/Select";

const MySkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
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
    useState(false);
  const [editingAvailability, setEditingAvailability] =
    useState<Availability | null>(null);
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
        setSkills(fetchedSkills.results);
      })
      .catch((error) => {
        console.error("Error fetching skills:", error);
        toast.error("Failed to fetch skills.");
        setSkills([]);
      });
  }, []);

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
  }, []);
  const [initialTags, setInitialTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const fetchedTags = await fetchAllTags();
        setInitialTags(fetchedTags);
        console.log("Fetched tags:", fetchedTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchTags();
  }, [skills]);

  const offeredSkills = skills.filter((skill) => skill.is_offered);
  const neededSkills = skills.filter((skill) => !skill.is_offered);

  const handleAddSkill = () => {
    if (myAvailability.length === 0 && newSkill.is_offered) {
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
        null,
      tags: newSkill.tags || [],
      is_visible: newSkill.is_visible ?? true,
    };

    createSkill(skillPayload)
      .then((response) => {
        toast.success("Skill created successfully!");
        setSkills([...skills, response]);

        setNewSkill({
          name: "",
          description: "",
          is_offered: false,
          location: "local",
          address: null,
          tags: [],
          is_visible: true,
        });
        setIsSkillDialogOpen(false);
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

    if (myAvailability.length === 0) {
      toast.error(
        "Please add at least one availability slot before adding a skill."
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
          : null) || null,
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
        setEditingSkill(null);
        setIsSkillDialogOpen(false);
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

    const skillsAfterDelete = skills.filter((skill) => skill.id !== id);
    setSkills(skillsAfterDelete);
    toast.info("Deleting skill...");

    deleteSkill(id)
      .then(() => {
        toast.success("Skill deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting skill:", error);
        toast.error(
          `Failed to delete skill: ${error.message || "Unknown error"}`
        );

        fetchMySkills()
          .then((r) => setSkills(r.results))
          .catch(() => setSkills(skills));
      });
  };

  const openEditSkillDialog = (skill: Skill) => {
    setEditingSkill(skill);
    setIsSkillDialogOpen(true);
  };

  const openAddSkillDialog = () => {
    if (myAvailability.length === 0) {
      toast.error(
        "Please add at least one availability slot before adding a skill."
      );
      return;
    }

    setEditingSkill(null);

    setNewSkill({
      name: "",
      description: "",
      is_offered: false,
      location: "local",
      address: null,
      tags: [],
      is_visible: true,
    });
    setIsSkillDialogOpen(true);
  };

  const openAddAvailabilityDialog = () => {
    setEditingAvailability(null);
    setNewAvailability({
      weekday: 0,
      start_time: "09:00",
      end_time: "17:00",
    });
    setIsAvailabilityDialogOpen(true);
  };

  const openEditAvailabilityDialog = (availability: Availability) => {
    setEditingAvailability(availability);

    setNewAvailability({
      weekday: availability.weekday,
      start_time: availability.start_time,
      end_time: availability.end_time,
    });
    setIsAvailabilityDialogOpen(true);
  };

  const handleSaveAvailability = async () => {
    const isEditing = editingAvailability !== null;

    const payload = {
      weekday: newAvailability.weekday,
      start_time: newAvailability.start_time,
      end_time: newAvailability.end_time,
    };

    if (payload.start_time >= payload.end_time) {
      toast.error("Start time must be before end time.");
      return;
    }

    try {
      if (isEditing && editingAvailability) {
        const updatedAvailability = await updateAvailability(
          editingAvailability.id,
          payload
        );
        toast.success("Availability updated successfully!");

        setMyAvailability(
          myAvailability.map((avail) =>
            avail.id === updatedAvailability.id ? updatedAvailability : avail
          )
        );
      } else {
        const createdAvailability = await createAvailability(payload);
        toast.success("Availability added successfully!");

        setMyAvailability([...myAvailability, createdAvailability]);
      }

      setIsAvailabilityDialogOpen(false);
      setEditingAvailability(null);
      setNewAvailability({
        weekday: 0,
        start_time: "09:00",
        end_time: "17:00",
      });

      if (!isEditing && myAvailability.length === 0) {
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

    const availabilityAfterDelete = myAvailability.filter(
      (avail) => avail.id !== id
    );
    setMyAvailability(availabilityAfterDelete);
    toast.info("Deleting availability...");

    try {
      await deleteAvailability(id);
      toast.success("Availability deleted successfully!");

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

      fetchMyAvailability()
        .then(setMyAvailability)
        .catch(() => setMyAvailability(myAvailability));
    }
  };

  const skillTabs: TabItem[] = [
    {
      value: "all",
      label: "All Skills",

      content: (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <Card key={skill.id} className="">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between ">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center text-2xl font-semibold text-foreground dark:text-foreground-dark">
                        <BookOpen className="mr-2 h-4 w-4 text-primary dark:text-primary-dark" />
                        {skill.name}
                      </CardTitle>

                      <CardDescription className="flex items-center text-muted-foreground dark:text-muted-foreground-dark">
                          {skill.location === "remote" ? (
                            <Video className="mr-2 h-4 w-4 text-primary dark:text-primary-dark" />
                          ) : (
                            <MapPin className="mr-2 h-4 w-4 text-primary dark:text-primary-dark" />
                          )}
                          {skill.location === "remote"
                            ? "Online Meeting"
                            : skill.address && skill.address?.length > 0
                            ? skill.address
                            : "Local"}
                      </CardDescription>
                    </div>

                    <Badge
                      variant="outline"
                      className={
                        skill.is_offered
                          ? "bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark"
                          : "bg-secondary text-secondary-foreground dark:bg-secondary-dark dark:text-secondary-foreground-dark"
                      }
                    >
                      {skill.is_offered ? "Offering" : "Seeking"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                    {skill.description || "No description provided."}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {skill.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

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
                    <Trash2 className="mr-2 h-3 w-3 text-destructive dark:text-destructive-dark" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="col-span-full py-10">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="h-10 w-10 text-muted-foreground dark:text-muted-foreground-dark mb-4" />
                <p className="text-center text-muted-foreground dark:text-muted-foreground-dark mb-4">
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
      value: "offering",
      label: "Offering Skills",
      content: (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offeredSkills.length > 0 ? (
            offeredSkills.map((skill) => (
              <Card key={skill.id} className="">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between ">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center text-2xl font-semibold text-foreground dark:text-foreground-dark">
                        <BookOpen className="mr-2 h-4 w-4 text-primary dark:text-primary-dark" />
                        {skill.name}
                      </CardTitle>

                      <CardDescription className="flex items-center text-muted-foreground dark:text-muted-foreground-dark">
                        {skill.location === "remote" ? (
                          <Video className="mr-2 h-4 w-4 text-primary dark:text-primary-dark" />
                        ) : (
                          <MapPin className="mr-2 h-4 w-4 text-primary dark:text-primary-dark" />
                        )}
                        {skill.location === "remote"
                          ? "Online Meeting"
                          : skill.address}
                      </CardDescription>
                    </div>

                    <Badge
                      variant="outline"
                      className={
                        "bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark"
                      }
                    >
                      Offering
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                    {skill.description || "No description provided."}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {skill.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

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
                    <Trash2 className="mr-2 h-3 w-3 text-destructive dark:text-destructive-dark" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="col-span-full py-10">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="h-10 w-10 text-muted-foreground dark:text-muted-foreground-dark mb-4" />
                <p className="text-center text-muted-foreground dark:text-muted-foreground-dark mb-4">
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
      value: "seeking",
      label: "Needed Skills",
      content: (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {neededSkills.length > 0 ? (
            neededSkills.map((skill) => (
              <Card key={skill.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center text-2xl font-semibold text-foreground dark:text-foreground-dark">
                        <BookOpen className="mr-2 h-4 w-4 text-primary dark:text-primary-dark" />
                        {skill.name}
                      </CardTitle>

                      <CardDescription className="flex items-center text-muted-foreground dark:text-muted-foreground-dark">
                        {skill.location === "remote" ? (
                          <Video className="mr-2 h-4 w-4 text-primary dark:text-primary-dark" />
                        ) : (
                          <MapPin className="mr-2 h-4 w-4 text-primary dark:text-primary-dark" />
                        )}
                        {skill.location === "remote"
                          ? "Online Meeting"
                          : skill.address}
                      </CardDescription>
                    </div>

                    <Badge
                      variant="outline"
                      className={
                        "bg-secondary text-secondary-foreground dark:bg-secondary-dark dark:text-secondary-foreground-dark"
                      }
                    >
                      Learning
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                    {skill.description || "No description provided."}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {skill.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

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
                    <Trash2 className="mr-2 h-3 w-3 text-destructive dark:text-destructive-dark" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="col-span-full py-10">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="h-10 w-10 text-muted-foreground dark:text-muted-foreground-dark mb-4" />
                <p className="text-center text-muted-foreground dark:text-muted-foreground-dark mb-4">
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
    <div
      className="p-6 space-y-6 h-full w-full
                   bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-foreground-dark">
            My Skills & Availability
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark">
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

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground dark:text-foreground-dark">
          My Availability
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myAvailability.length > 0 ? (
            myAvailability.map((avail) => (
              <Card key={avail.id}>
                <CardContent className="flex justify-between items-center py-4!">
                  <div>
                    <p className="text-sm font-medium text-foreground dark:text-foreground-dark">
                      {weekdays[avail.weekday]?.label || "Unknown Day"}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                      {avail.start_time} - {avail.end_time}
                    </p>
                    <Badge variant={avail.is_booked ? "success" : "secondary"}>
                      {avail.is_booked ? "Booked" : "Free"}
                    </Badge>
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
                      <Trash2 className="h-3 w-3 text-destructive dark:text-destructive-dark" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full py-6">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <Clock className="h-8 w-8 text-muted-foreground dark:text-muted-foreground-dark mb-3" />
                <p className="text-center text-muted-foreground dark:text-muted-foreground-dark mb-3">
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

      <Tabs
        defaultValue="all"
        items={skillTabs}
        tabsListClassName="w-full grid grid-cols-3 gap-1 mb-6"
      />

      <Dialog
        open={isSkillDialogOpen}
        onOpenChange={setIsSkillDialogOpen}
        className="max-h-screen overflow-y-auto"
      >
        <div className="">
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
              <div>
                <div className="flex items-center space-x-2">
                  <RadioButton
                    id="skill-type-offer"
                    name="skillType"
                    value="offer"
                    checked={
                      editingSkill
                        ? editingSkill.is_offered === true
                        : newSkill.is_offered === true
                    }
                    onChange={(e) => {
                      const isOffered = e.target.value === "offer";
                      if (editingSkill) {
                        setEditingSkill({
                          ...editingSkill,
                          is_offered: isOffered,
                        });
                      } else {
                        setNewSkill({ ...newSkill, is_offered: isOffered });
                      }
                    }}
                  />
                  <Label htmlFor="skill-type-offer">I offer this skill</Label>
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <RadioButton
                    id="skill-type-learn"
                    name="skillType"
                    value="learn"
                    checked={
                      editingSkill
                        ? editingSkill.is_offered === false
                        : newSkill.is_offered === false
                    }
                    onChange={(e) => {
                      const isOffered = e.target.value === "offer";
                      if (editingSkill) {
                        setEditingSkill({
                          ...editingSkill,
                          is_offered: isOffered,
                        });
                      } else {
                        setNewSkill({ ...newSkill, is_offered: isOffered });
                      }
                    }}
                  />
                  <Label htmlFor="skill-type-learn">
                    I want to learn this skill
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="skill-location">Mode</Label>

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
                initialTags={initialTags ? initialTags.map((t) => t.name) : []}
                selectedTags={
                  editingSkill ? editingSkill.tags : newSkill.tags || []
                }
                showAddTag={editingSkill ? false : true}
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

      <Dialog
        open={isAvailabilityDialogOpen}
        onOpenChange={setIsAvailabilityDialogOpen}
        className="max-h-screen"
      >
        <div className="">
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

              <Select
                value={newAvailability.weekday.toString()}
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
                  type="time"
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
                  type="time"
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
