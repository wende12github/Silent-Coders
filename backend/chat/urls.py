from django.urls import path
from .views import SendMessageView, ChatBotView

urlpatterns = [
    path("ask/", ChatBotView.as_view(), name="ask-bot"),
    path('sendMessage/', SendMessageView.as_view(), name='send_message'),
]