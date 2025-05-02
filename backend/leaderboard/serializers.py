
from rest_framework import serializers
from .models import UserStats
from django.contrib.auth.models import User

class UserStatsSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')

    class Meta:
        model = UserStats
        fields = ['username', 'total_hours_given', 'sessions_completed']
