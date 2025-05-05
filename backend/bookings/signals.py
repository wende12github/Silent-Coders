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
            content="You have a new booking request from {instance.sender.username}."
        )
    elif instance.status in ['accepted', 'rejected']:
        Notification.objects.create(
            # user=instance.sender,
            user=1,
            type='booking_status',
            content="Your booking was {instance.status} by {instance.receiver.username}."
        )
