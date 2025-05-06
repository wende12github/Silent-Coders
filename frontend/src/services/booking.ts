import { Booking, Skill } from "../store/types";
import { apiClient, PaginatedResponse } from "./api";
interface CreateBookingPayload {
  booked_for: number;
  skill: number;
  scheduled_time: string;
  duration: number;
}

/**
 * Creates a new booking.
 * @param bookingData The payload for the booking request.
 * @returns A promise resolving when the booking is created (or null/void depending on API).
 * @throws AxiosError if the API call fails.
 */
export const createBooking = async (
  bookingData: CreateBookingPayload
): Promise<void> => {
  try {
    await apiClient.post("/bookings/", bookingData);
  } catch (error) {
    console.error("Failed to create booking:", bookingData, error);

    throw error as AxiosError;
  }
};

export const fetchMyBookings = async (): Promise<Booking<Skill>[]> => {
  try {
    const response = await apiClient.get("/bookings/my/bookings/");
    console.log("Fetch my bookings response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching my bookings:", error);
    throw error;
  }
};

export const fetchBooking = async (id: number): Promise<Booking<Skill>> => {
  try {
    const response = await apiClient.get(`/bookings/${id}/`);
    console.log("Fetch booking response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }
};

interface BookingStatusReturn {
  id: number;
  status: "pending" | "confirmed" | "canceled";
}
export const updateBookingStatus = async (
  bookingId: number,
  status:  "confirmed" | "cancelled" | "completed",
  cancelReason?: string
): Promise<BookingStatusReturn> => {
  let statusEndpoint = "";
  try {
    switch (status) {
      case "confirmed":
        statusEndpoint = "confirm";
        break;
      case "cancelled":
        statusEndpoint = "cancel";
        break;
      case "completed":
        statusEndpoint = "complete";
        break;
    }

    const endpoint = `/bookings/${bookingId}/${statusEndpoint}/`;
    console.log("encpoint: " ,endpoint)
    const payload =
      status === "cancelled"
        ? { status, cancel_reason: cancelReason }
        : { status };

    const response = await apiClient.patch(endpoint, payload);
    console.log(
      `${
        status.charAt(0).toUpperCase() + status.slice(1)
      } booking ${bookingId} response:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating booking ${bookingId} to ${status}:`, error);
    throw error;
  }
};

export const reScheduleBooking = async (
  bookingId: number,
  scheduledTime: string,
  duration: number
): Promise<BookingStatusReturn> => {
  try {
    const response = await apiClient.patch(
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
    throw error;
  }
};

export const getBookingById = async (bookingId: number) => {
  try {
    const response = await apiClient.get(
      `/bookings/${bookingId}`
    );
    console.log(`Get booking by id ${bookingId} response:`, response.data);
    return response.data as Booking<Skill>;
  } catch (error) {
    console.error(`Error getting booking by id ${bookingId}:`, error);
    throw error;
  }
};

import { AxiosError } from "axios";

export interface Availability {
  id: number;
  booked_for: number;
  weekday: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

/**
 * Fetches availability slots for a specific user.
 * @param userId The ID of the user whose availability to fetch.
 * @returns A promise resolving to an array of Availability objects.
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
 * Fetches availability slots for a specific user.
 * @returns A promise resolving to an array of Availability objects.
 */
export const fetchMyAvailability = async (): Promise<Availability[]> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Availability>>(
      `/bookings/availability/`
    );

    return response.data.results;
  } catch (error) {
    console.error(`Failed to fetch availability for Current User:`, error);
    throw error as AxiosError;
  }
};

export interface CreateAvailabilityPayload {
  // weekday: number;
  start_time: string;
  end_time: string;
}

export interface UpdateAvailabilityPayload {
  // weekday?: number;
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
    const response = await apiClient.post(
      "/bookings/availability/",
      availabilityData
    );
    return response.data; // Assuming the API returns the created object
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
    const response = await apiClient.patch(
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

  const nowTime = now.getHours() * 60 + now.getMinutes();
  const selectedTime = hours * 60 + minutes;
  if (daysUntilNext === 0 && selectedTime < nowTime) {
    nextDate.setDate(nextDate.getDate() + 7);
  }
  console.log("Next date:", formatToISOStringUTC(nextDate));

  return nextDate;
};

export const formatToISOStringUTC = (date: Date): string => {
  return date.toISOString();
};

// Function to calculate duration in seconds from HH:MM time strings
export const calculateDurationInMinutes = (
  startTime: string,
  endTime: string
): number => {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  let endTotalMinutes = endHours * 60 + endMinutes;

  // Handle overnight times (e.g., 22:00 - 02:00)
  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60; // Add 24 hours in minutes
  }

  const durationMinutes = endTotalMinutes - startTotalMinutes;
  return durationMinutes; // Return duration in minutes
};
