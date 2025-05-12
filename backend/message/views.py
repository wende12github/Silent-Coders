from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import get_user_model
from django.db.models import Q, Max
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from datetime import datetime

from .models import ChatMessage, PrivateChatMessage
from .serializers import (
    ChatMessageSerializer,
    PrivateChatMessageSerializer,
    UserSerializer,
    PrivateConversationSerializer,
)


from groups.models import Group, GroupMembership

User = get_user_model()


user_serializer_swagger = UserSerializer()


class GroupChatMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get Group Chat Messages",
        operation_description="Retrieves messages for a specific group chat. Requires user to be a member of the group.",
        manual_parameters=[
            openapi.Parameter(
                "group_id",
                openapi.IN_PATH,
                description="ID of the group",
                type=openapi.TYPE_INTEGER,
            ),
            openapi.Parameter(
                "limit",
                openapi.IN_QUERY,
                description="Number of messages to return (default 50)",
                type=openapi.TYPE_INTEGER,
            ),
            openapi.Parameter(
                "offset",
                openapi.IN_QUERY,
                description="Number of messages to skip (for pagination)",
                type=openapi.TYPE_INTEGER,
            ),
        ],
        responses={
            200: openapi.Response(
                "List of group messages", ChatMessageSerializer(many=True)
            ),
            401: "Authentication failed",
            403: "User is not a member of the group",
            404: "Group not found",
        },
    )
    def get(self, request, group_id):
        limit = int(request.query_params.get("limit", 50))
        offset = int(request.query_params.get("offset", 0))

        try:
            group_id = int(group_id)
        except ValueError:
            return Response(
                {"error": "Invalid group ID format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from groups.models import GroupMembership

        if not GroupMembership.objects.filter(
            group_id=group_id, user=request.user
        ).exists():
            return Response(
                {"detail": "You are not a member of this group."},
                status=status.HTTP_403_FORBIDDEN,
            )

        messages = ChatMessage.objects.filter(room_id=group_id).order_by("-created_at")[
            offset : offset + limit
        ]
        serializer = ChatMessageSerializer(messages[::-1], many=True)
        return Response(serializer.data)


class PrivateChatMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get Private Chat Messages",
        operation_description="Retrieves messages between the authenticated user and another user.",
        manual_parameters=[
            openapi.Parameter(
                "user_id",
                openapi.IN_PATH,
                description="ID of the other user",
                type=openapi.TYPE_INTEGER,
            ),
            openapi.Parameter(
                "limit",
                openapi.IN_QUERY,
                description="Number of messages to return (default 50)",
                type=openapi.TYPE_INTEGER,
            ),
            openapi.Parameter(
                "offset",
                openapi.IN_QUERY,
                description="Number of messages to skip (for pagination)",
                type=openapi.TYPE_INTEGER,
            ),
        ],
        responses={
            200: openapi.Response(
                "List of private messages", PrivateChatMessageSerializer(many=True)
            ),
            400: "Bad request (e.g., chatting with self)",
            401: "Authentication failed",
            404: "User not found",
        },
    )
    def get(self, request, user_id):
        limit = int(request.query_params.get("limit", 50))
        offset = int(request.query_params.get("offset", 0))

        try:
            other_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if request.user == other_user:
            return Response(
                {"error": "Cannot retrieve private chat with yourself this way."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        messages = PrivateChatMessage.objects.filter(
            Q(sender=request.user, receiver=other_user)
            | Q(sender=other_user, receiver=request.user)
        ).order_by("-created_at")[offset : offset + limit]

        serializer = PrivateChatMessageSerializer(messages[::-1], many=True)
        return Response(serializer.data)


class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Send Message",
        operation_description="Sends a message to either a group or another user.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["message", "is_group_chat"],
            properties={
                "message": openapi.Schema(
                    type=openapi.TYPE_STRING, description="The message content."
                ),
                "is_group_chat": openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description="Set to true for group chat, false for private chat.",
                ),
                "group_id": openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description="Required if is_group_chat is true. ID of the group.",
                    nullable=True,
                ),
                "other_user_id": openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description="Required if is_group_chat is false. ID of the receiver user.",
                ),
                "message_type": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Type of message (e.g., 'text', 'voice'). Defaults to 'text'.",
                    enum=["text", "voice"],
                    default="text",
                ),
            },
            oneOf=[
                openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    required=["is_group_chat", "group_id"],
                    properties={
                        "is_group_chat": openapi.Schema(
                            type=openapi.TYPE_BOOLEAN, enum=[True]
                        )
                    },
                ),
                openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    required=["is_group_chat", "other_user_id"],
                    properties={
                        "is_group_chat": openapi.Schema(
                            type=openapi.TYPE_BOOLEAN, enum=[False]
                        )
                    },
                ),
            ],
        ),
        responses={
            201: "Message sent successfully",
            400: "Bad request (missing data or invalid ID)",
            401: "Authentication failed",
            403: "Not a member of the group (if group chat)",
            404: "Group or Receiver user not found",
        },
    )
    def post(self, request, *args, **kwargs):
        is_group_chat = request.data.get("is_group_chat", False)
        message = request.data.get("message")
        message_type = request.data.get("message_type", "text")

        if not message:
            return Response(
                {"error": "Message content is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if is_group_chat:
            group_id = request.data.get("group_id")

            if group_id is None:
                return Response(
                    {"error": "group_id is required for group chat."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                group_id = int(group_id)
            except (ValueError, TypeError):
                return Response(
                    {"error": "Invalid group ID format."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                group = Group.objects.get(id=group_id)

                from groups.models import (
                    GroupMembership,
                )

                if not GroupMembership.objects.filter(
                    group_id=group_id, user=request.user
                ).exists():
                    return Response(
                        {"detail": "You are not a member of this group."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

                chat_message = ChatMessage(
                    user=request.user,
                    room=group,
                    message=message,
                    message_type=message_type,
                )
                chat_message.save()

                serializer = ChatMessageSerializer(chat_message)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            except Group.DoesNotExist:
                return Response(
                    {"error": "Group not found."}, status=status.HTTP_404_NOT_FOUND
                )

        else:
            other_user_id = request.data.get("other_user_id")

            if other_user_id is None:
                return Response(
                    {"error": "other_user_id is required for private chat."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                other_user_id = int(other_user_id)
            except (ValueError, TypeError):
                return Response(
                    {"error": "Invalid user ID format."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                receiver = User.objects.get(id=other_user_id)

                if request.user == receiver:
                    return Response(
                        {"error": "Cannot send a private message to yourself."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                private_message = PrivateChatMessage(
                    sender=request.user,
                    receiver=receiver,
                    message=message,
                    message_type=message_type,
                )
                private_message.save()

                serializer = PrivateChatMessageSerializer(private_message)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            except User.DoesNotExist:
                return Response(
                    {"error": "Receiver user not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )


class UserPrivateConversationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="List Private Conversations",
        operation_description="Lists all users the authenticated user has had private conversations with, along with the last message timestamp, last message content, and unread count.",
        responses={
            200: openapi.Response(
                "List of private conversations",
                PrivateConversationSerializer(many=True),
            ),
            401: "Authentication failed",
        },
        definitions={"MessageUser": UserSerializer},
    )
    def get(self, request):
        user = request.user

        sent_to_users = PrivateChatMessage.objects.filter(sender=user).values_list(
            "receiver", flat=True
        )
        received_from_users = PrivateChatMessage.objects.filter(
            receiver=user
        ).values_list("sender", flat=True)

        all_conversation_user_ids = list(
            set(list(sent_to_users) + list(received_from_users))
        )

        if user.id in all_conversation_user_ids:
            all_conversation_user_ids.remove(user.id)

        conversation_users = User.objects.filter(id__in=all_conversation_user_ids)

        conversation_list = []
        for other_user in conversation_users:
            last_message = (
                PrivateChatMessage.objects.filter(
                    Q(sender=user, receiver=other_user)
                    | Q(sender=other_user, receiver=user)
                )
                .order_by("-created_at")
                .first()
            )

            unread_count = PrivateChatMessage.objects.filter(
                sender=other_user, receiver=user, is_read=False
            ).count()

            last_message_content = last_message.message if last_message else None
            last_message_timestamp = last_message.created_at if last_message else None

            conversation_list.append(
                {
                    "other_user": UserSerializer(other_user).data,
                    "last_message_timestamp": last_message_timestamp,
                    "last_message_content": last_message_content,
                    "unread_count": unread_count,
                }
            )

        from datetime import datetime

        conversation_list.sort(
            key=lambda x: (
                x["last_message_timestamp"]
                if x["last_message_timestamp"] is not None
                else datetime.min
            ),
            reverse=True,
        )

        serializer = PrivateConversationSerializer(conversation_list, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
