from rest_framework import serializers
from .models import Skill, LOCATION_CHOICES, LEVEL_CHOICES
from django.contrib.auth import get_user_model
from users.serializers import UserProfileSerializer

# User = get_user_model()


# class SkillSerializer(serializers.ModelSerializer):
#     user = UserProfileSerializer(read_only=True)

#     level = serializers.ChoiceField(choices=LEVEL_CHOICES, read_only=True)
#     endorsements = serializers.IntegerField(read_only=True)
#     experience_hours = serializers.FloatField(read_only=True)

#     name = serializers.CharField(max_length=100)
#     description = serializers.CharField(required=False, allow_blank=True)
#     is_offered = serializers.BooleanField(required=False)
#     location = serializers.ChoiceField(choices=LOCATION_CHOICES)
#     address = serializers.CharField(
#         max_length=255, required=False, allow_blank=True, allow_null=True
#     )
#     tags = serializers.JSONField(required=False)
#     is_visible = serializers.BooleanField(required=False)

#     class Meta:
#         model = Skill
#         fields = [
#             "id",
#             "user",
#             "name",
#             "description",
#             "is_offered",
#             "location",
#             "address",
#             "tags",
#             "is_visible",
#             "level",
#             "endorsements",
#             "experience_hours",
#             "created_at",
#             "updated_at",
#         ]
#         read_only_fields = [
#             "id",
#             "user",
#             "level",
#             "endorsements",
#             "experience_hours",
#             "created_at",
#             "updated_at",
#         ]
