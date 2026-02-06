from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.conf import settings

from skills.models import Skill

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    availability = models.TextField(blank=True, null=True)    
    email_verified = models.BooleanField(default=False)

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
    name = models.CharField(max_length=100)  
    location = models.CharField(max_length=255)  
    address = models.TextField(blank=True, null=True) 

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


class UserSkillEndorsement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skill_endorsements')
    skill = models.ForeignKey('UserSkill', on_delete=models.CASCADE, related_name='endorsements_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'skill')

    def __str__(self):
        return f"{self.user.username} endorsed {self.skill_id} at {self.created_at}"


class EmailVerification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='email_verifications')
    token = models.CharField(max_length=128, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"EmailVerification for {self.user.email} (token={self.token})"
class EmailNotificationPreference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='email_preferences')
    newsletter = models.BooleanField(default=True)
    updates = models.BooleanField(default=True)
    skill_match_alerts = models.BooleanField(default=True)

    def __str__(self):
        return f"Preferences for {self.user.email}"

