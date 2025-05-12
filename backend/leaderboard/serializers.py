from users.serializers import UserProfileSerializer
from rest_framework import serializers
from .models import UserStats
from django.contrib.auth import get_user_model


User = get_user_model()


class UserStatsSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    net_contribution = serializers.SerializerMethodField()

    class Meta:
        model = UserStats
        fields = [
            "user",
            "total_hours_given",
            "total_hours_received",
            "sessions_completed",
            "net_contribution",
        ]
        read_only_fields = fields

    def get_net_contribution(self, obj):
        return obj.total_hours_given - obj.total_hours_received
