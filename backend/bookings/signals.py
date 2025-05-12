from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Booking, BookingStatus
from notifications.models import Notification


@receiver(post_save, sender=Booking)
def booking_status_changed(sender, instance, created, **kwargs):
    try:
        old_instance = Booking.objects.get(pk=instance.pk)
    except Booking.DoesNotExist:
        old_instance = None

    if created:
        Notification.objects.create(
            user=instance.booked_for,
            type="booking_request",
            content=f"You have a new booking request from {instance.booked_by.username} for {instance.skill.name}.",
        )
    else:
        if old_instance and old_instance.status != instance.status:
            if instance.status == BookingStatus.CONFIRMED:
                Notification.objects.create(
                    user=instance.booked_by,
                    type="booking_status",
                    content=f"Your booking for {instance.skill.name} with {instance.booked_for.username} has been confirmed.",
                )
            elif instance.status == BookingStatus.CANCELLED:
                cancel_reason = (
                    instance.cancel_reason
                    if instance.cancel_reason
                    else "No reason provided."
                )
                Notification.objects.create(
                    user=instance.booked_by,
                    type="booking_status",
                    content=f"Your booking for {instance.skill.name} with {instance.booked_for.username} has been cancelled. Reason: {cancel_reason}",
                )
                Notification.objects.create(
                    user=instance.booked_for,
                    type="booking_status",
                    content=f"The booking for {instance.skill.name} with {instance.booked_by.username} has been cancelled. Reason: {cancel_reason}",
                )
            elif instance.status == BookingStatus.COMPLETED:
                Notification.objects.create(
                    user=instance.booked_by,
                    type="booking_status",
                    content=f"Your booking for {instance.skill.name} with {instance.booked_for.username} has been marked as completed.",
                )

        if old_instance and old_instance.scheduled_time != instance.scheduled_time:
            Notification.objects.create(
                user=instance.booked_by,
                type="booking_rescheduled",
                content=f"Your booking for {instance.skill.name} with {instance.booked_for.username} has been rescheduled to {instance.scheduled_time}.",
            )
            Notification.objects.create(
                user=instance.booked_for,
                type="booking_rescheduled",
                content=f"The booking for {instance.skill.name} with {instance.booked_by.username} has been rescheduled to {instance.scheduled_time}.",
            )
