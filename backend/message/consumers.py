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
        self.group_id = self.scope["url_route"]["kwargs"].get("group_id")
        self.user_ids = self.scope["url_route"]["kwargs"].get("user_ids")
        self.user = self.scope["user"]

        self.is_group_chat = self.group_id is not None

        if not self.user.is_authenticated:
            print("Unauthenticated user attempted to connect. Closing connection.")
            await self.close()
            return

        if self.is_group_chat:
            try:
                group = await database_sync_to_async(Group.objects.get)(
                    id=self.group_id
                )
                self.room_identifier = f"group_{self.group_id}"

                is_member = await database_sync_to_async(
                    GroupMembership.objects.filter(group=group, user=self.user).exists
                )()
                if not is_member:
                    print(
                        f"User {self.user.username} is not a member of group {self.group_id}. Closing connection."
                    )
                    await self.close()
                    return
                self.group_object = group

            except ObjectDoesNotExist:
                print(
                    f"Group with ID {self.group_id} does not exist. Closing connection."
                )
                await self.close()
                return

        else:
            try:
                if not isinstance(self.user_ids, str):
                    print(
                        f"Invalid user_ids format: {self.user_ids}. Closing connection."
                    )
                    await self.close()
                    return

                user_ids_list = sorted([int(uid) for uid in self.user_ids.split("_")])

                if len(user_ids_list) != 2:
                    print(
                        f"Invalid number of user IDs in chat {self.user_ids}. Closing connection."
                    )
                    await self.close()
                    return

                if self.user.id not in user_ids_list:
                    print(
                        f"User {self.user.username} is not authorized for chat with IDs {self.user_ids}. Closing connection."
                    )
                    await self.close()
                    return

                other_user_id = next(
                    uid for uid in user_ids_list if uid != self.user.id
                )
                self.other_user = await database_sync_to_async(User.objects.get)(
                    id=other_user_id
                )
                self.room_identifier = f"user_{'_'.join(map(str, user_ids_list))}"

            except (ValueError, StopIteration, ObjectDoesNotExist):
                print(
                    f"Invalid user IDs or user not found for chat {self.user_ids}. Closing connection."
                )
                await self.close()
                return

        self.channel_layer_group_name = f"chat_{self.room_identifier}"

        await self.channel_layer.group_add(
            self.channel_layer_group_name, self.channel_name
        )

        print(
            f"WebSocket connected: User {self.user.username} joined {self.channel_layer_group_name}"
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "channel_layer_group_name"):
            print(
                f"WebSocket disconnected: User {self.user.username} left {self.channel_layer_group_name} with code {close_code}."
            )
            await self.channel_layer.group_discard(
                self.channel_layer_group_name, self.channel_name
            )
        else:
            print(
                f"WebSocket disconnected with code {close_code}, but channel layer group name was not set."
            )

    async def receive(self, text_data):
        if not self.user.is_authenticated:
            print("Received message from unauthenticated user. Ignoring.")
            return

        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get("message")

            message_type = text_data_json.get("message_type", "text")

            if not message:
                print("Received empty message. Ignoring.")
                return

        except json.JSONDecodeError:
            print("Received invalid JSON data. Ignoring.")
            return

        if self.is_group_chat and hasattr(self, "group_object"):
            await database_sync_to_async(ChatMessage.objects.create)(
                user=self.user,
                room=self.group_object,
                message=message,
                message_type=message_type,
            )
            print(
                f"Saved group message in room {self.group_id} from {self.user.username}"
            )
        elif not self.is_group_chat and hasattr(self, "other_user"):
            await database_sync_to_async(PrivateChatMessage.objects.create)(
                sender=self.user,
                receiver=self.other_user,
                message=message,
                message_type=message_type,
            )
            print(
                f"Saved private message between {self.user.username} and {self.other_user.username}"
            )
        else:
            print("Could not save message: Invalid chat state or missing objects.")

        if hasattr(self, "channel_layer_group_name"):
            await self.channel_layer.group_send(
                self.channel_layer_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                    "user": self.user.username,
                    "user_id": self.user.id,
                    "message_type": message_type,
                },
            )

        else:
            print("Cannot send message: Channel layer group name not set.")

    async def chat_message(self, event):
        message = event["message"]
        user = event["user"]
        user_id = event["user_id"]
        message_type = event["message_type"]

        await self.send(
            text_data=json.dumps(
                {
                    "message": message,
                    "user": user,
                    "user_id": user_id,
                    "message_type": message_type,
                }
            )
        )
