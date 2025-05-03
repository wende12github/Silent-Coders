
from rest_framework import serializers
from .models import UserStats
from django.contrib.auth.models import User

class UserStatsSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    net_contribution = serializers.SerializerMethodField()

    class Meta:
        model = UserStats
        fields = [
            'username',
            'total_hours_given',
            'total_hours_received', 
            'sessions_completed',
            'net_contribution',
        ]

    def get_net_contribution(self, obj):
        return obj.total_hours_given - obj.total_hours_received
