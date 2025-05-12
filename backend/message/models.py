from django.db import models
from django.conf import settings
from groups.models import Group

User = settings.AUTH_USER_MODEL


class ChatMessage(models.Model):
    """Model for group chat messages."""

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="messages")
    message = models.TextField()
    message_type = models.CharField(
        max_length=10, choices=[("text", "Text"), ("voice", "Voice")], default="text"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return (
            f"Msg from {self.user.username} in {self.room.name}: {self.message[:50]}..."
        )


class PrivateChatMessage(models.Model):
    """Model for one-to-one private messages."""

    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_private_messages"
    )
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="received_private_messages"
    )
    message = models.TextField()
    message_type = models.CharField(
        max_length=10, choices=[("text", "Text"), ("voice", "Voice")], default="text"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]
        unique_together = [["sender", "receiver", "created_at"]]

    def __str__(self):
        return f"Private Msg from {self.sender.username} to {self.receiver.username}: {self.message[:50]}..."
