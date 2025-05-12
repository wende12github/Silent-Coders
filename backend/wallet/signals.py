from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Wallet, Transaction

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_wallet(sender, instance, created, **kwargs):
    if created and not hasattr(instance, "wallet"):
        Wallet.objects.create(user=instance)


@receiver(post_save, sender=Transaction)
def send_transfer_notification(sender, instance, created, **kwargs):
    if (
        created
        and instance.transaction_type == "credit"
        and instance.receiver
        and instance.sender
    ):
        subject = f"Time Transfer Received: {instance.amount} hours"
        message = (
            f"Dear {instance.receiver.username},\n\n"
            f"You have received {instance.amount} hours from {instance.sender.username} "
            f"for the reason: {instance.reason or 'No reason provided'}.\n\n"
            f"Your new balance is {instance.wallet.balance} hours.\n\n"
            f"Regards,\nYour App Team"
        )
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [instance.receiver.email],
            fail_silently=True,
        )
