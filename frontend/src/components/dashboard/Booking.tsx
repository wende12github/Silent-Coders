import { useEffect, useState } from "react";
import { apiClient } from "../../services/api";
import Button from "../ui/Button";
import { Input } from "../ui/Form"; 
import { Select, SelectItem } from "../ui/Select"; 
// import { format, parse } from "date-fns";

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const AvailabilityBookingPage = ({ userId }: { userId: number }) => {
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState("0");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [otherUserAvailability, setOtherUserAvailability] = useState<any[]>([]);

  // Fetch current user's availability
  const fetchAvailability = async () => {
    const res = await apiClient.get("/bookings/availability/");
    setAvailability(res.data.results);
  };

  // Fetch another user's availability
  const fetchOtherUserAvailability = async () => {
    const res = await apiClient.get(`/bookings/availability/${userId}/`);
    setOtherUserAvailability(res.data);
  };

  useEffect(() => {
    fetchAvailability();
    fetchOtherUserAvailability();
  }, []);

  const handleCreateAvailability = async () => {
    await apiClient.post("/bookings/availability/", {
      weekday: Number(selectedDay),
      start_time: startTime,
      end_time: endTime,
    });
    setStartTime("");
    setEndTime("");
    fetchAvailability();
  };

  const handleDeleteAvailability = async (id: number) => {
    await apiClient.delete(`/bookings/availability/${id}/`);
    fetchAvailability();
  };

  const handleBooking = async (otherAvailability: any) => {
    await apiClient.post("/bookings/", {
      booked_for: otherAvailability.booked_for,
      skill: 1, // Replace with selected skill
      scheduled_time: `2024-06-01T${otherAvailability.start_time}:00Z`,
      duration: 3600, // 1 hour
    });
    alert("Booking Created!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage Availability</h1>

      {/* Add Availability Form */}
      <div className="bg-white shadow p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Add Availability</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            {weekdays.map((day, index) => (
              <SelectItem key={index} value={String(index)}>
                {day}
              </SelectItem>
            ))}
          </Select>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="Start Time"
          />
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="End Time"
          />
          <Button onClick={handleCreateAvailability} className="md:col-span-3">
            Add Availability
          </Button>
        </div>
      </div>

      {/* Your Availability List */}
      <div className="bg-white shadow p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Your Availability</h2>
        <ul className="space-y-2">
          {availability.map((slot) => (
            <li
              key={slot.id}
              className="flex justify-between items-center bg-gray-100 p-2 rounded"
            >
              <span>
                {weekdays[slot.weekday]}: {slot.start_time} - {slot.end_time}
              </span>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteAvailability(slot.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* Other User Availability */}
      <div className="bg-white shadow p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Available Times for Booking</h2>
        <ul className="space-y-2">
          {otherUserAvailability.map((slot) => (
            <li
              key={slot.id}
              className="flex justify-between items-center bg-blue-50 p-2 rounded"
            >
              <span>
                {weekdays[slot.weekday]}: {slot.start_time} - {slot.end_time}
              </span>
              <Button size="sm" onClick={() => handleBooking(slot)}>
                Book Slot
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AvailabilityBookingPage;
