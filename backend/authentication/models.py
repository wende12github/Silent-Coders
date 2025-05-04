from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.conf import settings
class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    availability = models.TextField(blank=True, null=True)    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.username

class UserSkill(models.Model):
    LEVEL_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Expert', 'Expert'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_skills')
    skill = models.CharField(max_length=100)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='Beginner')
    endorsements = models.PositiveIntegerField(default=0)
    experience_hours = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('user', 'skill')

    def update_level(self):
        if self.experience_hours >= 100:
            self.level = 'Expert'
        elif self.experience_hours >= 50:
            self.level = 'Intermediate'
        else:
            self.level = 'Beginner'
        self.save()

    def __str__(self):
        return f"{self.user.username} - {self.skill} ({self.level})"
class EmailNotificationPreference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='email_preferences')
    newsletter = models.BooleanField(default=True)
    updates = models.BooleanField(default=True)
    skill_match_alerts = models.BooleanField(default=True)

    def __str__(self):
        return f"Preferences for {self.user.email}"

