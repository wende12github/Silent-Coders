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
    <div className="w-full">
      <input
        ref={inputRef}
        type="text"
        id="tag-input-field"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          className="tag-dropdown absolute w-3/4 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-60 overflow-auto"
        >
          {filteredSuggestions.map((tag) => (
            <div
              key={tag}
              className="px-3 py-2 cursor-pointer hover:bg-gray-200"
              onClick={() => handleSelectTag(tag)}
            >
              {tag}
            </div>
          ))}

          {filteredSuggestions.length === 0 && inputValue.trim() !== "" && (
            <div
              className="px-3 py-2 cursor-pointer hover:bg-gray-200 text-blue-600 font-medium"
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
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              type="button"
              className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
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
