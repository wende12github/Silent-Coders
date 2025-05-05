from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    total_hours_given = models.FloatField(default=0)
    total_hours_received = models.FloatField(default=0)
    sessions_completed = models.IntegerField(default=0)

    def net_contribution(self):
        return self.total_hours_given - self.total_hours_received

    def __str__(self):
        return f"{self.user.username} Stats"
