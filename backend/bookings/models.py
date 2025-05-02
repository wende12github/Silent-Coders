from django.db import models
from django.conf import settings
from bookings.constants import BookingStatus

class Booking(models.Model):
    # service_offering = models.ForeignKey('skills.Skill', on_delete=models.CASCADE)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='requested_bookings', on_delete=models.CASCADE)
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='provided_bookings', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=BookingStatus.CHOICES, default=BookingStatus.PENDING)
    scheduled_time = models.DateTimeField()
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.requester} booked {self.provider} for {self.service_offering}"
