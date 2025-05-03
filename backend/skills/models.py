from django.db import models
from django.conf import settings
class Skill(models.Model):
    LOCATION_CHOICES = [
        ('local', 'Local'),
        ('remote', 'Remote'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skills', null=True)

    name = models.CharField(max_length=100)  
    description = models.TextField(blank=True)
    is_offered = models.BooleanField(default=False)  
    location = models.CharField(max_length=10, choices=LOCATION_CHOICES)
    address = models.CharField(max_length=255, blank=True, null=True) 
    tags = models.JSONField(default=list, blank=True)  
    is_visible = models.BooleanField(default=True)  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.username})"
