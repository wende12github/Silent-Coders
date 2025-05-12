import React from "react";
import { Search, Filter, MapPin } from "lucide-react";
import { Input, Label } from "../ui/Form";
import { Select, SelectItem } from "../ui/Select";
import Button from "../ui/Button";

interface SkillSearchAndFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  locationFilter: string;
  showFilters: boolean;
  tags: string[];
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onToggleFilters: () => void;
}

const SkillSearchAndFilters: React.FC<SkillSearchAndFiltersProps> = ({
  searchTerm,
  selectedCategory,
  locationFilter,
  showFilters,
  tags,
  onSearchChange,
  onCategoryChange,
  onLocationChange,
  onToggleFilters,
}) => {
  return (
    <div
      className="px-4 py-4 shadow-sm sm:sticky sm:top-0 z-10 mb-6
                    bg-background text-foreground border-b border-border
                    dark:bg-background-dark dark:text-foreground-dark dark:border-border-dark"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Input
              icon={
                <Search className="h-5 w-5 text-muted-foreground dark:text-muted-foreground-dark" />
              }
              type="text"
              placeholder="Search for skills..."
              className="w-full"
              value={searchTerm}
              onChange={onSearchChange}
            />
          </div>
          <Button
            onClick={onToggleFilters}
            variant="outline"
            aria-expanded={showFilters}
            aria-controls="filters-area"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div
            id="filters-area"
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <Label
                htmlFor="category"
                className="block text-sm font-medium mb-1 text-foreground dark:text-foreground-dark"
              >
                Category
              </Label>
              <Select
                id="category"
                className="z-100"
                value={selectedCategory}
                onValueChange={onCategoryChange}
              >
                <SelectItem value="all">All Categories</SelectItem>
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
                className="block text-sm font-medium mb-1 text-foreground dark:text-foreground-dark"
              >
                Location
              </Label>
              <Select
                id="location"
                value={locationFilter}
                onValueChange={onLocationChange}
                icon={
                  <MapPin className="h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
                }
              >
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote Only</SelectItem>
                <SelectItem value="local">In-Person Only</SelectItem>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillSearchAndFilters;
