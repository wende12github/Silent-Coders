from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import EmailNotificationPreference

from django.core.validators import MinLengthValidator
import re

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User

        fields = (
            "id",
            "email",
            "username",
            "password",
            "bio",
            "profile_picture",
            "date_joined",
            "first_name",
            "last_name",
            "availability",
        )
        read_only_fields = ("id", "date_joined")
        ref_name = "AuthenticationUser"

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            raise serializers.ValidationError('Must include "email" and "password".')

        user = authenticate(
            request=self.context.get("request"), username=email, password=password
        )

        if not user:
            raise serializers.ValidationError("Invalid credentials.")

        return user


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)

    new_password = serializers.CharField(
        required=True,
        validators=[
            MinLengthValidator(
                5, message="Password must be at least 5 characters long."
            ),
        ],
    )

    def validate_new_password(self, value):
        if not re.search(r"\d", value):
            raise serializers.ValidationError(
                "Password must contain at least one number."
            )

        return value


class EmailPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailNotificationPreference
        fields = ["newsletter", "updates", "skill_match_alerts"]


class TokenObtainPairSerializer(TokenObtainPairSerializer):
    pass
