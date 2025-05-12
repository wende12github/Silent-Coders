from rest_framework import serializers
from .models import ChatMessage, PrivateChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "profile_picture"]
        ref_name = "MessageUser"


class ChatMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ["id", "user", "message", "message_type", "created_at"]
        read_only_fields = ["user", "room", "created_at"]


class PrivateChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = PrivateChatMessage
        fields = [
            "id",
            "sender",
            "receiver",
            "message",
            "message_type",
            "created_at",
            "is_read",
        ]
        read_only_fields = ["sender", "receiver", "created_at", "is_read"]


class PrivateConversationSerializer(serializers.Serializer):
    """Serializer to represent a summary of a private conversation."""

    other_user = UserSerializer()
    last_message_timestamp = serializers.DateTimeField(allow_null=True)
    last_message_content = serializers.CharField(allow_null=True, allow_blank=True)
    unread_count = serializers.IntegerField()
