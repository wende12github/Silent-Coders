import { AxiosError } from "axios";
import { Booking, Availability, PaginatedResponse, Review } from "../store/types";
import { apiClient } from "./api";

export interface CreateBookingPayload {
  booked_for: number;
  skill: number;
  scheduled_time: string;
  duration: number;
  availability_id: number;
}

/**
 * Creates a new booking.
 * @param bookingData The payload for the booking request.
 * @returns A promise resolving to the created Booking object.
 * @throws AxiosError if the API call fails.
 */
export const createBooking = async (
  bookingData: CreateBookingPayload
): Promise<Booking> => {
  try {
    const response = await apiClient.post<Booking>("/bookings/", bookingData);
    console.log("Created booking:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to create booking:", bookingData, error);
    throw error as AxiosError;
  }
};

/**
 * Fetches all bookings related to the authenticated user (booked_by or booked_for).
 * Backend uses BookingDetailSerializer and pagination.
 * @returns A promise resolving to an array of Booking objects.
 * @throws AxiosError if the API call fails.
 */
export const fetchMyBookings = async (): Promise<Booking[]> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Booking>>(
      "/bookings/list/"
    );
    console.log("Fetch my bookings response:", response.data);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching my bookings:", error);
    throw error as AxiosError;
  }
};

/**
 * Fetches details for a single booking by ID.
 * Backend uses BookingDetailSerializer.
 * @param id The ID of the booking to fetch.
 * @returns A promise resolving to the Booking object.
 * @throws AxiosError if the API call fails.
 */
export const fetchBooking = async (id: number): Promise<Booking> => {
  try {
    const response = await apiClient.get<Booking>(`/bookings/${id}/`);
    console.log("Fetch booking response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error as AxiosError;
  }
};

type UpdateBookingStatusType = "confirmed" | "cancelled" | "completed";

/**
 * Updates the status of a booking (confirm, cancel, complete).
 * Backend uses a single /status/ endpoint with PATCH.
 * @param bookingId The ID of the booking to update.
 * @param status The new status for the booking.
 * @param cancelReason Optional reason for cancellation.
 * @returns A promise resolving to the updated Booking object.
 * @throws AxiosError if the API call fails.
 */
export const updateBookingStatus = async (
  bookingId: number,
  status: UpdateBookingStatusType,
  cancelReason?: string
): Promise<Booking> => {
  try {
    const endpoint = `/bookings/${bookingId}/status/`;
    console.log("Endpoint:", endpoint);

    const payload: { status: UpdateBookingStatusType; cancel_reason?: string } =
      { status };
    if (status === "cancelled" && cancelReason !== undefined) {
      payload.cancel_reason = cancelReason;
    }

    const response = await apiClient.patch<Booking>(endpoint, payload);
    console.log(
      `${
        status.charAt(0).toUpperCase() + status.slice(1)
      } booking ${bookingId} response:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating booking ${bookingId} to ${status}:`, error);
    throw error as AxiosError;
  }
};

/**
 * Reschedules a booking.
 * Backend uses /reschedule/ endpoint with PATCH.
 * @param bookingId The ID of the booking to reschedule.
 * @param scheduledTime The new scheduled time (ISO 8601 string).
 * @param duration The new duration in minutes.
 * @returns A promise resolving to the updated Booking object.
 * @throws AxiosError if the API call fails.
 */
export const reScheduleBooking = async (
  bookingId: number,
  scheduledTime: string,
  duration: number
): Promise<Booking> => {
  try {
    const response = await apiClient.patch<Booking>(
      `/bookings/${bookingId}/reschedule/`,
      {
        scheduled_time: scheduledTime,
        duration: duration,
      }
    );
    console.log(`Reschedule booking ${bookingId} response:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error rescheduling booking ${bookingId}:`, error);
    throw error as AxiosError;
  }
};

/**
 * Fetches availability slots for a specific user by their ID.
 * Backend uses pagination.
 * @param userId The ID of the user whose availability to fetch.
 * @returns A promise resolving to an array of Availability objects.
 * @throws AxiosError if the API call fails.
 */
export const fetchUserAvailability = async (
  userId: number
): Promise<Availability[]> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Availability>>(
      `/bookings/availability/user/${userId}/`
    );
    console.log("Fetched availability:", response.data.results);
    return response.data.results;
  } catch (error) {
    console.error(`Failed to fetch availability for user ${userId}:`, error);
    throw error as AxiosError;
  }
};

/**
 * Fetches availability slots for the authenticated user.
 * Backend uses pagination.
 * @returns A promise resolving to an array of Availability objects.
 * @throws AxiosError if the API call fails.
 */
export const fetchMyAvailability = async (): Promise<Availability[]> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Availability>>(
      "/bookings/availability/"
    );
    return response.data.results;
  } catch (error) {
    console.error(`Failed to fetch availability for Current User:`, error);
    throw error as AxiosError;
  }
};

export interface CreateAvailabilityPayload {
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface UpdateAvailabilityPayload {
  weekday?: number;
  start_time?: string;
  end_time?: string;
}

/**
 * Creates a new availability slot for the current user.
 * @param availabilityData The payload for the new availability slot.
 * @returns A promise resolving to the created Availability object.
 * @throws AxiosError if the API call fails.
 */
export const createAvailability = async (
  availabilityData: CreateAvailabilityPayload
): Promise<Availability> => {
  try {
    const response = await apiClient.post<Availability>(
      "/bookings/availability/",
      availabilityData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create availability:", availabilityData, error);
    throw error as AxiosError;
  }
};

/**
 * Updates an existing availability slot for the current user.
 * @param availabilityId The ID of the availability slot to update.
 * @param updateData The payload with fields to update.
 * @returns A promise resolving to the updated Availability object.
 * @throws AxiosError if the API call fails.
 */
export const updateAvailability = async (
  availabilityId: number,
  updateData: UpdateAvailabilityPayload
): Promise<Availability> => {
  try {
    const response = await apiClient.patch<Availability>(
      `/bookings/availability/${availabilityId}/`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to update availability ${availabilityId}:`,
      updateData,
      error
    );
    throw error as AxiosError;
  }
};

/**
 * Deletes an availability slot for the current user.
 * @param availabilityId The ID of the availability slot to delete.
 * @returns A promise resolving when the deletion is successful (or null/void).
 * @throws AxiosError if the API call fails.
 */
export const deleteAvailability = async (
  availabilityId: number
): Promise<void> => {
  try {
    await apiClient.delete(`/bookings/availability/${availabilityId}/`);
  } catch (error) {
    console.error(`Failed to delete availability ${availabilityId}:`, error);
    throw error as AxiosError;
  }
};

/**
 * Posts a review for a specific booking.
 * @param bookingId The ID of the booking being reviewed.
 * @param rating The rating (0-5).
 * @param comment The review comment.
 * @returns A promise resolving to the newly created review.
 * @throws AxiosError if the API call fails.
 */
export const giveReview = async (
  bookingId: number,
  rating: number,
  comment: string
): Promise<Review> => {
  try {
    const response = await apiClient.post(`/bookings/${bookingId}/review/`, {
      booking_id: bookingId,
      rating,
      comment,
    });

    console.log("Review posted:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to post review for booking ${bookingId}:`, error);
    throw error as AxiosError;
  }
};

/**
 * Fetches booking reviews with optional filters like search term, pagination, booking ID, and reviewed user ID.
 * @param params Query parameters for filtering reviews.
 * @returns A promise resolving to an array of Review objects.
 * @throws AxiosError if the API call fails.
 */
export const fetchBookingReviews = async (
  params: {
    search?: string;
    page?: number;
    booking_id?: number;
    reviewed_user_id?: number;
  }
): Promise<Review[]> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Review>>(
      "/bookings/reviews/",
      { params }
    );
    
    console.log("Fetched reviews:", response.data.results);
    return response.data.results;
  } catch (error) {
    console.error("Failed to fetch booking reviews:", error);
    throw error as AxiosError;
  }
};


export const getNextAvailabilityDateTime = (
  weekdayIndex: number,
  time: string
): Date => {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);

  const currentDayOfWeek = now.getDay();
  const adjustedCurrentDayOfWeek =
    currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  let daysUntilNext = weekdayIndex - adjustedCurrentDayOfWeek;
  if (daysUntilNext < 0) {
    daysUntilNext += 7;
  }

  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + daysUntilNext);
  nextDate.setHours(hours, minutes, 0, 0);

  const nowTimeInMinutes = now.getHours() * 60 + now.getMinutes();
  const selectedTimeInMinutes = hours * 60 + minutes;

  if (daysUntilNext === 0 && selectedTimeInMinutes < nowTimeInMinutes) {
    nextDate.setDate(nextDate.getDate() + 7);
  }

  console.log("Calculated next availability date:", nextDate.toISOString());
  return nextDate;
};

export const formatToISOStringUTC = (date: Date): string => {
  return date.toISOString();
};

export const calculateDurationInMinutes = (
  startTime: string,
  endTime: string
): number => {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  let endTotalMinutes = endHours * 60 + endMinutes;

  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }

  const durationMinutes = endTotalMinutes - startTotalMinutes;

  return Math.max(0, durationMinutes);
};

