from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PrivateChatMessage
from notifications.services import notify_user

@receiver(post_save, sender=PrivateChatMessage)
def message_sent(sender, instance, created, **kwargs):
    if not created:
        user = instance.user
        status = instance.status
        content=f"New message from {instance.sender.username}."
        notify_user(user, "message", content)
    
