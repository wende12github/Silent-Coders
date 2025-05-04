from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/chat/group_<str:room_name>/', consumers.ChatConsumer.as_asgi(), name='group_chat'),

    # One-to-one chat routing (e.g., "ws/chat/user_1_2/" for user 1 chatting with user 2)
    path('ws/chat/<str:room_name>/', consumers.ChatConsumer.as_asgi(), name='one_to_one_chat'),
]