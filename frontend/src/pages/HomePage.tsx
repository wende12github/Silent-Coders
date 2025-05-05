import { useEffect, useState, useCallback } from "react";
import { Search, Calendar, Filter, MapPin } from "lucide-react";
import UserSkillCard from "../components/users/UserSkillCard.tsx";
import Tabs, { TabItem } from "../components/ui/Tabs.tsx";
import { Select, SelectItem } from "../components/ui/Select.tsx";
import { Label } from "../components/ui/Form.tsx";
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

import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/Dialog";
import { Input } from "../components/ui/Form";
import Button from "../components/ui/Button";
import { format } from "date-fns";
const MINIMUM_BOOKING_DURATION = 30;
interface Availability {
  id: number;
  booked_for: number;
  weekday: number;
  start_time: string;
  end_time: string;
}

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const tags = [
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

const HomePage = () => {
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
  const [viewingUserAvailability, setViewingUserAvailability] = useState<
    Availability[]
  >([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedAvailabilitySlot, setSelectedAvailabilitySlot] =
    useState<Availability | null>(null);
  const [bookingDuration, setBookingDuration] = useState<number | "">(
    MINIMUM_BOOKING_DURATION
  );
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingSkillId, setBookingSkillId] = useState<number>(0);
  const [nextSessionDateTime, setNextSessionDateTime] = useState<Date | null>(null);

  useEffect(() => {
    const loadSkills = async () => {
      setIsLoading(true);
      try {
        const fetchedSkills = await fetchSkills(fetchParams);
        console.log("Fetched skills:", fetchedSkills);

        const clientFilteredSkills = fetchedSkills.filter((skill) => {
          if (
            selectedCategory !== "All" &&
            !skill.tags.includes(selectedCategory)
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

  const handleRequestSession = async (userId: number, skillId: number) => {
    setViewingUserId(userId);
    setBookingSkillId(skillId);
    setSelectedAvailabilitySlot(null);
    setBookingDuration(3600);
    setShowAvailabilityModal(true);
    setViewingUserAvailability([]);

    try {
      const availability = await fetchUserAvailability(userId);
      setViewingUserAvailability(availability);
    } catch (error) {
      console.error("Error in handleRequestSession:", error);

      setViewingUserAvailability([]);
    }
  };

  const handleSelectAvailability = (availability: Availability) => {
    setSelectedAvailabilitySlot(availability);
    const maxDuration = calculateDurationInMinutes(
      availability.start_time,
      availability.end_time
    );
    setBookingDuration(Math.min(60, maxDuration));
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

  const handleCreateBooking = async () => {
    if (!selectedAvailabilitySlot || viewingUserId === null) {
      alert(
        "Please select an availability slot and ensure a user is selected."
      );
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

    if (
      Number(bookingDuration) <= 0 ||
      Number(bookingDuration) > slotDurationMinutes
    ) {
      alert(
        `Please enter a valid duration (between ${MINIMUM_BOOKING_DURATION} minutes and ${slotDurationMinutes} minutes).`
      );
      setIsBookingLoading(false);
      return;
    }

    const bookingData = {
      booked_for: viewingUserId,
      skill: bookingSkillId,
      scheduled_time: formatToISOStringUTC(scheduledDateTime),
      duration: Number(bookingDuration),
    };
    console.log(bookingData);

    try {
      await createBooking(bookingData);
      alert("Booking created successfully!");

      setShowAvailabilityModal(false);
      setSelectedAvailabilitySlot(null);
      setBookingDuration(60);
      setViewingUserId(null);
      setViewingUserAvailability([]);
      setBookingSkillId(0);
    } catch (error) {
      console.error("Error in handleCreateBooking:", error);

      if (axios.isAxiosError(error)) {
        alert(
          `Error creating booking: ${
            error.response?.data?.detail || error.message
          }`
        );
      } else {
        alert(`Error creating booking: ${String(error)}`);
      }
    } finally {
      setIsBookingLoading(false);
    }
  };

  const skillTabs: TabItem[] = [
    {
      value: "all",
      label: "All Skills",
      content: isLoading ? (
        <div className="text-center py-12 text-gray-600">Loading skills...</div>
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
      ),
    },
    {
      value: "offering",
      label: "Offered Skills",
      content: isLoading ? (
        <div className="text-center py-12 text-gray-600">Loading skills...</div>
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
            No offered skills found
          </h3>
          <p className="mt-1 text-gray-500">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </div>
      ),
    },
    {
      value: "seeking",
      label: "Needed Skills",
      content: isLoading ? (
        <div className="text-center py-12 text-gray-600">Loading skills...</div>
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
            No needed skills found
          </h3>
          <p className="mt-1 text-gray-500">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-full flex-grow">
      <div className="bg-white px-4 py-4 shadow-sm sm:sticky sm:top-0 z-10 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Input
                icon={<Search className="h-5 w-5 text-gray-400" />}
                type="text"
                placeholder="Search for skills..."
                className=""
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                >
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
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </Label>

                <Select
                  value={locationFilter}
                  onValueChange={handleLocationChange}
                  icon={<MapPin className="h-4 w-4 text-gray-400" />}
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
      <div className="max-w-7xl mx-auto sm:px-4 px-2 sm:py-2 ">
        <Tabs defaultValue="all" items={skillTabs} tabsListClassName="mb-4" />
      </div>

      {/* Availability and Booking Modal */}
      <Dialog
        open={showAvailabilityModal}
        onOpenChange={setShowAvailabilityModal}
      >
        <div className="">
          <DialogHeader>
            <DialogTitle>
              {viewingUserId !== null
                ? `Availability for User ${viewingUserId}`
                : "User Availability"}
            </DialogTitle>
            <DialogDescription>
              Select an available time slot to request a session.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {viewingUserAvailability.length === 0 ? (
              <p className="text-gray-600">
                No availability found for this user.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {viewingUserAvailability.map((availability) => (
                  <li
                    key={availability.id}
                    className="py-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {weekdays[availability.weekday]}
                      </p>
                      <p className="text-xs text-gray-600">
                        {availability.start_time} - {availability.end_time}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelectAvailability(availability)}
                      disabled={
                        selectedAvailabilitySlot?.id === availability.id
                      }
                      variant={
                        selectedAvailabilitySlot?.id === availability.id
                          ? "secondary"
                          : "default"
                      }
                    >
                      {selectedAvailabilitySlot?.id === availability.id
                        ? "Selected"
                        : "Select Slot"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {selectedAvailabilitySlot && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Book Session
                </h3>
                <div className="mb-4">
                  {/* <p className="text-sm text-gray-700 mb-2">
                    Selected Slot:{" "}
                    <span className="font-medium">
                      {weekdays[selectedAvailabilitySlot.weekday]}{" "}
                      {selectedAvailabilitySlot.start_time} -{" "}
                      {selectedAvailabilitySlot.end_time}
                    </span>
                  </p> */}
                  {/* Display calculated next session date/time (approximate for user info) */}
                  {nextSessionDateTime && ( // Only display if nextSessionDateTime is not null
                      <p className="text-sm text-gray-600 mb-2">
                         Next Available Session: <span className="font-medium">{format(nextSessionDateTime, 'PPPP p')}</span> {/* Formatted date/time */}
                      </p>
                  )}
                  <Label
                    htmlFor="bookingDuration"
                    className="block text-sm font-medium text-gray-700 mb-3"
                  >
                    Duration (in minutes) Min ({MINIMUM_BOOKING_DURATION})
                  </Label>
                  <Input
                    id="bookingDuration"
                    type="number"
                    value={bookingDuration}
                    onChange={handleBookingDurationChange}
                    min={MINIMUM_BOOKING_DURATION}
                    max={calculateDurationInMinutes(
                      selectedAvailabilitySlot.start_time,
                      selectedAvailabilitySlot.end_time
                    )}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max duration for this slot:{" "}
                    {calculateDurationInMinutes(
                      selectedAvailabilitySlot.start_time,
                      selectedAvailabilitySlot.end_time
                    )}{" "}
                    minutes
                  </p>
                </div>
                <Button
                  onClick={handleCreateBooking}
                  className="w-full"
                  disabled={
                    isBookingLoading ||
                    Number(bookingDuration) <= MINIMUM_BOOKING_DURATION ||
                    Number(bookingDuration) >
                      calculateDurationInMinutes(
                        selectedAvailabilitySlot.start_time,
                        selectedAvailabilitySlot.end_time
                      )
                  }
                >
                  {isBookingLoading ? "Booking..." : "Create Booking"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default HomePage;
