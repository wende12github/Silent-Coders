from authentication.serializers import UserProfileSerializer
from rest_framework import serializers
from .models import UserStats
from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_serializer_method

User = get_user_model()

class UserStatsSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    net_contribution = serializers.SerializerMethodField()

    class Meta:
        model = UserStats
        fields = [
            'user',
            'total_hours_given',
            'total_hours_received', 
            'sessions_completed',
            'net_contribution',
        ]
    
    @swagger_serializer_method(serializer_or_field=serializers.DictField)
    def get_user(self, obj):
        # Include full user details as needed
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'full_name': f"{obj.user.first_name} {obj.user.last_name}",
            'profile_picture': obj.user.profile_picture.url if obj.user.profile_picture else None,
            'bio': obj.user.bio,
            'date_joined': obj.user.date_joined,
        }

    def get_net_contribution(self, obj):
        return obj.total_hours_given - obj.total_hours_received

# class GroupLeaderboardSerializer(serializers.ModelSerializer):
#     user = serializers.SerializerMethodField()
#     net_contribution = serializers.SerializerMethodField()

#     class Meta:
#         model = UserStats
#         fields = [
#             'user',
#             'total_hours_given',
#             'total_hours_received', 
#             'sessions_completed',
#             'net_contribution',
#         ]

#     def get_user(self, obj):
#         return {
#             'id': obj.user.id,
#             'username': obj.user.username,
#             'full_name': f"{obj.user.first_name} {obj.user.last_name}",
#             'profile_picture': obj.user.profile_picture.url if obj.user.profile_picture else None,
#             'bio': obj.user.bio,
#         }

#     def get_net_contribution(self, obj):
#         return obj.total_hours_given - obj.total_hours_received