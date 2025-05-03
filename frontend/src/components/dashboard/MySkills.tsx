import { useEffect, useState } from "react";

import { BookOpen, Edit, Plus, Trash2, MapPin } from "lucide-react";

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

const MySkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const localSkills = skills.filter((skill) => skill.location === "local");
  const remoteSkills = skills.filter((skill) => skill.location === "remote");

  const handleAddSkill = () => {
    if (!newSkill.name?.trim()) {
      toast.error("Please enter a name for the skill.");
      return;
    }

    const skillPayload = {
      name: newSkill.name.trim(),
      description: newSkill.description?.trim() || "",
      is_offered: newSkill.is_offered || false,
      location: newSkill.location || "local",
      address: newSkill.address?.trim() || null,
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
        setIsDialogOpen(false);
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

    const skillPayload = {
      name: editingSkill.name.trim(),
      description: editingSkill.description?.trim() || "",
      is_offered: editingSkill.is_offered,
      location: editingSkill.location,
      address: editingSkill.address?.trim() || null,
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
        setIsDialogOpen(false);
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
      });
  };

  const openEditDialog = (skill: Skill) => {
    setEditingSkill(skill);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
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
    setIsDialogOpen(true);
  };

  const skillTabs: TabItem[] = [
    {
      value: "local",
      label: "Local Skills",
      content: (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {localSkills.length > 0 ? (
            localSkills.map((skill) => (
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
                  {" "}
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
                    onClick={() => openEditDialog(skill)}
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
            <Card className="col-span-full">
              {" "}
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="h-10 w-10 text-gray-600 mb-4" />
                <p className="text-center text-gray-600 mb-4">
                  You haven't added any local skills yet.
                </p>
                <Button onClick={openAddDialog}>
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
      value: "remote",
      label: "Remote Skills",
      content: (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {remoteSkills.length > 0 ? (
            remoteSkills.map((skill) => (
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
                  {" "}
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
                    onClick={() => openEditDialog(skill)}
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
            <Card className="col-span-full">
              {" "}
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="h-10 w-10 text-gray-600 mb-4" />
                <p className="text-center text-gray-600 mb-4">
                  You haven't added any remote skills yet.
                </p>
                <Button onClick={openAddDialog}>
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
            My Skills
          </h1>
          <p className="text-gray-600">
            Manage your skills and whether you offer or want to learn them
          </p>{" "}
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </div>

      <Tabs
        defaultValue="local"
        items={skillTabs}
        tabsListClassName="w-full grid grid-cols-2 gap-1 mb-6"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            <select
              id="skill-location"
              className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={
                editingSkill
                  ? editingSkill.location
                  : newSkill.location || "local"
              }
              onChange={(e) => {
                const location = e.target.value as "remote" | "local";
                if (editingSkill) {
                  setEditingSkill({ ...editingSkill, location });
                } else {
                  setNewSkill({ ...newSkill, location });
                }
              }}
            >
              <option value="local">Local</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          {(editingSkill?.location === "local" ||
            newSkill.location === "local") && (
            <>
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
            </>
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
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>

          <Button onClick={editingSkill ? handleEditSkill : handleAddSkill}>
            {editingSkill ? "Save Changes" : "Add Skill"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default MySkills;
