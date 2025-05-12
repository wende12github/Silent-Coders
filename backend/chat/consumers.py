import json
from message.models import ChatMessage, PrivateChatMessage
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from groups.models import Group, GroupMembership
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for chat rooms."""

    async def connect(self):
        # Get parameters directly from URL route kwargs as defined in asgi.py
        # These will be either 'group_id' or 'user_ids', but not both.
        self.group_id = self.scope['url_route']['kwargs'].get('group_id')
        self.user_ids = self.scope['url_route']['kwargs'].get('user_ids')
        self.user = self.scope["user"]

        # Determine if it's a group chat or one-to-one
        self.is_group_chat = self.group_id is not None

        # Authentication check: Ensure user is logged in
        if not self.user.is_authenticated:
            print("Unauthenticated user attempted to connect. Closing connection.")
            await self.close()
            return

        # --- Authorization Checks ---

        if self.is_group_chat:
            # Group chat: Ensure the user is a member of the group
            try:
                group = await database_sync_to_async(Group.objects.get)(id=self.group_id)
                self.room_identifier = f"group_{self.group_id}" # Use ID for room identifier
                # Check if user is a member
                is_member = await database_sync_to_async(GroupMembership.objects.filter(group=group, user=self.user).exists)()
                if not is_member:
                    print(f"User {self.user.username} is not a member of group {self.group_id}. Closing connection.")
                    await self.close()
                    return
                self.group_object = group # Store group object for later use

            except ObjectDoesNotExist:
                print(f"Group with ID {self.group_id} does not exist. Closing connection.")
                await self.close()
                return

        else:
            # One-to-one chat: Ensure the user is one of the two users in the chat
            try:
                # Ensure user_ids is a string before splitting
                if not isinstance(self.user_ids, str):
                     print(f"Invalid user_ids format: {self.user_ids}. Closing connection.")
                     await self.close()
                     return

                user_ids_list = sorted([int(uid) for uid in self.user_ids.split('_')])

                # Ensure there are exactly two user IDs
                if len(user_ids_list) != 2:
                     print(f"Invalid number of user IDs in chat {self.user_ids}. Closing connection.")
                     await self.close()
                     return

                # The user connecting must be one of the two IDs in the URL
                if self.user.id not in user_ids_list:
                     print(f"User {self.user.username} is not authorized for chat with IDs {self.user_ids}. Closing connection.")
                     await self.close()
                     return

                # Find the other user
                other_user_id = next(uid for uid in user_ids_list if uid != self.user.id)
                self.other_user = await database_sync_to_async(User.objects.get)(id=other_user_id)
                self.room_identifier = f"user_{'_'.join(map(str, user_ids_list))}" # Standardize user room name

            except (ValueError, StopIteration, ObjectDoesNotExist):
                 print(f"Invalid user IDs or user not found for chat {self.user_ids}. Closing connection.")
                 await self.close()
                 return

        # --- End Authorization Checks ---

        # Create group name for WebSocket channel layer
        # Use the determined room_identifier which is either group_ID or user_ID1_ID2
        self.channel_layer_group_name = f"chat_{self.room_identifier}" # Prefix with 'chat_' for clarity

        # Join room group (i.e., subscribe to the chat room)
        await self.channel_layer.group_add(
            self.channel_layer_group_name,
            self.channel_name
        )

        print(f"WebSocket connected: User {self.user.username} joined {self.channel_layer_group_name}")
        await self.accept()  # Accept the WebSocket connection

    async def disconnect(self, close_code):
        # Leave the room group when the user disconnects
        # Use the correct attribute name: self.channel_layer_group_name
        if hasattr(self, 'channel_layer_group_name'):
             # Corrected the attribute name in the print statement
             print(f"WebSocket disconnected: User {self.user.username} left {self.channel_layer_group_name} with code {close_code}.")
             await self.channel_layer.group_discard(
                 self.channel_layer_group_name,
                 self.channel_name
             )
        else:
             print(f"WebSocket disconnected with code {close_code}, but channel layer group name was not set.")


    async def receive(self, text_data):
        # Ensure user is authenticated before processing messages
        if not self.user.is_authenticated:
            print("Received message from unauthenticated user. Ignoring.")
            return # Do not process messages from unauthenticated users

        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message')
            # Default message_type to 'text' if not provided
            message_type = text_data_json.get('message_type', 'text')

            if not message:
                 print("Received empty message. Ignoring.")
                 return

        except json.JSONDecodeError:
            print("Received invalid JSON data. Ignoring.")
            return

        # Save the message
        if self.is_group_chat and hasattr(self, 'group_object'):
            # Ensure group_object was successfully set during connect
            await database_sync_to_async(ChatMessage.objects.create)(
                user=self.user,
                room=self.group_object,
                message=message,
                message_type=message_type # Corrected typo
            )
            print(f"Saved group message in room {self.group_id} from {self.user.username}")
        elif not self.is_group_chat and hasattr(self, 'other_user'):
             # Ensure other_user was successfully set during connect
             await database_sync_to_async(PrivateChatMessage.objects.create)(
                 sender=self.user,
                 receiver=self.other_user,
                 message=message,
                 message_type=message_type
             )
             print(f"Saved private message between {self.user.username} and {self.other_user.username}")
        else:
            print("Could not save message: Invalid chat state or missing objects.")
            # Optionally send an error back to the user


        # Send message to room group (either group or one-to-one chat)
        # Use the correct channel layer group name
        if hasattr(self, 'channel_layer_group_name'):
            await self.channel_layer.group_send(
                self.channel_layer_group_name,
                {
                    'type': 'chat_message', # This calls the chat_message method below
                    'message': message,
                    'user': self.user.username, # Send username for display
                    'user_id': self.user.id, # Also send user ID
                    'message_type': message_type,
                    # Add timestamp or other relevant info if needed
                }
            )
            # print(f"Sent message to channel layer group: {self.channel_layer_group_name}") # Avoid excessive logging
        else:
            print("Cannot send message: Channel layer group name not set.")


    # Handler for messages received from the channel layer group
    async def chat_message(self, event):
        # Extract data from the event dictionary
        message = event['message']
        user = event['user']
        user_id = event['user_id'] # Get user ID
        message_type = event['message_type']

        # Send message data back to the WebSocket client
        await self.send(text_data=json.dumps({
            'message': message,
            'user': user,
            'user_id': user_id, # Include user ID in the sent message
            'message_type': message_type,
            # Include other fields from event if needed by frontend
        }))
        # print("Message sent to WebSocket client.") # Avoid excessive logging

