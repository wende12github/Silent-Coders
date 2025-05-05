import { useEffect, useState, useCallback } from "react";
import { Calendar } from "lucide-react";
import UserSkillCard from "../components/users/UserSkillCard.tsx";
import Tabs, { TabItem } from "../components/ui/Tabs.tsx";
import { Skill } from "../store/types.ts";

import { fetchSkills, FetchSkillsParams } from "../services/skill.ts";
import {
  fetchUserAvailability,
  createBooking,
  getNextAvailabilityDateTime,
  formatToISOStringUTC,
  calculateDurationInMinutes,
} from "../services/booking.ts";
import axios from "axios";

import { useAuthStore } from "../store/authStore.ts";

import SkillSearchAndFilters from "../components/skills/SkillSearch";
import BookingModal from "../components/skills/BookingFlowModal.tsx";

const MINIMUM_BOOKING_DURATION = 30;

const HomePage = () => {
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [fetchParams, setFetchParams] = useState<FetchSkillsParams>({
    searchTerm: null,
    page: 1,
    type: null,
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [viewingUserId, setViewingUserId] = useState<number | null>(null);
  const [viewingUserAvailability, setViewingUserAvailability] = useState<any[]>(
    []
  );
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedAvailabilitySlot, setSelectedAvailabilitySlot] = useState<
    any | null
  >(null);
  const [bookingDuration, setBookingDuration] = useState<number | "">(
    MINIMUM_BOOKING_DURATION
  );
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingSkillId, setBookingSkillId] = useState<number>(0);
  const [nextSessionDateTime, setNextSessionDateTime] = useState<Date | null>(
    null
  );
  const [initialMessage, setInitialMessage] = useState("");

  useEffect(() => {
    const loadSkills = async () => {
      setIsLoading(true);
      try {
        const fetchedSkills = await fetchSkills(fetchParams);
        console.log("Fetched skills:", fetchedSkills);

        const clientFilteredSkills = fetchedSkills.results.filter((skill) => {
          if (
            selectedCategory !== "All" &&
            !(skill.tags as string[]).includes(selectedCategory)
          ) {
            return false;
          }

          if (
            locationFilter !== "all" &&
            skill.location?.toLowerCase() !== locationFilter
          ) {
            return false;
          }
          return true;
        });
        setSkills(clientFilteredSkills);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
        setSkills([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSkills();
  }, [fetchParams, selectedCategory, locationFilter]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);

      const debounceTimer = setTimeout(() => {
        setFetchParams((prevParams) => ({
          ...prevParams,
          searchTerm: term || null,
          page: 1,
        }));
      }, 300);
      return () => clearTimeout(debounceTimer);
    },
    [setFetchParams]
  );

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleLocationChange = (value: string) => {
    setLocationFilter(value);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleRequestSession = async (userId: number, skillId: number) => {
    setViewingUserId(userId);
    setBookingSkillId(skillId);
    setSelectedAvailabilitySlot(null);
    setBookingDuration(MINIMUM_BOOKING_DURATION);
    setInitialMessage("");
    setShowAvailabilityModal(true);
    setViewingUserAvailability([]);

    try {
      const availability = await fetchUserAvailability(userId);
      setViewingUserAvailability(availability);
    } catch (error) {
      console.error("Error fetching user availability:", error);
      setViewingUserAvailability([]);
    }
  };

  const handleSelectAvailability = (availability: any) => {
    setSelectedAvailabilitySlot(availability);
    const maxDuration = calculateDurationInMinutes(
      availability.start_time,
      availability.end_time
    );
    setBookingDuration(Math.min(MINIMUM_BOOKING_DURATION, maxDuration));
    const nextDateTime = getNextAvailabilityDateTime(
      availability.weekday,
      availability.start_time
    );
    setNextSessionDateTime(nextDateTime);
  };

  const handleBookingDurationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setBookingDuration(value === "" ? "" : Number(value));
  };

  const handleInitialMessageChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInitialMessage(e.target.value);
  };

  const handleCreateBooking = async () => {
    if (!selectedAvailabilitySlot || viewingUserId === null || user === null) {
      alert("Please select an availability slot and ensure you are logged in.");
      return;
    }

    setIsBookingLoading(true);

    const scheduledDateTime = getNextAvailabilityDateTime(
      selectedAvailabilitySlot.weekday,
      selectedAvailabilitySlot.start_time
    );

    const slotDurationMinutes = calculateDurationInMinutes(
      selectedAvailabilitySlot.start_time,
      selectedAvailabilitySlot.end_time
    );

    const currentBookingDuration = Number(bookingDuration);
    if (
      currentBookingDuration <= 0 ||
      currentBookingDuration < MINIMUM_BOOKING_DURATION ||
      currentBookingDuration > slotDurationMinutes ||
      isNaN(currentBookingDuration)
    ) {
      alert(
        `Please enter a valid duration (between ${MINIMUM_BOOKING_DURATION} and ${slotDurationMinutes} minutes).`
      );
      setIsBookingLoading(false);
      return;
    }

    const bookingData = {
      booked_for: viewingUserId,
      skill: bookingSkillId,
      scheduled_time: formatToISOStringUTC(scheduledDateTime),
      duration: currentBookingDuration,
      availability_id: selectedAvailabilitySlot.id,
    };
    console.log("Attempting to create booking with data:", bookingData);

    try {
      await createBooking(bookingData);

      const messageContent =
        initialMessage.trim() === "" ? "Hi" : initialMessage.trim();

      const messagePayload = {
        is_group_chat: false,
        message: messageContent,
        other_user_id: viewingUserId,
      };

      console.log("Attempting to send initial message:", messagePayload);
      await axios.post("/chatbot/sendMessage/", messagePayload);

      alert("Booking created and initial message sent successfully!");

      setShowAvailabilityModal(false);
      setSelectedAvailabilitySlot(null);
      setBookingDuration(MINIMUM_BOOKING_DURATION);
      setViewingUserId(null);
      setViewingUserAvailability([]);
      setBookingSkillId(0);
      setNextSessionDateTime(null);
      setInitialMessage("");
    } catch (error) {
      console.error("Error in handleCreateBooking or sending message:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || error.message;
        alert(`Error: ${errorMessage}`);
      } else {
        alert(`An unexpected error occurred: ${String(error)}`);
      }
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowAvailabilityModal(false);

    setSelectedAvailabilitySlot(null);
    setBookingDuration(MINIMUM_BOOKING_DURATION);
    setViewingUserId(null);
    setViewingUserAvailability([]);
    setBookingSkillId(0);
    setNextSessionDateTime(null);
    setInitialMessage("");
  };

  const skillTabs: TabItem[] = [
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
  ];

  return (
    <div className="min-h-full flex-grow">
      <SkillSearchAndFilters
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        locationFilter={locationFilter}
        showFilters={showFilters}
        tags={[
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
        ]}
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
          onTabChange={(val) =>
            setFetchParams((prev) => ({
              ...prev,
              type:
                val === "all"
                  ? null
                  : val === "seeking"
                  ? "requested"
                  : "offered",
              page: 1,
            }))
          }
        />

        {isLoading ? (
          <div className="text-center py-12 text-gray-600">
            Loading skills...
          </div>
        ) : skills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <UserSkillCard
                key={skill.id}
                skill={skill}
                onRequestSession={() =>
                  handleRequestSession(skill.user, skill.id)
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No skills found
            </h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
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
        minimumBookingDuration={MINIMUM_BOOKING_DURATION}
        weekdays={[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ]}
      />
    </div>
  );
};

export default HomePage;
