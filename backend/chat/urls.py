# chat/urls.py
from django.urls import path
from .views import ChatBotView

urlpatterns = [
    # AI Chatbot URL - stays in chat app
    path("ask/", ChatBotView.as_view(), name="ask-bot"),
]