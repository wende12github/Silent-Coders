from rest_framework import serializers
from .models import ChatMessage, PrivateChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['user', 'room', 'message', 'message_tyep', 'created_at']

class PrivateChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivateChatMessage
        fields = ['sender', 'receiver', 'message', 'message_type', 'created_at']

class PrivateConversationSerializer(serializers.Serializer):
    receiver_id = serializers.IntegerField()
    receiver_username = serializers.CharField()
