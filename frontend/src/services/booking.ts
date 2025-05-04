import { Booking } from "../store/types";
import { apiClient } from "./api";

export const createBooking = async (
  bookingData: Omit<Booking, "id">
): Promise<Booking> => {
  try {
    const response = await apiClient.post("/bookings/", bookingData);
    console.log("Create booking response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

export const fetchAllBookings = async (): Promise<Booking[]> => {
  try {
    const response = await apiClient.get("/bookings/");
    console.log("Fetch all bookings response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

export const fetchMyBookings = async (): Promise<Booking[]> => {
  try {
    const response = await apiClient.get("/bookings/my/bookings/");
    console.log("Fetch my bookings response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching my bookings:", error);
    throw error;
  }
};

export const fetchBooking = async (id: number): Promise<Booking> => {
  try {
    const response = await apiClient.get(`/bookings/${id}/`);
    console.log("Fetch booking response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }
};

export const cancelBooking = async (
  bookingId: number,
  cancelReason: string
): Promise<Booking> => {
  try {
    const response = await apiClient.patch(`/bookings/${bookingId}/cancel/`, {
      status: "cancelled",
      cancel_reason: cancelReason,
    });
    console.log(`Cancel booking ${bookingId} response:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error canceling booking ${bookingId}:`, error);
    throw error;
  }
};

interface BookingStatusReturn {
  id: number;
  status: "pending" | "confirmed" | "canceled";
}
export const confitmBooking = async (
  bookingId: number
): Promise<BookingStatusReturn> => {
  try {
    const response = await apiClient.patch(`/bookings/${bookingId}/confirm/`);
    console.log(`Confirm booking ${bookingId} response:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error confirming booking ${bookingId}:`, error);
    throw error;
  }
};

export const completeBooking = async (
  bookingId: number
): Promise<BookingStatusReturn> => {
  try {
    const response = await apiClient.patch(`/bookings/${bookingId}/complete/`);
    console.log(`Complete booking ${bookingId} response:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error completing booking ${bookingId}:`, error);
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
