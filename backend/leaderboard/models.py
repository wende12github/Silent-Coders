from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal
from django.core.validators import MinValueValidator

User = get_user_model()

class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    total_hours_given = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), validators=[MinValueValidator(Decimal('0.00'))])
    total_hours_received = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), validators=[MinValueValidator(Decimal('0.00'))])
    sessions_completed = models.IntegerField(default=0, validators=[MinValueValidator(0)]) # Ensure sessions are non-negative

    def net_contribution(self):
        return self.total_hours_given - self.total_hours_received

    def __str__(self):
        return f"{self.user.username} Stats"

    class Meta:
        verbose_name_plural = "User Stats"