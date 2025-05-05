from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Wallet, Transaction

User = settings.AUTH_USER_MODEL

@receiver(post_save, sender=User)
def create_user_wallet(sender, instance, created, **kwargs):
    if created:
        Wallet.objects.create(user=instance)

# This should be in your signals.py, not inside the view.
@receiver(post_save, sender=Transaction)
def send_transfer_notification(sender, instance, created, **kwargs):
    if created:
        sender_user = instance.sender
        receiver_user = instance.booked_for
        amount = instance.amount
        reason = instance.reason
        subject = f"Time Transfer Notification: {amount} hours"
        message = f"Dear {receiver_user.username},\n\nYou have received {amount} hours from {sender_user.username} for the reason: {reason}."
        recipient_list = [receiver_user.email]
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list)