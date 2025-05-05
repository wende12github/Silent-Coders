import React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/Dialog";
import { Input, Textarea, Label } from "../ui/Form";
import Button from "../ui/Button";

interface Availability {
  id: number;
  weekday: number;
  start_time: string;
  end_time: string;
}

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  viewingUserId: number | null;
  viewingUserAvailability: Availability[];
  selectedAvailabilitySlot: Availability | null;
  bookingDuration: number | "";
  initialMessage: string;
  isBookingLoading: boolean;
  nextSessionDateTime: Date | null;
  minimumBookingDuration: number;

  onSelectAvailability: (availability: Availability) => void;
  onBookingDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInitialMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCreateBooking: () => void;
  weekdays: string[];
}

const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onOpenChange,
  viewingUserId,
  viewingUserAvailability,
  selectedAvailabilitySlot,
  bookingDuration,
  initialMessage,
  isBookingLoading,
  nextSessionDateTime,
  minimumBookingDuration,
  onSelectAvailability,
  onBookingDurationChange,
  onInitialMessageChange,
  onCreateBooking,
  weekdays,
}) => {
  const calculateMaxDuration = (slot: Availability | null): number => {
    if (!slot) return 0;

    const [startHour, startMinute] = slot.start_time.split(":").map(Number);
    const [endHour, endMinute] = slot.end_time.split(":").map(Number);

    const startDate = new Date(0, 0, 0, startHour, startMinute);
    const endDate = new Date(0, 0, 0, endHour, endMinute);

    const diffInMilliseconds = endDate.getTime() - startDate.getTime();
    return Math.floor(diffInMilliseconds / (1000 * 60));
  };

  const maxSlotDuration = calculateMaxDuration(selectedAvailabilitySlot);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {viewingUserId !== null
              ? `Availability for User ${viewingUserId}`
              : "User Availability"}
          </DialogTitle>
          <DialogDescription>
            Select an available time slot to request a session and add an
            optional initial message.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {viewingUserAvailability.length === 0 ? (
            <p className="text-muted-foreground dark:text-muted-foreground-dark">
              No availability found for this user.
            </p>
          ) : (
            <ul className="divide-y divide-border dark:divide-border-dark max-h-60 overflow-y-auto">
              {viewingUserAvailability.map((availability) => (
                <li
                  key={availability.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground dark:text-foreground-dark">
                      {weekdays[availability.weekday]}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                      {availability.start_time} - {availability.end_time}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onSelectAvailability(availability)}
                    disabled={selectedAvailabilitySlot?.id === availability.id}
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
            <div className="pt-4 border-t border-border dark:border-border-dark mt-4">
              <h3 className="text-lg font-semibold mb-3 text-foreground dark:text-foreground-dark">
                Book Session
              </h3>
              <div className="mb-4">
                {nextSessionDateTime && (
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark mb-2">
                    Next Available Session:{" "}
                    <span className="font-medium text-foreground dark:text-foreground-dark">
                      {format(nextSessionDateTime, "PPPP p")}
                    </span>
                  </p>
                )}

                <Label
                  htmlFor="bookingDuration"
                  className="block text-sm font-medium text-foreground dark:text-foreground-dark mb-3"
                >
                  Duration (in minutes)
                </Label>
                <Input
                  id="bookingDuration"
                  type="number"
                  value={bookingDuration}
                  onChange={onBookingDurationChange}
                  min={minimumBookingDuration}
                  max={maxSlotDuration}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark mt-1">
                  Min: {minimumBookingDuration} minutes, Max: {maxSlotDuration}{" "}
                  minutes for this slot.
                </p>
              </div>

              <div className="mb-4">
                <Label
                  htmlFor="initialMessage"
                  className="block text-sm font-medium text-foreground dark:text-foreground-dark mb-3"
                >
                  Initial Message (Optional)
                </Label>
                <Textarea
                  id="initialMessage"
                  value={initialMessage}
                  onChange={onInitialMessageChange}
                  placeholder="e.g., Hi, I'm interested in learning more about your skill..."
                  rows={3}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark mt-1">
                  If left empty, a default "Hi" message will be sent.
                </p>
              </div>
            </div>
          )}
        </div>

        {selectedAvailabilitySlot && (
          <DialogFooter>
            <Button
              onClick={onCreateBooking}
              className="w-full"
              disabled={
                isBookingLoading ||
                Number(bookingDuration) < minimumBookingDuration ||
                Number(bookingDuration) > maxSlotDuration ||
                isNaN(Number(bookingDuration))
              }
            >
              {isBookingLoading
                ? "Booking..."
                : "Create Booking & Send Message"}
            </Button>
          </DialogFooter>
        )}
      </div>
    </Dialog>
  );
};

export default BookingModal;
