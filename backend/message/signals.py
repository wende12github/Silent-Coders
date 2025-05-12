from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PrivateChatMessage

from notifications.services import notify_user
from django.conf import settings


if "notifications" in settings.INSTALLED_APPS:

    @receiver(post_save, sender=PrivateChatMessage)
    def private_message_created(sender, instance, created, **kwargs):
        """Signal receiver to notify the receiver when a new private message is created."""
        if created:
            receiver = instance.receiver
            sender_username = instance.sender.username
            message_content = instance.message

            content = f"New message from {sender_username}: {message_content[:50]}..."

            try:
                notify_user(receiver, "private_message", content)

            except Exception as e:
                print(
                    f"Error sending notification for private message to {receiver.username}: {e}"
                )
