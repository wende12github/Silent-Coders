from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import JSONField

User = get_user_model()

LOCATION_CHOICES = [
    ("local", "Local"),
    ("remote", "Remote"),
]

LEVEL_CHOICES = [
    ("Beginner", "Beginner"),
    ("Intermediate", "Intermediate"),
    ("Expert", "Expert"),
]


class Skill(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="skills",
        null=True,
    )

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_offered = models.BooleanField(default=False)
    location = models.CharField(max_length=10, choices=LOCATION_CHOICES)
    address = models.CharField(max_length=255, blank=True, null=True)
    tags = models.ManyToManyField("bookings.Tag", related_name="skills", blank=True)

    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="Beginner")
    endorsements = models.PositiveIntegerField(default=0)
    experience_hours = models.FloatField(default=0.0)

    class Meta:
        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["user"]),
            models.Index(fields=["is_offered"]),
            models.Index(fields=["is_visible"]),
            models.Index(fields=["location"]),
        ]
        unique_together = ("user", "name")

    def update_level(self):
        if self.experience_hours >= 100:
            self.level = "Expert"
        elif self.experience_hours >= 50:
            self.level = "Intermediate"
        else:
            self.level = "Beginner"

        self.save()

    def __str__(self):
        user_str = self.user.username if self.user else "No User"
        return f"{self.name} ({user_str}) - {self.level}"
