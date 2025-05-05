import {
  useState,
  useRef,
  useEffect,
  FC,
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
} from "react";

interface TagInputProps {
  initialTags: string[];
  selectedTags: string[];
  onSelectedTagsChange: (tags: string[]) => void;
}

export const TagInput: FC<TagInputProps> = ({
  initialTags,
  selectedTags,
  onSelectedTagsChange,
}) => {
  const [inputValue, setInputValue] = useState<string>("");

  const [availableTags, setAvailableTags] = useState<string[]>(() => {
    const combinedTags = new Set([...initialTags, ...selectedTags]);
    return Array.from(combinedTags);
  });

  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const combinedTags = new Set([...initialTags, ...selectedTags]);
    setAvailableTags(Array.from(combinedTags));
  }, [initialTags, selectedTags]);

  const filteredSuggestions = availableTags.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedTags.includes(tag)
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside as any);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside as any);
    };
  }, [inputRef, suggestionsRef]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newSelectedTags = [...selectedTags, tag];
      onSelectedTagsChange(newSelectedTags);

      if (!availableTags.includes(tag)) {
        setAvailableTags([...availableTags, tag]);
      }
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const handleAddTag = () => {
    const trimmedTag = inputValue.trim();

    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      const newSelectedTags = [...selectedTags, trimmedTag];
      onSelectedTagsChange(newSelectedTags);

      if (!availableTags.includes(trimmedTag)) {
        setAvailableTags([...availableTags, trimmedTag]);
      }

      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newSelectedTags = selectedTags.filter((tag) => tag !== tagToRemove);
    onSelectedTagsChange(newSelectedTags);
    if (inputValue) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="w-full relative">
      <input
        ref={inputRef}
        type="text"
        id="tag-input-field"
        className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2
                   border border-input bg-background text-foreground focus:ring-ring focus:border-ring
                   dark:border-input-dark dark:bg-background-dark dark:text-foreground-dark dark:focus:ring-ring-dark dark:focus:border-ring-dark"
        placeholder="Search or add tags..."
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            handleAddTag();
          }
        }}
      />
      {showSuggestions && (inputValue || filteredSuggestions.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute w-full mt-1 rounded-md border shadow-lg z-20 max-h-60 overflow-auto
                     border-border bg-popover text-popover-foreground
                     dark:border-border-dark dark:bg-popover-dark dark:text-popover-foreground-dark"
        >
          {filteredSuggestions.map((tag) => (
            <div
              key={tag}
              className="px-3 py-2 cursor-pointer transition-colors
                         hover:bg-accent hover:text-accent-foreground
                         dark:hover:bg-accent-dark dark:hover:text-accent-foreground-dark"
              onClick={() => handleSelectTag(tag)}
            >
              {tag}
            </div>
          ))}

          {filteredSuggestions.length === 0 && inputValue.trim() !== "" && (
            <div
              className="px-3 py-2 cursor-pointer transition-colors font-medium
                         text-primary hover:bg-accent hover:text-primary-foreground
                         dark:text-primary-dark dark:hover:bg-accent-dark dark:hover:text-primary-foreground-dark"
              onClick={handleAddTag}
            >
              Add "{inputValue.trim()}"
            </div>
          )}
        </div>
      )}
      <div id="selected-tags-container" className="mt-3 flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
                       bg-secondary text-secondary-foreground
                       dark:bg-secondary-dark dark:text-secondary-foreground-dark"
          >
            {tag}
            <button
              type="button"
              className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center transition-colors
                         text-muted-foreground hover:bg-accent hover:text-accent-foreground
                         focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
                         dark:text-muted-foreground-dark dark:hover:bg-accent-dark dark:hover:text-accent-foreground-dark
                         dark:focus:ring-ring-dark dark:focus:ring-offset-background-dark"
              onClick={() => handleRemoveTag(tag)}
            >
              <span className="sr-only">Remove tag</span>
              <svg
                className="h-2 w-2"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 8 8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M1 1l6 6m0-6L1 7"
                />
              </svg>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
