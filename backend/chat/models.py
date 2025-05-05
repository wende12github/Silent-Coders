from django.db import models
from django.conf import settings
from groups.models import Group

User = settings.AUTH_USER_MODEL

class ChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Group, on_delete=models.CASCADE)
    message = models.TextField()
    message_tyep = models.CharField(max_length=10, choices=[('text', 'Text'), ('voice', 'Voice')]) # Type of the Message
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"Message from {self.user.username} in {self.room.name}: {self.message[:20]}"

class PrivateChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    message_type = models.CharField(max_length=10, choices=[('text', 'Text'), ('voice', 'Voice')])
    created_at = models.DateTimeField(auto_now_add=True)