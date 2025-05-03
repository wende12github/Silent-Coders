from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Skill(models.Model):
    REMOTE = 'remote'
    LOCAL = 'local'
    MODE_CHOICES = [
        (REMOTE, 'Remote'),
        (LOCAL, 'Local'),
    ]

    name = models.CharField(max_length=100, unique=True)
    mode = models.CharField(max_length=10, choices=MODE_CHOICES, default=REMOTE)
    city = models.CharField(max_length=100, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)

    def clean(self):
        if self.mode == self.LOCAL and not self.city:
            raise ValidationError("City is required for local skills.")
        if self.mode == self.REMOTE:
            self.city = None
            self.address = None

    def __str__(self):
        return self.name


    def __str__(self):
        return self.name

class ServiceOffering(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='offerings')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='offerings')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration_in_minutes = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        unique_together = ('user', 'title')

    def __str__(self):
        return f"{self.title} ({self.skill.name})"
class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    service_offering = models.ForeignKey(ServiceOffering, on_delete=models.CASCADE, null=True, blank=True)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='requests')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='requests')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration_in_minutes = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'title')

    def __str__(self):
        return f"{self.title} ({self.skill.name})"
    
