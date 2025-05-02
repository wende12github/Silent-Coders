from django.db import models
from django.contrib.auth.models import User
from django.db import models

class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    total_hours_given = models.FloatField(default=0)
    sessions_completed = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} Stats"

