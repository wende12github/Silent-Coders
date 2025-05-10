from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Booking
from notifications.models import Notification

@receiver(post_save, sender=Booking)
def booking_created(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.booked_for,
            type='booking_request',
            content=f"You have a new booking request from {instance.booked_by.username}."
        )
    elif instance.status in ['accepted', 'rejected']:
        Notification.objects.create(
            user=instance.booked_by,
            # user=1,
            type='booking_status',
            content=f"Your booking was {instance.status} by {instance.booked_for.username}."
        )
