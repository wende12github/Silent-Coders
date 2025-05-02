import { useState } from "react";
import { BookOpen, Edit, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
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
import { useAuthStore } from "../../store/authStore";
import { Skill } from "../../store/types";
import { TagInput } from "../skills/TagSelectInput";

const MySkills = () => {
  const { skills: initialSkills } = useAuthStore();
  const [skills, setSkills] = useState(initialSkills);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: "",
    description: "",
    is_offered: true,
    tags: [],
  });

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

  const offeredSkills = skills.filter((skill) => skill.is_offered);
  const wantedSkills = skills.filter((skill) => !skill.is_offered);

  const { user } = useAuthStore();
  const handleAddSkill = () => {
    if (!newSkill.name?.trim()) return;

    const skill: Skill = {
      id: skills.length > 0 ? Math.max(...skills.map((s) => s.id)) + 1 : 1,
      name: newSkill.name,
      user: user,
      description: newSkill.description || null,
      is_offered: newSkill.is_offered || true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [],
      location: "local",
    };

    setSkills([...skills, skill]);
    setNewSkill({
      name: "",
      description: "",
      is_offered: true,
      tags: [],
    });
    setIsDialogOpen(false);
  };

  const handleEditSkill = () => {
    if (!editingSkill || !editingSkill.name.trim()) return;

    const updatedSkills = skills.map((skill) =>
      skill.id === editingSkill.id
        ? {
            ...editingSkill,
            updated_at: new Date().toISOString(),
          }
        : skill
    );

    setSkills(updatedSkills);
    setEditingSkill(null);
    setIsDialogOpen(false);
  };

  const handleDeleteSkill = (id: number) => {
    // send api request to delete skill
    setSkills(skills.filter((skill) => skill.id !== id));
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
      is_offered: true,
      tags: [],
    });
    setIsDialogOpen(true);
  };

  const skillTabs: TabItem[] = [
    {
      value: "offered",
      label: "Skills I Offer",
      content:
        offeredSkills.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offeredSkills.map((skill) => (
              <Card key={skill.id} className="">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between ">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center text-2xl font-semibold">
                        <BookOpen className="mr-2 h-4 w-4 text-blue-600" />

                        {skill.name}
                      </CardTitle>
                      <CardDescription>
                        Added on{" "}
                        {format(new Date(skill.created_at), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-600"
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
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <BookOpen className="h-10 w-10 text-gray-600 mb-4" />

              <p className="text-center text-gray-600 mb-4">
                You haven't added any skills that you offer yet.
              </p>
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Skill
              </Button>
            </CardContent>
          </Card>
        ),
    },
    {
      value: "wanted",
      label: "Skills I Want to Learn",
      content:
        wantedSkills.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wantedSkills.map((skill) => (
              <Card key={skill.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center text-2xl font-semibold">
                        <BookOpen className="mr-2 h-4 w-4 text-blue-600" />

                        {skill.name}
                      </CardTitle>
                      <CardDescription>
                        Added on{" "}
                        {format(new Date(skill.created_at), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-gray-200 text-gray-900"
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
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <BookOpen className="h-10 w-10 text-gray-600 mb-4" />

              <p className="text-center text-gray-600 mb-4">
                You haven't added any skills that you want to learn yet.
              </p>
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Skill
              </Button>
            </CardContent>
          </Card>
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
            Manage the skills you offer and want to learn
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </div>

      <Tabs
        defaultValue="offered"
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
              : "Add a new skill that you offer or want to learn."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="skill-name">Skill Name</Label>

            <Input
              id="skill-name"
              placeholder="e.g., JavaScript Programming"
              value={editingSkill ? editingSkill.name : newSkill.name}
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
              id="skill-type"
              checked={
                editingSkill ? editingSkill.is_offered : newSkill.is_offered
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
