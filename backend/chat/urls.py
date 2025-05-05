from django.urls import path
from .views import GroupChatMessagesView, PrivateChatMessagesView, SendMessageView, ChatBotView, UserPrivateConversationsView

urlpatterns = [
    path("ask/", ChatBotView.as_view(), name="ask-bot"),
    path('sendMessage/', SendMessageView.as_view(), name='send_message'),
    path('group/<group_name>/', GroupChatMessagesView.as_view(), name='group_chat_message'),
    path('private/<user_id>/', PrivateChatMessagesView.as_view(), name='one_to_one_chat_message'),
    path('private-conversations/', UserPrivateConversationsView.as_view(), name='user_private_conversations'),
]