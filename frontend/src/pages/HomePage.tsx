import { useEffect, useState, useCallback, useMemo } from "react";
import { Calendar } from "lucide-react";

import UserSkillCard from "../components/users/UserSkillCard.tsx";
import Tabs, { TabItem } from "../components/ui/Tabs.tsx";
import BookingModal from "../components/skills/BookingFlowModal.tsx";
import SkillSearchAndFilters from "../components/skills/SkillSearch";
import Button from "../components/ui/Button.tsx";

import { Skill } from "../store/types";
import { fetchAllTags, fetchSkills } from "../services/skill";

import useBookingFlow from "../hooks/useBookingFlow";

interface LocalFetchSkillsParams {
  search?: string | null;
  tags?: string | string[] | null;
  user_id?: number | null;
  is_offered?: boolean | null;
  page?: number;
  page_size?: number;
  location?: string | null;
}

const HomePage = () => {
  const {
    showAvailabilityModal,
    viewingUserId,
    viewingUserAvailability,
    selectedAvailabilitySlot,
    bookingDuration,
    initialMessage,
    isBookingLoading,
    nextSessionDateTime,
    minimumBookingDuration,
    weekdays,
    handleRequestSession,
    handleSelectAvailability,
    handleBookingDurationChange,
    handleInitialMessageChange,
    handleCreateBooking,
    handleCloseModal,
  } = useBookingFlow();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const [fetchParams, setFetchParams] = useState<LocalFetchSkillsParams>({
    search: null,
    tags: null,
    user_id: null,
    is_offered: null,
    page: 1,
    page_size: 12,
    location: null,
  });

  const [displayedSkills, setDisplayedSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);

  useEffect(() => {
    const loadSkills = async () => {
      setIsLoading(true);
      try {
        const fetchedSkillsResponse = await fetchSkills(fetchParams);
        console.log("Fetched skills:", fetchedSkillsResponse);

        setDisplayedSkills(fetchedSkillsResponse.results);
        setCount(fetchedSkillsResponse.count);
        setNext(fetchedSkillsResponse.next);
        setPrevious(fetchedSkillsResponse.previous);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
        setDisplayedSkills([]);
        setCount(0);
        setNext(null);
        setPrevious(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSkills();
  }, [fetchParams]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);

      const timeoutId = setTimeout(() => {
        setFetchParams((prevParams) => ({
          ...prevParams,
          search: term || null,
          page: 1,
        }));
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    []
  );

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
    setFetchParams((prevParams) => ({
      ...prevParams,
      tags: value === "all" ? null : value,
      page: 1,
    }));
  }, []);

  const handleLocationChange = useCallback((value: string) => {
    setLocationFilter(value);
    setFetchParams((prevParams) => ({
      ...prevParams,
      location: value === "all" ? null : value,
      page: 1,
    }));
  }, []);

  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  const handlePreviousPage = useCallback(() => {
    if (previous) {
      setFetchParams((prevParams) => ({
        ...prevParams,
        page: prevParams.page ? prevParams.page - 1 : 1,
      }));
    }
  }, [previous]);

  const handleNextPage = useCallback(() => {
    if (next) {
      setFetchParams((prevParams) => ({
        ...prevParams,
        page: prevParams.page ? prevParams.page + 1 : 1,
      }));
    }
  }, [next]);

  const skillTabs: TabItem[] = useMemo(
    () => [
      {
        value: "all",
        label: "All Skills",
        content: null,
      },
      {
        value: "offering",
        label: "Offered Skills",
        content: null,
      },
      {
        value: "seeking",
        label: "Needed Skills",
        content: null,
      },
    ],
    []
  );

  useEffect(() => {
    const fetchTags = async () => {
      const tags = await fetchAllTags();

      setTags(tags.map((t) => t.name));
    };
    fetchTags();
  }, []);

  const handleTabChange = useCallback((val: string) => {
    setFetchParams((prev) => ({
      ...prev,
      is_offered: val === "all" ? null : val === "offering" ? true : false,
      page: 1,
    }));
  }, []);

  return (
    <div className="min-h-full flex-grow mb-10 bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark">
      <SkillSearchAndFilters
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        locationFilter={locationFilter}
        showFilters={showFilters}
        tags={tags}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onLocationChange={handleLocationChange}
        onToggleFilters={handleToggleFilters}
      />

      <div className="max-w-7xl mx-auto sm:px-4 px-2 sm:py-2 ">
        <Tabs
          defaultValue="all"
          items={skillTabs}
          tabsListClassName="mb-4"
          onTabChange={handleTabChange}
        />

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground dark:text-muted-foreground-dark">
            Loading skills...
          </div>
        ) : displayedSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedSkills.map((sk) => (
              <UserSkillCard
                key={sk.id}
                skill={sk}
                onRequestSession={() => handleRequestSession(sk)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground dark:text-muted-foreground-dark">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground dark:text-muted-foreground-dark" />
            <h3 className="mt-2 text-lg font-medium text-foreground dark:text-foreground-dark">
              No skills found
            </h3>
            <p className="mt-1 text-muted-foreground dark:text-muted-foreground-dark">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
          </div>
        )}

        {fetchParams?.page_size && count > fetchParams?.page_size && (
          <div className="flex justify-center mt-8 space-x-4">
            <Button
              onClick={handlePreviousPage}
              disabled={!previous || isLoading}
              variant="outline"
            >
              Previous Page
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={!next || isLoading}
              variant="outline"
            >
              Next Page
            </Button>
          </div>
        )}
      </div>

      <BookingModal
        open={showAvailabilityModal}
        onOpenChange={handleCloseModal}
        viewingUserId={viewingUserId}
        viewingUserAvailability={viewingUserAvailability}
        selectedAvailabilitySlot={selectedAvailabilitySlot}
        bookingDuration={bookingDuration}
        initialMessage={initialMessage}
        isBookingLoading={isBookingLoading}
        nextSessionDateTime={nextSessionDateTime}
        onSelectAvailability={handleSelectAvailability}
        onBookingDurationChange={handleBookingDurationChange}
        onInitialMessageChange={handleInitialMessageChange}
        onCreateBooking={handleCreateBooking}
        minimumBookingDuration={minimumBookingDuration}
        weekdays={weekdays}
      />
    </div>
  );
};

export default HomePage;
