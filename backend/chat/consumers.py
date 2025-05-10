import json
from .models import ChatMessage, PrivateChatMessage
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from groups.models import Group, GroupMembership
from channels.db import database_sync_to_async

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for chat rooms."""
    
    async def connect(self):
        # Get room name from URL parameters
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.user = self.scope["user"]

        # Check if the room is a group chat or one-to-one
        if self.room_name.startswith("group_"):
            # It's a group chat
            self.is_group_chat = True
        else:
            # It's a one-to-one chat
            self.is_group_chat = False
            user_ids = self.room_name.split("_")
            self.other_user_id = user_ids[1]  # The second user in the one-to-one chat
            self.other_user = await database_sync_to_async(User.objects.get)(id=self.other_user_id)

        # For group chats, ensure the user is a member of the group
        if self.is_group_chat:
            group = await database_sync_to_async(Group.objects.get)(name=self.room_name)
            membership = await database_sync_to_async(GroupMembership.objects.filter(group=group, user=self.user).exists)()
            if not membership.exists():
                await self.close()  # If not a member, close the connection
                return
        

        # Create group name for WebSocket, 
        # which will be either for the group or the individual chat
        self.group_name = f"T_{self.room_name}"
        
        # Join room group (i.e., subscribe to the chat room)
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()  # Accept the WebSocket connection

    async def disconnect(self, close_code):
        # Leave the room group when the user disconnects
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        message_type = text_data_json.get('message_type', 'text')  # 'text' or 'voice'

        # Save the message
        if self.is_group_chat:
            group = await database_sync_to_async(Group.objects.get)(name=self.room_name)
            chat_message = await database_sync_to_async(ChatMessage.objects.create)(
                user=self.user,
                room=group,
                message=message,
                message_tyep=message_type
            )
        else:
            private_message = await database_sync_to_async(PrivateChatMessage.objects.create)(
                sender=self.user,
                receiver=self.other_user,
                message=message,
                message_type=message_type
            )

        # Send  message to room group (either group or one-to-one chat)
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': message,
                'user': self.user.username,
                'message_type': message_type
            }
        )

    async def chat_message(self, event):
        message = event['message']
        user = event['user']
        message_type = event['message_type']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'user': user,
            'message_type': message_type
        }))
