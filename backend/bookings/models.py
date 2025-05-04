from django.db import models
from django.conf import settings
from bookings.constants import BookingStatus
from django.contrib.auth import get_user_model

User = get_user_model()


class Booking(models.Model):
    skill = models.ForeignKey('skills.Skill', on_delete=models.CASCADE, related_name='bookings')
    booked_by = models.ForeignKey(User, related_name='bookings_made', on_delete=models.CASCADE)
    booked_for = models.ForeignKey(User, related_name='bookings_received', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=BookingStatus.CHOICES, default=BookingStatus.PENDING)
    scheduled_time = models.DateTimeField()
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    created_at = models.DateTimeField(auto_now_add=True)
    cancel_reason = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.booked_by} booked {self.booked_for} for {self.skill}"


class Review(models.Model):
    booking = models.OneToOneField("Booking", on_delete=models.CASCADE, related_name="review")
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.reviewer.username} for booking {self.booking.id}"
    
class AvailabilitySlot(models.Model):
    WEEKDAYS = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]

    booked_for = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availability_slots')
    weekday = models.IntegerField(choices=WEEKDAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ['booked_for', 'weekday', 'start_time', 'end_time']

    def __str__(self):
        return f"{self.booked_for.username} - {self.get_weekday_display()} {self.start_time}-{self.end_time}"