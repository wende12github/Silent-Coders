"""
ASGI config for timebank project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from chat import consumers
from django.urls import path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'timebank.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/chat/<room_name>/", consumers.ChatConsumer.as_asgi()),  # WebSocket routing for chat
        ])
    ),
})