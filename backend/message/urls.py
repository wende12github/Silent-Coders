from django.urls import path
from .views import GroupChatMessagesView, PrivateChatMessagesView, SendMessageView, UserPrivateConversationsView

urlpatterns = [
    path('send/', SendMessageView.as_view(), name='send_message'), # Endpoint to send a new message
    path('group/<int:group_id>/', GroupChatMessagesView.as_view(), name='group_chat_messages'), # Endpoint to get group messages
    path('private/<int:user_id>/', PrivateChatMessagesView.as_view(), name='private_chat_messages'), # Endpoint to get private messages with a user
    path('private/', UserPrivateConversationsView.as_view(), name='user_private_conversations'), # Endpoint to list private conversations
]