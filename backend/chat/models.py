from django.db import models
from django.conf import settings
from groups.models import Group

User = settings.AUTH_USER_MODEL

class ChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Group, on_delete=models.CASCADE)
    message = models.TextField()
    message_tyep = models.CharField(max_length=10, choices=[('text', 'Text'), ('voice', 'Voice')], default='text') # Type of the Message
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)


    def __str__(self):
        return f"Message from {self.user.username} in {self.room.name}: {self.message[:20]}"

# class Group(models.Model):
#     name = models.CharField(max_length=100)
#     description = models.TextField(null=True, blank=True)
#     owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_groups')
#     members = models.ManyToManyField(User, related_name='groups')
#     created_at = models.DateTimeField(auto_now_add=True)

class PrivateChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    message_type = models.CharField(max_length=10, choices=[('text', 'Text'), ('voice', 'Voice')])
    created_at = models.DateTimeField(auto_now_add=True)