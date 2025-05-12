from django.contrib import admin
from .models import ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    # list_display = ('user', 'room', 'message_type', 'created_at', 'is_read')
    search_fields = ('user__username', 'room__name', 'message')
    # list_filter = ('message_type', 'is_read', 'created_at')