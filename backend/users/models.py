from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.db.models import TextChoices

class AvailabilityChoices(TextChoices):
    FULL_TIME = 'full_time', _('Full Time')
    PART_TIME = 'part_time', _('Part Time')
    WEEKENDS = 'weekends', _('Weekends')
    EVENINGS = 'evenings', _('Evenings')
    FLEXIBLE = 'flexible', _('Flexible')
    NOT_SPECIFIED = 'not_specified', _('Not Specified')


class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    availability = models.CharField(
        max_length=20,
        choices=AvailabilityChoices.choices,
        default=AvailabilityChoices.NOT_SPECIFIED,
        blank=True
    )

    USERNAME_FIELD = 'email' # Use email for login
    REQUIRED_FIELDS = ['username'] # Keep username as required during creation

    def __str__(self):
        # Return email or username, email is the primary identifier for login
        return self.email or self.username

    class Meta:
        # Add indexes for frequently queried fields
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
        ]
