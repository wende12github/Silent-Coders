from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Booking
from notifications.models import Notification

@receiver(post_save, sender=Booking)
def booking_created(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.receiver,
            type='booking_request',
            content=f"You have a new booking request from {instance.sender.username}."
        )
    elif instance.status in ['accepted', 'rejected']:
        Notification.objects.create(
            user=instance.sender,
            type='booking_status',
            content=f"Your booking was {instance.status} by {instance.receiver.username}."
        )
