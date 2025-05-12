import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import axios from "axios";

import { Availability, SendMessagePayload, Skill } from "../store/types";
import {
  fetchUserAvailability,
  createBooking,
  getNextAvailabilityDateTime,
  formatToISOStringUTC,
  calculateDurationInMinutes,
  CreateBookingPayload,
} from "../services/booking";
import { sendMessage } from "../services/message";
import { useAuthStore } from "../store/authStore";

const MINIMUM_BOOKING_DURATION = 30;

interface UseBookingFlowResult {
  showAvailabilityModal: boolean;
  viewingUserId: number | null;
  viewingUserAvailability: Availability[];
  selectedAvailabilitySlot: Availability | null;
  bookingDuration: number | "";
  initialMessage: string;
  isBookingLoading: boolean;
  nextSessionDateTime: Date | null;
  minimumBookingDuration: number;
  weekdays: string[];

  handleRequestSession: (skill: Skill) => void;
  handleSelectAvailability: (availability: Availability) => void;
  handleBookingDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInitialMessageChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleCreateBooking: () => Promise<void>;
  handleCloseModal: () => void;
}

const useBookingFlow = (): UseBookingFlowResult => {
  const { user } = useAuthStore();

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
  const [nextSessionDateTime, setNextSessionDateTime] = useState<Date | null>(
    null
  );
  const [initialMessage, setInitialMessage] = useState("");

  const weekdays = useMemo(
    () => [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    []
  );

  const handleRequestSession = useCallback(
    async (skill: Skill) => {
      if (!user) {
        toast.error("Please log in to book a session.");
        return;
      }

      if (skill.user.id === user.id) {
        toast.error("You cannot book your own skill.");
        return;
      }

      setViewingUserId(skill.user.id);
      setBookingSkillId(skill.id);
      setSelectedAvailabilitySlot(null);
      setBookingDuration(MINIMUM_BOOKING_DURATION);
      setInitialMessage("");
      setViewingUserAvailability([]);

      setShowAvailabilityModal(true);

      try {
        let availability = await fetchUserAvailability(skill.user.id);
        console.log("User availability:", availability);
        availability = availability.filter(a => !a.is_booked)
        setViewingUserAvailability(availability);
      } catch (error) {
        console.error("Error fetching user availability:", error);
        setViewingUserAvailability([]);
        toast.error("Failed to load user availability.");
      }
    },
    [user]
  );

  const handleSelectAvailability = useCallback((availability: Availability) => {
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
  }, []);

  const handleBookingDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setBookingDuration(value === "" ? "" : Number(value));
    },
    []
  );

  const handleInitialMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInitialMessage(e.target.value);
    },
    []
  );

  const handleCreateBooking = useCallback(async () => {
    if (
      !selectedAvailabilitySlot ||
      viewingUserId === null ||
      user === null ||
      bookingSkillId === 0
    ) {
      toast.error(
        "Booking details are incomplete. Please select an availability slot and ensure you are logged in."
      );
      return;
    }

    const currentBookingDuration = Number(bookingDuration);

    const slotDurationMinutes = calculateDurationInMinutes(
      selectedAvailabilitySlot.start_time,
      selectedAvailabilitySlot.end_time
    );

    if (
      currentBookingDuration <= 0 ||
      currentBookingDuration < MINIMUM_BOOKING_DURATION ||
      currentBookingDuration > slotDurationMinutes ||
      isNaN(currentBookingDuration)
    ) {
      toast.error(
        `Please enter a valid duration (between ${MINIMUM_BOOKING_DURATION} and ${slotDurationMinutes} minutes).`
      );
      return;
    }

    setIsBookingLoading(true);

    const scheduledDateTime = getNextAvailabilityDateTime(
      selectedAvailabilitySlot.weekday,
      selectedAvailabilitySlot.start_time
    );

    const bookingData: CreateBookingPayload = {
      booked_for: viewingUserId,
      skill: bookingSkillId,
      scheduled_time: formatToISOStringUTC(scheduledDateTime),
      duration: currentBookingDuration,
      availability_id: selectedAvailabilitySlot.id,
    };
    console.log("Attempting to create booking with data:", bookingData);

    try {
      const bookingResponse = await createBooking(bookingData);
      console.log("Booking created successfully:", bookingResponse);

      try {
        const messageContent =
          initialMessage.trim() === "" ? "Hi!" : initialMessage.trim();

        const messagePayload: SendMessagePayload = {
          is_group_chat: false,
          message: messageContent,
          other_user_id: viewingUserId,
          message_type: "text",
        };

        console.log("Attempting to send initial message:", messagePayload);

        await sendMessage(messagePayload);
        console.log("Initial message sent successfully.");

        toast.success("Booking created and initial message sent successfully!");
        handleCloseModal();
      } catch (messageError: any) {
        console.error(
          "Error sending initial message AFTER booking:",
          messageError
        );

        toast.warning("Booking created, but failed to send initial message.");
        handleCloseModal();
      }
    } catch (bookingError: any) {
      console.error("Error creating booking:", bookingError);

      let errorMessage = "Failed to create booking.";
      if (axios.isAxiosError(bookingError)) {
        errorMessage =
          bookingError.response?.data?.detail ||
          bookingError.response?.data?.message ||
          bookingError.message;
      } else {
        errorMessage = bookingError.message || String(bookingError);
      }
      toast.error(`Booking Error: ${errorMessage}`);
    } finally {
      setIsBookingLoading(false);
    }
  }, [
    selectedAvailabilitySlot,
    viewingUserId,
    user,
    bookingSkillId,
    bookingDuration,
    initialMessage,
  ]);

  const handleCloseModal = useCallback(() => {
    setShowAvailabilityModal(false);
    setSelectedAvailabilitySlot(null);
    setBookingDuration(MINIMUM_BOOKING_DURATION);
    setViewingUserId(null);
    setViewingUserAvailability([]);
    setBookingSkillId(0);
    setNextSessionDateTime(null);
    setInitialMessage("");
    setIsBookingLoading(false);
  }, []);

  return {
    showAvailabilityModal,
    viewingUserId,
    viewingUserAvailability,
    selectedAvailabilitySlot,
    bookingDuration,
    initialMessage,
    isBookingLoading,
    nextSessionDateTime,
    minimumBookingDuration: MINIMUM_BOOKING_DURATION,
    weekdays,

    handleRequestSession,
    handleSelectAvailability,
    handleBookingDurationChange,
    handleInitialMessageChange,
    handleCreateBooking,
    handleCloseModal,
  };
};

export default useBookingFlow;
