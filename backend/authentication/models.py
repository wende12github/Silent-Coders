from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

class EmailNotificationPreference(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_preferences",
    )
    newsletter = models.BooleanField(default=True)
    updates = models.BooleanField(default=True)
    skill_match_alerts = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Email Notification Preferences"

    def __str__(self):
        return f"Preferences for {self.user.email}"
